export interface PillarScore {
  score: number;
  justification: string;
}

export interface PsychologicalScores {
  curiosity: PillarScore;
  stakes: PillarScore;
  outcome: PillarScore;
  novelty: PillarScore;
  desire: PillarScore;
  shareability: PillarScore;
}

export interface Phase1Data {
  origin: string;
  justification: string;
  bypassed: boolean;
}

export interface Phase2Data {
  scores: PsychologicalScores;
  totalScore: number;
  verdict: 'GREEN' | 'YELLOW' | 'RED';
  verdictReason: string;
}

export interface Phase3Data {
  frameworkId: number;
  frameworkName: string;
  frameworkHeading: string;
  retentionHook: string;
  whySelected: string;
}

export interface HookDetail {
  title: string;
  body: string;
  assetLightCheck: string;
}

export interface Phase4Data {
  engineered: boolean;
  hooks?: {
    counterIntuitive: HookDetail;
    zoomIn: HookDetail;
    zoomOut: HookDetail;
  };
}

export interface QaTest {
  pass: boolean;
  feedback: string;
}

export interface Phase5Data {
  clickTest: QaTest;
  strangerTest: QaTest;
  shareTest: QaTest;
  audienceFitTest: QaTest;
  finalVerdict: 'GREEN' | 'YELLOW' | 'RED';
  trendVelocity: 'HIGH' | 'LOW';
}

export interface EvaluationResult {
  phase1: Phase1Data;
  phase2: Phase2Data;
  phase3: Phase3Data;
  phase4: Phase4Data;
  phase5: Phase5Data;
  rawMarkdownReport: string;
}

export interface SavedIdea {
  id: string;
  rawIdea: string;
  backendBusiness: string;
  sourceContext: string;
  evaluatedAt: string;
  result: EvaluationResult;
}

export interface IdeaTemplate {
  title: string;
  rawIdea: string;
  business: string;
  context: string;
  bypass: boolean;
}

export const TEMPLATES: IdeaTemplate[] = [
  {
    title: "SaaS: Automated Client Loom Reports",
    rawIdea: "How we automated our agency client reporting using automated Loom script generators and recorded videos, cutting manual call hours by 40%.",
    business: "SaaS",
    context: "Client case study. Our actual operations results from May 2026.",
    bypass: true
  },
  {
    title: "Agency: AI Lead Scraping engine",
    rawIdea: "Why manual database lead scraping is a burning dump of time: My blueprint of building local web-scraping agents running on $5/mo Raspberry Pi to extract verified company listings.",
    business: "Agency",
    context: "Friction Mining: Targeting busy agency founders losing money on costly lead databases.",
    bypass: false
  },
  {
    title: "Consulting: Retainer models are dead",
    rawIdea: "High-paid retainers are a lazy corporate lie. Here is how backend consulting models shifting to equity + performance commissions are printing 10x ROI for our partners.",
    business: "Consulting",
    context: "Outlier Formula: Challenging established LinkedIn business wisdom with bold data.",
    bypass: false
  }
];

export const FRAMEWORKS: Record<number, { hindi: string; icon: string; desc: string }> = {
  1: { hindi: "मुश्किल चुनौती", icon: "🏆", desc: "Setting a brutal task with low odds and chronicling the actual resolution." },
  2: { hindi: "Before vs After का सफर", icon: "🔄", desc: "Revealing the exact, contrast-driven transformation from struggle to solution." },
  3: { hindi: "लाइव प्रयोग और सच", icon: "🧪", desc: "Testing a hypothesis out in the real marketplace with authentic live evidence." },
  4: { hindi: "A vs B का मुकाबला", icon: "⚔️", desc: "Pitting two philosophies, software integrations, or frameworks against each other." },
  5: { hindi: "ऐतिहासिक कामयाबी का पोस्टमार्टम", icon: "📁", desc: "Deconstructing massive industry failures or historic case study wins." },
  6: { hindi: "सिनेमैटिक और डीप-रिसर्च", icon: "🎬", desc: "A cinematic, deeply researched, narrative-heavy documentary styling." },
  7: { hindi: "डेटा-बैकड भविष्य की भविष्यवाणी", icon: "🔮", desc: "Predicting future macro shifts using proprietary graphs or verifiable indicators." }
};
