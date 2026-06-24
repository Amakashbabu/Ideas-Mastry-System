import React from "react";
import { Phase5Data, QaTest } from "../types";
import { CheckCircle2, XCircle, Zap, Clock, ShieldCheck } from "lucide-react";

interface QaVerdictCardProps {
  data: Phase5Data;
}

export const QaVerdictCard: React.FC<QaVerdictCardProps> = ({ data }) => {
  const tests: { label: string; key: keyof Omit<Phase5Data, "finalVerdict" | "trendVelocity">; description: string }[] = [
    {
      label: "The Click Test",
      key: "clickTest",
      description: "Is the visual hook instantly clear within a 3-4 word window?",
    },
    {
      label: "The Stranger Test",
      key: "strangerTest",
      description: "Will a busy, distracted scrolling founder stop within exactly 2 seconds?",
    },
    {
      label: "The Share Test",
      key: "shareTest",
      description: "Is the absolute value high enough to prompt a copy-share to look highly smart?",
    },
    {
      label: "The Audience Fit Test",
      key: "audienceFitTest",
      description: "Will this directly generate qualified inbound sales leads for your specific backend model?",
    },
  ];

  const getVelocityBadge = (velocity: "HIGH" | "LOW") => {
    if (velocity === "HIGH") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          ⚡ High Velocity (Produce in 48h)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          ⏳ Low Velocity (Evergreen Asset)
      </span>
    );
  };

  const getFinalVerdictTheme = (verdict: "GREEN" | "YELLOW" | "RED") => {
    switch (verdict) {
      case "GREEN":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          text: "text-emerald-800",
          title: "🟢 GREEN LIGHT: Predictable Winner",
          subtitle: "All gates clear. Send direct to active production queue now!",
        };
      case "YELLOW":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          text: "text-amber-800",
          title: "🟡 ORANGE LIGHT: Repair Needed",
          subtitle: "Bypass or fix the singular failed checkpoint in Phase 4 first.",
        };
      case "RED":
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-900",
          badge: "bg-rose-100 text-rose-800 border-rose-200",
          text: "text-rose-800",
          title: "🔴 RED LIGHT: DEAD IDEA (निरस्त)",
          subtitle: "Complete failure across multiple checkpoints. Immediate delete suggested.",
        };
    }
  };

  const verdictTheme = getFinalVerdictTheme(data.finalVerdict);

  return (
    <div id="qa-verdict-container" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* 4 checklist tests */}
      <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#4f46e5] text-indigo-700 uppercase font-bold flex items-center gap-1 mb-4">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Phase 5: Binary Quality Gates (गुणवत्ता जांच)
          </span>

          <div className="space-y-4">
            {tests.map((t) => {
              const testResult: QaTest = data[t.key] as QaTest;
              const isPassed = testResult ? testResult.pass : false;
              const feedback = testResult ? testResult.feedback : "No feedback available.";

              return (
                <div key={t.key} className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-xl transition-colors hover:bg-slate-50/50">
                  <div className="mt-0.5 shrink-0">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 fill-rose-50" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 font-sans leading-tight">
                        {t.label}
                      </h4>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${isPassed ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                        {isPassed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-1 leading-normal">
                      {t.description}
                    </p>
                    <p className="text-xs text-slate-700 leading-normal font-sans">
                      {feedback}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic light summary & trend velocity */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
        {/* final verdict box */}
        <div className={`p-6 rounded-2xl border ${verdictTheme.bg} flex flex-col justify-between h-full space-y-5 shadow-sm`}>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold block mb-1">
              Final Verdict Status
            </span>
            <h3 className={`text-lg font-display font-bold ${verdictTheme.text}`}>
              {verdictTheme.title}
            </h3>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {verdictTheme.subtitle}
            </p>
          </div>

          <div className="border-t border-[#E2E8F0] pt-4">
            <span className="text-[10px] font-mono text-slate-505 text-slate-550 mr-2.5 font-bold uppercase block mb-1.5">
              Production Velocity Alignment
            </span>
            {getVelocityBadge(data.trendVelocity)}
          </div>
        </div>
      </div>
    </div>
  );
};
