import React from "react";
import { PsychologicalScores, PillarScore } from "../types";
import { Sparkles, AlertTriangle, CheckCircle, Lightbulb, Users, Share2 } from "lucide-react";

interface PillarGridProps {
  scores: PsychologicalScores;
}

interface PillarConfig {
  key: keyof PsychologicalScores;
  name: string;
  hindi: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PillarGrid: React.FC<PillarGridProps> = ({ scores }) => {
  const pillars: PillarConfig[] = [
    {
      key: "curiosity",
      name: "Curiosity",
      hindi: "जिज्ञासा",
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-white",
      borderColor: "border-[#E2E8F0]",
    },
    {
      key: "stakes",
      name: "Stakes",
      hindi: "दांव/FOMO",
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      color: "from-rose-500 to-red-500",
      bgColor: "bg-white",
      borderColor: "border-[#E2E8F0]",
    },
    {
      key: "outcome",
      name: "Outcome",
      hindi: "नतीजा",
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-white",
      borderColor: "border-[#E2E8F0]",
    },
    {
      key: "novelty",
      name: "Novelty",
      hindi: "नयापन",
      icon: <Lightbulb className="w-5 h-5 text-amber-600" />,
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-white",
      borderColor: "border-[#E2E8F0]",
    },
    {
      key: "desire",
      name: "Audience Desire",
      hindi: "चाहत",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: "from-blue-500 to-sky-500",
      bgColor: "bg-white",
      borderColor: "border-[#E2E8F0]",
    },
    {
      key: "shareability",
      name: "Shareability",
      hindi: "शेयर वैल्यू",
      icon: <Share2 className="w-5 h-5 text-cyan-600" />,
      color: "from-cyan-500 to-teal-500",
      bgColor: "bg-white",
      borderColor: "border-[#E2E8F0]",
    },
  ];

  return (
    <div id="pillar-grid-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pillars.map((p) => {
        const item: PillarScore = scores[p.key];
        const scoreVal = item ? item.score : 0;
        const justification = item ? item.justification : "Not evaluated yet.";

        return (
          <div
            id={`pillar-${p.key}`}
            key={p.key}
            className={`p-5 rounded-xl border ${p.borderColor} ${p.bgColor} flex flex-col justify-between transition-all duration-300 hover:border-slate-300 hover:translate-y-[-2px] shadow-sm`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-[#E2E8F0]">
                    {p.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 tracking-tight font-sans">
                      {p.name}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      {p.hindi}
                    </span>
                  </div>
                </div>
                {/* Score Number Badge */}
                <div className="flex items-baseline space-x-0.5">
                  <span className="text-xl font-display font-medium text-slate-900">
                    {scoreVal}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">/5</span>
                </div>
              </div>

              {/* Progress Meter bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-1000`}
                  style={{ width: `${(scoreVal / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Justification Text */}
            <p className="text-xs text-slate-700 leading-relaxed font-sans mt-auto">
              {justification}
            </p>
          </div>
        );
      })}
    </div>
  );
};
