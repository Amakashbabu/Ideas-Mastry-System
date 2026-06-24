import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  TEMPLATES, 
  SavedIdea, 
  EvaluationResult, 
  FRAMEWORKS
} from "./types";
import { ScoreboardGauge } from "./components/ScoreboardGauge";
import { PillarGrid } from "./components/PillarGrid";
import { StorytellingArchitecture } from "./components/StorytellingArchitecture";
import { IdeaUpgradeEngine } from "./components/IdeaUpgradeEngine";
import { QaVerdictCard } from "./components/QaVerdictCard";
import { MarkdownReportExporter } from "./components/MarkdownReportExporter";
import { AiChatAssistant } from "./components/AiChatAssistant";
// Safe static path for user-provided image
const logoImg = "/src/assets/images/akash_profile.jpg";
import { 
  FileText, 
  Lightbulb, 
  ArrowRight, 
  Loader2, 
  FolderLock, 
  History, 
  Trash2, 
  Plus, 
  ExternalLink,
  Bot,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Youtube,
  User,
  Heart,
  Settings,
  Upload,
  Camera,
  Check,
  Lock,
  Unlock
} from "lucide-react";

export default function App() {
  // Application states
  const [rawIdea, setRawIdea] = useState<string>("");
  const [backendBusiness, setBackendBusiness] = useState<string>("SaaS");
  const [sourceContext, setSourceContext] = useState<string>("");
  const [bypassPhase1, setBypassPhase1] = useState<boolean>(false);
  const [forcePhase4, setForcePhase4] = useState<boolean>(false);

  // Creator profile branding states
  const [creatorName, setCreatorName] = useState<string>("Akash Babu");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("https://youtube.com/@AkashBabu");
  const [customAvatar, setCustomAvatar] = useState<string>("");

  const [logoError, setLogoError] = useState<boolean>(false);
  const [showProfileEdit, setShowProfileEdit] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [editYoutube, setEditYoutube] = useState<string>("");

  // Profile protection / lock states
  const [isProfileLocked, setIsProfileLocked] = useState<boolean>(false);
  const [verifiedPasscodeState, setVerifiedPasscodeState] = useState<string>("");
  const [tempNewPasscode, setTempNewPasscode] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");
  const [newPasscode, setNewPasscode] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Load global profile configurations from the server on mount
  useEffect(() => {
    const fetchGlobalProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.creatorName) setCreatorName(data.creatorName);
          if (data.youtubeUrl) setYoutubeUrl(data.youtubeUrl);
          if (data.customAvatar) setCustomAvatar(data.customAvatar);
          setIsProfileLocked(!!data.isLocked);
        }
      } catch (err) {
        console.error("Failed to load global creator profile:", err);
      }
    };
    fetchGlobalProfile();
  }, []);

  const handleUnlockProfile = async () => {
    try {
      const trimmed = passcodeInput.trim();
      const res = await fetch("/api/profile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ passcode: trimmed })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setIsUnlocked(true);
          setVerifiedPasscodeState(trimmed);
          setPasscodeError("");
          setPasscodeInput("");
        } else {
          setPasscodeError("Incorrect passcode. Please try again.");
        }
      } else {
        setPasscodeError("Server verification failed.");
      }
    } catch (e) {
      console.error("Passcode unlock error:", e);
      setPasscodeError("Unlock network error.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveStatus("Saving...");
      
      let finalIsLocked = isProfileLocked;
      let finalNewPasscode = tempNewPasscode;
      let finalCurrentPasscode = verifiedPasscodeState;

      // If a passcode was typed but not explicitly "Set", auto-set it on save
      if (!isProfileLocked && newPasscode.trim()) {
        finalIsLocked = true;
        finalNewPasscode = newPasscode.trim();
        finalCurrentPasscode = newPasscode.trim();
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          creatorName: editName.trim() || "Akash Babu",
          youtubeUrl: editYoutube.trim() || "https://youtube.com/@AkashBabu",
          customAvatar: customAvatar,
          isLocked: finalIsLocked,
          newPasscode: finalNewPasscode,
          currentPasscode: finalCurrentPasscode
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Save action failed.");
      }

      const data = await res.json();
      if (data.success) {
        setCreatorName(data.profile.creatorName);
        setYoutubeUrl(data.profile.youtubeUrl);
        setCustomAvatar(data.profile.customAvatar);
        setIsProfileLocked(data.profile.isLocked);
        setTempNewPasscode("");
        setNewPasscode(""); // clear input field
        setIsUnlocked(false);
        setShowProfileEdit(false);
      }
    } catch (err: any) {
      console.error("Save profile error:", err);
      alert(err.message || "Could not save profile configuration. Please make sure your passcode matches.");
    } finally {
      setSaveStatus("");
    }
  };

  useEffect(() => {
    setEditName(creatorName);
    setEditYoutube(youtubeUrl);
  }, [creatorName, youtubeUrl]);

  const avatarSrc = customAvatar || logoImg;

  // Evaluated output structures
  const [loading, setLoading] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<SavedIdea[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active step highlights for high level visual pipeline indicators
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);

  // Dynamic templates list state initialized with predefined static TEMPLATES
  const [dynamicTemplates, setDynamicTemplates] = useState<any[]>(TEMPLATES);
  const [blueprintsLoading, setBlueprintsLoading] = useState<boolean>(false);

  // Call API to generate fresh dynamic AI blueprints
  const generateAiBlueprints = async () => {
    setBlueprintsLoading(true);
    try {
      const response = await fetch("/api/blueprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error("Failed to generate dynamic blueprints.");
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setDynamicTemplates(data);
      }
    } catch (e) {
      console.error("Blueprint generation error:", e);
    } finally {
      setBlueprintsLoading(false);
    }
  };

  // Read saved local histories
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ideas_mastery_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to read local storage", e);
    }
  }, []);

  // Write history to localstorage
  const saveToHistory = (newResult: EvaluationResult, idea: string, business: string, source: string) => {
    try {
      const newItem: SavedIdea = {
        id: Date.now().toString(),
        rawIdea: idea,
        backendBusiness: business,
        sourceContext: source,
        evaluatedAt: new Date().toLocaleDateString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }),
        result: newResult
      };
      const updated = [newItem, ...history].slice(0, 30); // Limiting past logs to 30 elements
      setHistory(updated);
      localStorage.setItem("ideas_mastery_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed saving item to history", e);
    }
  };

  // Clear specific history
  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const filtered = history.filter((item) => item.id !== id);
      setHistory(filtered);
      localStorage.setItem("ideas_mastery_history", JSON.stringify(filtered));
      if (currentResult && history.find(h => h.id === id)?.result.rawMarkdownReport === currentResult.rawMarkdownReport) {
        setCurrentResult(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all history
  const clearAllHistories = () => {
    setHistory([]);
    localStorage.removeItem("ideas_mastery_history");
    setCurrentResult(null);
  };

  const loadTemplate = (title: string) => {
    const template = dynamicTemplates.find((t) => t.title === title);
    if (template) {
      setRawIdea(template.rawIdea);
      setBackendBusiness(template.business);
      setSourceContext(template.context);
      setBypassPhase1(template.bypass);
      setErrorMsg(null);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawIdea.trim()) {
      setErrorMsg("Please enter a raw content idea or topic to evaluate.");
      return;
    }
    if (!backendBusiness.trim()) {
      setErrorMsg("Please select a target backend business type.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setActivePipelineStep(1);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rawIdea,
          backendBusiness,
          sourceContext,
          bypassPhase1,
          forcePhase4
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Server connection failure. Please retry.");
      }

      const result: EvaluationResult = await response.json();
      setCurrentResult(result);

      // Animate steps for fun & visualization
      let stepTimer = 1;
      const interval = setInterval(() => {
        stepTimer += 1;
        setActivePipelineStep(stepTimer);
        if (stepTimer >= 5) {
          clearInterval(interval);
        }
      }, 350);

      saveToHistory(result, rawIdea, backendBusiness, sourceContext);

    } catch (err: any) {
      setErrorMsg(err.message || "An exception occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const selectHistoryItem = (item: SavedIdea) => {
    setRawIdea(item.rawIdea);
    setBackendBusiness(item.backendBusiness);
    setSourceContext(item.sourceContext);
    setCurrentResult(item.result);
    setErrorMsg(null);
    setActivePipelineStep(5);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans flex flex-col">
      {/* HEADER SECTION - PROFESSIONAL THEME MATCH */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 lg:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full border-2 border-slate-200 overflow-hidden shadow-sm flex items-center justify-center bg-slate-100 shrink-0 select-none">
            {!logoError && avatarSrc ? (
              <img 
                src={avatarSrc} 
                alt={creatorName} 
                onError={() => setLogoError(true)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-[15px]">
                {creatorName ? creatorName.split(" ").map(n => n[0]).join("") : "AB"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-tight font-display">Ideas Mastry System AI</h1>
            <p className="text-xs text-[#64748B] font-mono font-medium">v2.4 // Asset-Light Content Pipeline Architecture</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {creatorName && (
            <div className="flex flex-col items-end shrink-0 select-none">
              <span className="text-[9px] text-[#64748B] uppercase font-bold tracking-widest font-mono">App Creator</span>
              <a 
                href={youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 border border-red-150 px-3 py-1 rounded-full group cursor-pointer"
                title="Creator's YouTube Channel"
              >
                <Youtube className="w-3.5 h-3.5 text-red-600 shrink-0 transform group-hover:scale-110 transition-transform" />
                <span>{creatorName}</span>
                <ExternalLink className="w-2.5 h-2.5 text-red-400 opacity-80 shrink-0" />
              </a>
            </div>
          )}
          <div className="h-10 w-[1px] bg-[#E2E8F0] hidden sm:block"></div>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-widest font-mono">Framework Standards</p>
            <p className="text-xs font-semibold text-slate-700">5-Phase Core Verification Matrix</p>
          </div>
          <div className="h-10 w-[1px] bg-[#E2E8F0] hidden sm:block"></div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full shrink-0">
            <div className={`h-2.5 w-2.5 rounded-full ${loading ? "bg-amber-500 animate-pulse" : "bg-[#10B981]"}`}></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {loading ? "PROCESSING..." : "ENGINE ACTIVE"}
            </span>
          </div>
        </div>
      </header>

      {/* PIPELINE PROGRESS BAR */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-1.5">
            <div className={`flex-1 h-1 transition-all duration-500 ${activePipelineStep >= 1 ? "bg-[#0F172A]" : "bg-[#CBD5E1]"}`}></div>
            <div className={`flex-1 h-1 transition-all duration-500 ${activePipelineStep >= 2 ? "bg-[#0F172A]" : "bg-[#CBD5E1]"}`}></div>
            <div className={`flex-1 h-1 transition-all duration-500 ${activePipelineStep >= 3 ? "bg-[#0F172A]" : "bg-[#CBD5E1]"}`}></div>
            <div className={`flex-1 h-1 transition-all duration-500 ${activePipelineStep >= 4 ? "bg-[#0F172A]" : "bg-[#CBD5E1]"}`}></div>
            <div className={`flex-1 h-1 transition-all duration-500 ${activePipelineStep >= 5 ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`}></div>
          </div>
          <div className="flex justify-between mt-2.5 text-[9px] font-mono font-bold tracking-wider text-slate-500">
            <span className={activePipelineStep >= 1 ? "text-[#0F172A]" : ""}>PHASE 1: IDEA MINING</span>
            <span className={activePipelineStep >= 2 ? "text-[#0F172A]" : ""}>PHASE 2: PSYCH-SCORE</span>
            <span className={activePipelineStep >= 3 ? "text-[#0F172A]" : ""}>PHASE 3: STORYTELLING</span>
            <span className={activePipelineStep >= 4 ? "text-[#0F172A]" : ""}>PHASE 4: UPGRADE ENGINE</span>
            <span className={activePipelineStep >= 5 ? "text-emerald-600" : ""}>PHASE 5: QA VERDICT</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROL & INPUT CORES */}
        <section id="input-control-panel" className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* CREATOR BRANDING SPOTLIGHT WIDGET */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white p-4.5 rounded-xl shadow-md border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
              <span className="text-[9px] bg-red-500/10 text-red-400 font-mono font-bold px-2 py-0.5 rounded tracking-wider uppercase border border-red-500/20 flex items-center gap-1">
                <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500 animate-pulse" />
                <span>Creator Spotlight</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
                  {isProfileLocked ? (
                    <Lock className="w-2.5 h-2.5 text-amber-500" />
                  ) : (
                    <Unlock className="w-2.5 h-2.5 text-slate-500" />
                  )}
                  <span>{isProfileLocked ? "Locked" : "Verified"}</span>
                </span>
                <button
                  onClick={() => setShowProfileEdit(!showProfileEdit)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-350 hover:text-white transition-all cursor-pointer"
                  title="Configure Creator Profile & Image"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showProfileEdit ? (
              isProfileLocked && !isUnlocked ? (
                /* Passcode Lock Challenge Screen */
                <div className="space-y-3.5 mt-2 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Profile Protected</span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowProfileEdit(false);
                        setPasscodeError("");
                        setPasscodeInput("");
                      }}
                      className="text-[9px] text-slate-400 hover:text-white font-mono bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    This profile configuration is locked. Enter the secret passcode to unlock and make changes to the image or credentials:
                  </p>

                  <div className="space-y-1">
                    <input
                      type="password"
                      value={passcodeInput}
                      onChange={(e) => {
                        setPasscodeInput(e.target.value);
                        setPasscodeError("");
                      }}
                      placeholder="Enter lock passcode..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-white text-center font-mono focus:outline-hidden focus:border-slate-700 text-xs tracking-widest placeholder:tracking-normal placeholder:font-sans"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUnlockProfile();
                        }
                      }}
                    />
                    {passcodeError && (
                      <p className="text-[10px] text-red-400 font-bold text-center mt-1 select-none">{passcodeError}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleUnlockProfile}
                    className="w-full py-2.5 bg-amber-650 hover:bg-amber-600 text-white rounded-lg font-bold text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all border border-amber-500/10"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Verify & Unlock</span>
                  </button>
                </div>
              ) : (
                /* Edit Creator Form */
                <div className="space-y-3.5 mt-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.55">
                    <h4 className="font-bold text-slate-200 text-xs">Configure Creator Profile</h4>
                    <button 
                      onClick={() => {
                        setShowProfileEdit(false);
                        setIsUnlocked(false); // require unlocking again next time
                      }}
                      className="text-[9px] text-slate-400 hover:text-white font-mono bg-slate-800 px-2 py-0.5 rounded transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {/* File Upload / Image Selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Original Profile picture</label>
                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800 shrink-0 flex items-center justify-center relative select-none">
                        {!logoError && avatarSrc ? (
                          <img 
                            src={avatarSrc} 
                            alt={creatorName} 
                            onError={() => setLogoError(true)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-[13px]">
                            {creatorName ? creatorName.split(" ").map(n => n[0]).join("") : "AB"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer transition-all">
                          <Camera className="w-3 h-3 text-emerald-450" />
                          <span>Select Photo File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 2 * 1024 * 1024) {
                                  alert("Image size must be less than 2MB.");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64String = reader.result as string;
                                  setCustomAvatar(base64String);
                                  setLogoError(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden" 
                          />
                        </label>
                        {customAvatar && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomAvatar("");
                              setLogoError(false);
                            }}
                            className="text-[9px] text-red-400 hover:text-red-300 block font-medium transition-colors cursor-pointer"
                          >
                            Remove custom photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name setting */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Creator Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-white focus:outline-hidden focus:border-slate-700 text-xs font-semibold"
                    />
                  </div>

                  {/* Youtube link */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-slate-400">YouTube Channel URL</label>
                    <input
                      type="text"
                      value={editYoutube}
                      onChange={(e) => setEditYoutube(e.target.value)}
                      placeholder="https://youtube.com/@..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-300 focus:outline-hidden focus:border-slate-700 text-xs font-mono"
                    />
                  </div>

                  {/* Security / Password Lock Section */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500 font-bold flex items-center gap-1 select-none">
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Security Lock Protection</span>
                    </label>
                    
                    {isProfileLocked ? (
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Lock Engaged
                          </p>
                          <p className="text-[9px] text-slate-400 font-medium">Original image & profile are safe.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileLocked(false);
                            setTempNewPasscode("");
                          }}
                          className="text-[10px] font-bold bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white px-2.5 py-1.5 rounded-lg border border-red-900/30 transition-all cursor-pointer"
                        >
                          Disable Lock
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                        <p className="text-[9px] text-slate-400">Lock editing fields with a secret passcode:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newPasscode}
                            onChange={(e) => setNewPasscode(e.target.value)}
                            placeholder="Passcode PIN (e.g. 1234)"
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5 text-white focus:outline-hidden focus:border-slate-700 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const code = newPasscode.trim();
                              if (!code) {
                                alert("Please type a valid passcode!");
                                return;
                              }
                              setIsProfileLocked(true);
                              setTempNewPasscode(code);
                              setVerifiedPasscodeState(code);
                              setNewPasscode("");
                            }}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] px-3 py-1 rounded-lg transition-all cursor-pointer shrink-0"
                          >
                            Set Lock
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save action */}
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saveStatus === "Saving..."}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg font-bold text-center flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all border border-emerald-500/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{saveStatus === "Saving..." ? "Saving to Server..." : "Apply & Save Profile"}</span>
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center bg-slate-800 select-none">
                    {!logoError && avatarSrc ? (
                      <img 
                        src={avatarSrc} 
                        alt={creatorName} 
                        onError={() => setLogoError(true)}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-[14px]">
                        {creatorName ? creatorName.split(" ").map(n => n[0]).join("") : "AB"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                      {creatorName}
                      <span className="text-[9px] font-normal text-slate-400">(Creator)</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">I custom engineered this content generator tool!</p>
                  </div>
                </div>

                <div className="relative w-full select-none">
                  {/* Pulsing visual cues to capture viewer's sub intent */}
                  <div className="absolute -inset-0.5 rounded-xl bg-red-600/30 blur-sm animate-pulse-slow"></div>
                  
                  <motion.a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full py-2.5 px-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md cursor-pointer overflow-hidden border border-red-500/30 group"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{ 
                      scale: 1.04,
                      boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.45)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Sweeping dynamic glossy light bar across the button */}
                    <motion.div 
                      className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                      style={{ skewX: "-25deg" }}
                      animate={{
                        left: ["-100%", "200%"]
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        repeatDelay: 3.5,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Interactive animated play icon */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.15, 1, 1.15, 1],
                        rotate: [0, -8, 8, -8, 0]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        repeatDelay: 4.5,
                        ease: "easeInOut"
                      }}
                    >
                      <Youtube className="w-4 h-4 text-white shrink-0 fill-white/10" />
                    </motion.div>
                    
                    <span className="tracking-wide">Subscribe to My YouTube Channel</span>
                    <ExternalLink className="w-3 h-3 text-white/90 shrink-0" />
                  </motion.a>
                </div>
              </div>
            )}
          </div>

          {/* QUICK DEMO TEMPLATES */}
          <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase font-mono text-[#64748B] font-bold tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Quick Fill Blueprints
              </h3>
              <button
                type="button"
                onClick={generateAiBlueprints}
                disabled={blueprintsLoading}
                className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 disabled:opacity-60 px-2 py-1 rounded flex items-center gap-1 transition-all focus:outline-none shrink-0"
                title="Generate 3 absolutely new custom idea blueprints dynamically!"
              >
                <Sparkles className={`w-3 h-3 text-emerald-500 ${blueprintsLoading ? "animate-spin" : ""}`} />
                {blueprintsLoading ? "Generating..." : "AI Refresh"}
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 mb-3 leading-tight">
              Pre-defined samples designed to test the app. Click "AI Refresh" above to generate 3 absolutely new custom blueprints dynamically!
            </p>

            <div className="flex flex-col gap-2">
              {dynamicTemplates.map((t) => (
                <button
                  key={t.title}
                  onClick={() => loadTemplate(t.title)}
                  className="w-full text-left text-xs bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors p-2.5 rounded-lg font-medium text-slate-700 flex justify-between items-center group"
                >
                  <span className="truncate pr-2">{t.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0F172A] shrink-0 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* INPUT DATA CARD */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] bg-[#F1F5F9] px-2 py-1 font-bold rounded text-[#475569] tracking-wider uppercase font-mono">
                Pipeline Settings
              </span>
              <span className="text-[10px] bg-slate-900 text-white font-mono font-bold px-2 py-0.5 rounded">
                INPUT ENGINE
              </span>
            </div>

            <form onSubmit={handleEvaluate} className="space-y-4">
              {/* Raw Idea Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-mono">
                  1. Raw content idea (विचार / विषय)*
                </label>
                <textarea
                  value={rawIdea}
                  onChange={(e) => {
                    setRawIdea(e.target.value);
                    setErrorMsg(null);
                  }}
                  rows={4}
                  placeholder="जैसे: Why traditional agency payroll is dying & replacing manual task managers with AI hooks code scripts..."
                  className="w-full text-sm bg-[#F8FAFC] border border-[#E2E8F0] focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none p-3 rounded-lg text-slate-800 placeholder:text-slate-400 leading-normal"
                />
              </div>

              {/* Backend Business */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-mono">
                  2. Backend Business Model (बिजनेस मॉडल)*
                </label>
                <select
                  value={backendBusiness}
                  onChange={(e) => setBackendBusiness(e.target.value)}
                  className="w-full text-sm bg-[#F8FAFC] border border-[#E2E8F0] focus:border-slate-900 focus:outline-none p-2.5 rounded-lg text-slate-800 font-medium"
                >
                  <option value="SaaS">SaaS Platform (Self-serve / High Margin)</option>
                  <option value="Agency">Agency (Systems / Implementation)</option>
                  <option value="Consulting">Consulting (Advisory, Retainers, Co-investment)</option>
                  <option value="Infoproduct">Info-Product & Elite Memberships</option>
                </select>
              </div>

              {/* Source Context */}
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wide mb-1 font-mono">
                  3. Source / Context (मूल स्रोत)*
                </label>
                <input
                  type="text"
                  value={sourceContext || ""}
                  onChange={(e) => setSourceContext(e.target.value)}
                  placeholder="e.g., Client results, competitive gap analysis, custom frustration point..."
                  className="w-full text-xs bg-[#F8FAFC] border border-[#E2E8F0] focus:border-slate-900 focus:outline-none p-2.5 rounded-lg text-slate-800"
                />
              </div>

              {/* Advanced Flags */}
              <div className="pt-2 border-t border-[#F1F5F9] space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={bypassPhase1}
                    onChange={(e) => setBypassPhase1(e.target.checked)}
                    className="mt-0.5 rounded text-slate-900 focus:ring-slate-950 border-slate-300 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block leading-tight font-sans">
                      Skip Phase 1 (Bypass Rules)
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Bypass to Phase 2 with high novelty validation bias (uses real-story/client success rules)
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={forcePhase4}
                    onChange={(e) => setForcePhase4(e.target.checked)}
                    className="mt-0.5 rounded text-slate-900 focus:ring-slate-950 border-slate-300 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block leading-tight font-sans">
                      Enforce Phase 4 Re-Engineering
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Generates 3 premium upgraded angles on elite green scores too
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit Error */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0F172A] text-white hover:bg-black font-display font-medium rounded-lg text-sm text-center flex items-center justify-center gap-2.5 shadow-sm transition-all disabled:opacity-80 active:translate-y-px"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                    <span>ENGINE EVALUATING...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>CORE PIPELINE PROCESS</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* HISTORIES / LOGS DATABASE */}
          <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm flex flex-col max-h-[350px]">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 mb-3">
              <h3 className="text-xs uppercase font-mono text-[#64748B] font-bold tracking-wider flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Evaluated History ({history.length})
              </h3>
              {history.length > 0 && (
                <button
                  onClick={clearAllHistories}
                  className="text-[10px] font-mono text-rose-500 hover:text-rose-700 hover:underline font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                No past processes stored temporarily in this session.
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                {history.map((item) => {
                  const rating = item.result.phase2.totalScore;
                  const isGreen = item.result.phase5.finalVerdict === "GREEN";
                  const badgeColor = isGreen ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";

                  return (
                    <div
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className="p-3 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] rounded-xl cursor-pointer transition-all flex flex-col justify-between task-history-item hover:shadow-xs group"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${badgeColor}`}>
                          SCORE {rating}/30 • {item.result.phase5.finalVerdict}
                        </span>
                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                          title="Delete index item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                        {item.rawIdea}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1.5 border-t border-slate-200/50">
                        <span>{item.backendBusiness}</span>
                        <span>{item.evaluatedAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: DETAILED 5-PHASE RESULT DASHBOARD */}
        <section id="results-display-dashboard" className="lg:col-span-8 space-y-6">
          
          {loading ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-xs flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-[#0F172A]" />
                <Bot className="w-6 h-6 text-emerald-500 absolute top-3 left-3" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold font-display uppercase tracking-tight text-[#0F172A]">
                  Pipelines Under Analysis
                </h3>
                <p className="text-sm text-[#64748B] max-w-md mx-auto whitespace-pre-line">
                  AI is mapping psychological scores (जिज्ञासा, दांव/FOMO, नयापन) and generating strategic storyteller structures.
                </p>
              </div>
              <div className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-slate-600 px-4 py-1.5 rounded-full font-mono">
                Running 5-Phase validation matrix on local systems...
              </div>
            </div>
          ) : currentResult ? (
            <div className="space-y-6 transition-all duration-700 animate-fade-in">
              
              {/* PRIMARY STATS SUMMARY BANNER */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0F172A]" />
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] bg-[#F1F5F9] px-2.5 py-1 font-bold rounded text-[#475569] font-mono tracking-widest uppercase">
                      Analysis Asset
                    </span>
                    <span className="text-[11px] text-[#64748B] font-mono">
                      Target: {backendBusiness} Business Models
                    </span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold font-display leading-tight text-[#0f172a] mt-3">
                    "{rawIdea}"
                  </h2>
                  
                  {/* Phase 1 Validation Log */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded font-mono uppercase">
                      Phase 1 Origin
                    </span>
                    <div className="text-xs text-slate-700 leading-normal">
                      <strong className="text-slate-900 font-semibold block sm:inline mr-1">
                        {currentResult.phase1.origin}:
                      </strong>
                      <span>{currentResult.phase1.justification}</span>
                    </div>
                  </div>
                </div>

                {/* Score Circle Widget on right side */}
                <div className="shrink-0 flex items-center justify-center">
                  <ScoreboardGauge 
                    score={currentResult.phase2.totalScore} 
                    verdict={currentResult.phase5.finalVerdict} 
                  />
                </div>
              </div>

              {/* PHASE 2: PILLARS MATRIX */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-mono">
                    Phase 2: 6 Psychological Pillars Evaluation
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    Scale: 1 = Poor, 5 = Premium Elite
                  </span>
                </div>
                <PillarGrid scores={currentResult.phase2.scores} />
              </div>

              {/* PHASE 3: STORIES ARCHITECTURE */}
              <div id="phase3-display">
                <StorytellingArchitecture data={currentResult.phase3} />
              </div>

              {/* PHASE 4: IDEA ENGINEERING UPGRADE (Conditionally rendered/generated) */}
              <div id="phase4-display">
                <IdeaUpgradeEngine data={currentResult.phase4} />
              </div>

              {/* PHASE 5: QA CHECKLIST TEST */}
              <div id="phase5-display">
                <QaVerdictCard data={currentResult.phase5} />
              </div>

              {/* RAW EXPORT REPORT AND SAVED ACTIONS */}
              <div id="export-display">
                <MarkdownReportExporter markdownText={currentResult.rawMarkdownReport} />
              </div>

            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] border-dashed rounded-2xl p-16 justify-center flex flex-col items-center text-center shadow-xs">
              <Bot className="w-12 h-12 text-[#64748B] mb-4.5" />
              <h3 className="text-base font-bold text-slate-800 font-display">No Idea Active yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Load an idea from the "Quick Fill Blueprints" above or type your own concept, then press "Core Pipeline Process" to run the evaluation.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2.5 items-center justify-center">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded border border-slate-200">
                  ⚡ Auto English Outputs
                </span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded border border-slate-200">
                  📁 Local History Logs
                </span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded border border-slate-200">
                  🧪 Asset-Light Validation
                </span>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* FOOTER ACTIONS BAR */}
      <footer className="bg-white border-t border-[#E2E8F0] px-6 lg:px-12 py-5 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-[#94A3B8] font-bold font-mono tracking-wider text-center sm:text-left uppercase">
          FRAMEWORK LOCK: <span className="text-[#0F172A]">5-Phase Content Pipeline</span> | Real Identity Safeguard
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 font-mono hidden sm:inline">
            Ideas Mastery Engine v2.4
          </span>
          <a
            href="https://ai.studio/build"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-black font-semibold hover:underline"
          >
            Google AI Studio Build
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>
      <AiChatAssistant currentIdea={rawIdea} backendBusiness={backendBusiness} />
    </div>
  );
}
