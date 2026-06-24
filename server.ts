import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow parsed JSON bodies up to 10MB to support Base64 photo configurations securely
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

import fs from "fs";

const PROFILE_FILE = path.join(process.cwd(), "profile.json");

function readProfile() {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      const data = fs.readFileSync(PROFILE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading profile.json:", e);
  }
  return {
    creatorName: "Akash Babu",
    youtubeUrl: "https://youtube.com/@AkashBabu",
    customAvatar: "",
    lockPasscode: "",
    isLocked: false
  };
}

function writeProfile(profile: any) {
  try {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing profile.json:", e);
  }
}

// GET Creator Profile Configuration
app.get("/api/profile", (req, res) => {
  const profile = readProfile();
  res.json({
    creatorName: profile.creatorName || "Akash Babu",
    youtubeUrl: profile.youtubeUrl || "https://youtube.com/@AkashBabu",
    customAvatar: profile.customAvatar || "",
    isLocked: !!profile.isLocked
  });
});

// POST Creator Profile Configuration with safety passcode check
app.post("/api/profile", (req, res) => {
  try {
    const { creatorName, youtubeUrl, customAvatar, isLocked, newPasscode, currentPasscode } = req.body;
    const profile = readProfile();

    // Verify passcode if profile is already locked
    if (profile.isLocked) {
      if (!currentPasscode || currentPasscode.trim() !== (profile.lockPasscode || "").trim()) {
        return res.status(403).json({ error: "Access Denied: Incorrect safety lock passcode." });
      }
    }

    if (creatorName !== undefined) profile.creatorName = creatorName.trim() || "Akash Babu";
    if (youtubeUrl !== undefined) profile.youtubeUrl = youtubeUrl.trim() || "https://youtube.com/@AkashBabu";
    if (customAvatar !== undefined) profile.customAvatar = customAvatar;

    if (isLocked !== undefined) {
      profile.isLocked = !!isLocked;
      if (isLocked) {
        if (newPasscode && newPasscode.trim()) {
          profile.lockPasscode = newPasscode.trim();
        }
      } else {
        profile.lockPasscode = "";
      }
    }

    writeProfile(profile);

    return res.json({
      success: true,
      profile: {
        creatorName: profile.creatorName,
        youtubeUrl: profile.youtubeUrl,
        customAvatar: profile.customAvatar,
        isLocked: profile.isLocked
      }
    });

  } catch (error: any) {
    console.error("Server Profile save failed:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred during profile save." });
  }
});

// GET profile locked status or verify passcode PIN securely
app.post("/api/profile/verify", (req, res) => {
  try {
    const { passcode } = req.body;
    const profile = readProfile();
    
    if (!profile.isLocked) {
      return res.json({ valid: true, isLocked: false });
    }
    
    if (passcode && passcode.trim() === (profile.lockPasscode || "").trim()) {
      return res.json({ valid: true, isLocked: true });
    }
    
    return res.json({ valid: false, isLocked: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Verification check failed." });
  }
});

// Initialize Gemini SDK lazily (as recommended to avoid crash if API key is temporarily missing during setup)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Resilient model fallback and retry logic to gracefully bypass 503 Service Unavailable / High demand errors
async function generateWithFallbackAndRetry(
  ai: GoogleGenAI,
  contents: any,
  config: any
) {
  const models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Ideas Mastery AI] Attempting evaluation using model: ${model} (Attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        if (response && response.text) {
          console.log(`[Ideas Mastery AI] Successfully generated content with model: ${model}`);
          return response;
        }
        throw new Error("Empty text returned from Google GenAI client.");
      } catch (err: any) {
        lastError = err;
        const errorMessage = err?.message || String(err);
        const isTransient = 
          errorMessage.includes("503") || 
          errorMessage.includes("UNAVAILABLE") || 
          errorMessage.includes("demand") || 
          errorMessage.includes("429") ||
          errorMessage.includes("RESOURCE_EXHAUSTED") ||
          err?.status === 503 ||
          err?.status === 429;

        console.warn(`[Ideas Mastery AI] Error with model ${model} (attempt ${attempt}):`, errorMessage);

        if (isTransient && attempt < maxRetries) {
          const delay = attempt * 1200;
          console.log(`[Ideas Mastery AI] Transient error matching condition. Waiting ${delay}ms before retrying same model...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Break to try the next model fallback
          break;
        }
      }
    }
  }

  throw lastError || new Error("Failed to evaluate concept after exhaustively attempting multiple Gemini models.");
}

// API endpoint to evaluate ideas
app.post("/api/evaluate", async (req, res) => {
  try {
    const { rawIdea, backendBusiness, sourceContext, bypassPhase1, forcePhase4 } = req.body;

    if (!rawIdea || !backendBusiness) {
      return res.status(400).json({ error: "rawIdea and backendBusiness are required fields." });
    }

    const ai = getGeminiClient();

    const promptMessage = `
You are the "Ideas Mastery AI Engine"—a world-class content architect, growth strategist, and asset-light business consultant. Your sole purpose is to transform raw, mood-driven content ideas into highly predictable, data-driven revenue assets for a backend business (${backendBusiness}) using the strict "5-Phase Content Pipeline" framework.

Evaluate the following user input through the 5 sequential phases:
- **Raw Idea**: "${rawIdea}"
- **Backend Business Type / Model**: "${backendBusiness}"
- **Source/Context of the Idea**: "${sourceContext || "Not specified"}"
- **Phase 1 Bypass Requested**: ${bypassPhase1 ? "YES" : "NO"}
- **Force Phase 4 Upgrade**: ${forcePhase4 ? "YES" : "NO"}

**Rules of Enforcement for the response**:
1. Evaluate Phase 1: Identify if the idea origin matches Outlier Formula (higher avg views/engagement) or Friction Mining ("too complex", "frustrated with"). Exception Rule: If "bypassPhase1" is true OR the context/idea explicitly indicates real-life data, case study, or client results, skip Phase 1 validation and proceed to Phase 2 with raw novelty & desire bias.
2. Evaluate Phase 2: Give strict 1-5 ratings for each pillar (Curiosity, Stakes, Outcome, Novelty, Audience Desire, Shareability). Output a justification in clear English. Calculate the total score out of 30.
   - 🟢 Score 24-30: Elite Idea! Safe to output directly as GREEN.
   - 🟡 Score 15-23: Average Idea. Proceed to Phase 4 (Upgrade Engine) to re-engineer.
   - 🔴 Score < 15: Dead Idea. Flag as RED and stop pipeline.
3. Evaluate Phase 3: Pick the single framework from the 7 (The Challenge, The Transformation, The Experiment, The Comparison, The Case Study, The Documentary, The Prediction) that best fits the idea. Give a custom hook, recommended title/heading, outline, and why it was chosen.
4. Evaluate Phase 4: Upgrade the idea into 3 distinct hooks (Counter-Intuitive Flip, Zoom-In, Zoom-Out). Highlight how it complies with the "Asset-Light Check" (maximum impact, low operational cost/burnout). Execute this if score is yellow (15-23) OR if forcePhase4 is requested.
5. Evaluate Phase 5 (QA Test): Pass/Fail check on Click, Stranger, Share, and Audience Fit tests. Provide a professional feedback note in English for each test. Output the final verdict status (GREEN 4/4, YELLOW 3/4, RED <=2/4) and Trend Velocity Tag (HIGH or LOW).
6. Create an elegant, markdown formatted raw text report in clean, professional English, complete with structured markdown tables, clear separator horizontal rules, rich headings, and bullet points. This will be shown directly in the UI as a copying asset! Do not use generic layout references; customize the language to be conversational, sharp, analytical, and professional, utilizing bold headings and horizontal lines (---).

You MUST return a JSON object adhering strictly to the response schema. Keep all responses highly actionable, premium, professional, and business-focused.
`;

    // Define response schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        phase1: {
          type: Type.OBJECT,
          properties: {
            origin: { type: Type.STRING, description: "Origin type: Outlier Formula, Friction Mining, or Bypass (Case Study / Real Data)" },
            justification: { type: Type.STRING, description: "Detailed origin explanation in English" },
            bypassed: { type: Type.BOOLEAN, description: "Whether the bypass rule was triggered" }
          },
          required: ["origin", "justification", "bypassed"]
        },
        phase2: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                curiosity: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, justification: { type: Type.STRING } },
                  required: ["score", "justification"]
                },
                stakes: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, justification: { type: Type.STRING } },
                  required: ["score", "justification"]
                },
                outcome: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, justification: { type: Type.STRING } },
                  required: ["score", "justification"]
                },
                novelty: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, justification: { type: Type.STRING } },
                  required: ["score", "justification"]
                },
                desire: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, justification: { type: Type.STRING } },
                  required: ["score", "justification"]
                },
                shareability: {
                  type: Type.OBJECT,
                  properties: { score: { type: Type.INTEGER }, justification: { type: Type.STRING } },
                  required: ["score", "justification"]
                }
              },
              required: ["curiosity", "stakes", "outcome", "novelty", "desire", "shareability"]
            },
            totalScore: { type: Type.INTEGER, description: "Sum of scores (6 to 30)" },
            verdict: { type: Type.STRING, description: "GREEN, YELLOW, or RED" },
            verdictReason: { type: Type.STRING, description: "A highly sharp final verdict summary in English explaining the score" }
          },
          required: ["scores", "totalScore", "verdict", "verdictReason"]
        },
        phase3: {
          type: Type.OBJECT,
          properties: {
            frameworkId: { type: Type.INTEGER, description: "1 to 7 corresponding to the selected storytelling architecture" },
            frameworkName: { type: Type.STRING, description: "Name of architecture framework selected" },
            frameworkHeading: { type: Type.STRING, description: "A killer, high-converting recommended heading or hook for this framework" },
            retentionHook: { type: Type.STRING, description: "Retention architecture / outline structure" },
            whySelected: { type: Type.STRING, description: "Analytical justification in English for selecting this custom structural format" }
          },
          required: ["frameworkId", "frameworkName", "frameworkHeading", "retentionHook", "whySelected"]
        },
        phase4: {
          type: Type.OBJECT,
          properties: {
            engineered: { type: Type.BOOLEAN, description: "Flag indicating if engineering upgrade was generated/executed" },
            hooks: {
              type: Type.OBJECT,
              properties: {
                counterIntuitive: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Bold headline that challenges conventional industry thoughts" },
                    body: { type: Type.STRING, description: "Script hook or lead-in copy in English" },
                    assetLightCheck: { type: Type.STRING, description: "Asset-light analysis showing how to execute this with low operational effort" }
                  },
                  required: ["title", "body", "assetLightCheck"]
                },
                zoomIn: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Hyper-focused, specific sub-topic angle headline" },
                    body: { type: Type.STRING, description: "Script hook or lead-in copy in English" },
                    assetLightCheck: { type: Type.STRING, description: "Asset-light explanation for zoom in execution" }
                  },
                  required: ["title", "body", "assetLightCheck"]
                },
                zoomOut: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "High-level macro perspective connecting daily issues to large business impacts" },
                    body: { type: Type.STRING, description: "Script hook or lead-in copy in English" },
                    assetLightCheck: { type: Type.STRING, description: "Asset-light check demonstrating macro scale execution" }
                  },
                  required: ["title", "body", "assetLightCheck"]
                }
              },
              required: ["counterIntuitive", "zoomIn", "zoomOut"]
            }
          },
          required: ["engineered"]
        },
        phase5: {
          type: Type.OBJECT,
          properties: {
            clickTest: {
              type: Type.OBJECT,
              properties: { pass: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
              required: ["pass", "feedback"]
            },
            strangerTest: {
              type: Type.OBJECT,
              properties: { pass: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
              required: ["pass", "feedback"]
            },
            shareTest: {
              type: Type.OBJECT,
              properties: { pass: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
              required: ["pass", "feedback"]
            },
            audienceFitTest: {
              type: Type.OBJECT,
              properties: { pass: { type: Type.BOOLEAN }, feedback: { type: Type.STRING } },
              required: ["pass", "feedback"]
            },
            finalVerdict: { type: Type.STRING, description: "GREEN (4/4), YELLOW (3/4), or RED (<=2)" },
            trendVelocity: { type: Type.STRING, description: "HIGH or LOW velocity trend value" }
          },
          required: ["clickTest", "strangerTest", "shareTest", "audienceFitTest", "finalVerdict", "trendVelocity"]
        },
        rawMarkdownReport: { type: Type.STRING, description: "Complete elegantly formatted report in markdown with English tone, headings, tables, and rules" }
      },
      required: ["phase1", "phase2", "phase3", "phase4", "phase5", "rawMarkdownReport"]
    };

    const response = await generateWithFallbackAndRetry(ai, promptMessage, {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    const evaluation = JSON.parse(responseText.trim());
    return res.json(evaluation);

  } catch (error: any) {
    console.error("Evaluation error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred during valuation." });
  }
});

// API endpoint for interactive coaching chat assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentIdea, backendBusiness } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
You are the "Ideas Mastery AI Coach"—an elite, direct, and encouraging content sparring partner.
Your role: Help users brainstorm high-performing content ideas, fine-tune their hooks, increase dynamic tension, and convert views into backend revenue (SaaS, Agency, Consulting, Infoproducts).
You are extremely tactical. Instead of writing generalities, share real headline formulas, hook lead-ins, or psychological reframing ideas.
Always answer in a highly responsive, fluent, and encouraging English language style, keeping it professional, concise, and structured. Outlier strategies must be explained in clear, world-class professional English, ensuring all bullet points, titles, and headers are styled cleanly.

Active Context of User's Current Session:
- Raw Idea under review: "${currentIdea || "No idea loaded yet"}"
- Target Backend Model: "${backendBusiness || "Not specified"}"
`;

    // Map messages payload to Google GenAI Content form
    const recentMessages = messages.slice(-15);
    const contents = recentMessages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await generateWithFallbackAndRetry(ai, contents, {
      systemInstruction,
      temperature: 0.7,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from the Gemini model.");
    }

    return res.json({ response: responseText });

  } catch (error: any) {
    console.error("Chat routing error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred in your chat session." });
  }
});

// API endpoint for generating 3 dynamic AI content blueprints / templates
app.post("/api/blueprints", async (req, res) => {
  try {
    const ai = getGeminiClient();

    const systemInstruction = `
You are the "Mastery Blueprint Architect". Your goal is to generate 3 totally fresh, high-performing, realistic, and highly compelling business content ideas/blueprints.
Each blueprint represents potential virality for Indian developers, creators, marketers, or business founders.
Generate high-quality ideas across modern tech, AI, SaaS, content creation, solopreneurship, marketing, or tech consulting domains.
Make them extremely realistic, exciting, and specific (no generic placeholder text). Show clear desire paths.
Each blueprint should be returned in the requested JSON schema format.
`;

    const blueprintListSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy short title prefix followed by concept, e.g. 'SaaS: Micro-SaaS CRM' or 'Consulting: The $10k Retention Loop'" },
          rawIdea: { type: Type.STRING, description: "A detailed but punchy 1-2 sentence real-world content/business idea in English." },
          business: { type: Type.STRING, description: "Either 'SaaS', 'Agency', or 'Consulting'" },
          context: { type: Type.STRING, description: "Origin/framework context (e.g. 'Friction mining: high client churn', 'Outlier formula: viral thread')" },
          bypass: { type: Type.BOOLEAN, description: "True if it starts with strong real data/case study, otherwise false." }
        },
        required: ["title", "rawIdea", "business", "context", "bypass"]
      }
    };

    const response = await generateWithFallbackAndRetry(ai, "Generate 3 highly clickable and fresh content idea blueprints for digital creators or software founders.", {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: blueprintListSchema,
      temperature: 0.95, // Higher temp for creative variety!
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    const blueprints = JSON.parse(responseText.trim());
    return res.json(blueprints);

  } catch (error: any) {
    console.error("Blueprints generation error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred during blueprint generation." });
  }
});

// Serve assets and static files
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ideas Mastery AI Server is running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
});
