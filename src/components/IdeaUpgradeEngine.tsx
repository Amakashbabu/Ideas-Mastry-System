import React, { useState } from "react";
import { Phase4Data, HookDetail } from "../types";
import { RefreshCw, Radio, Shrink, Maximize2, Sparkles, CheckCircle } from "lucide-react";

interface IdeaUpgradeEngineProps {
  data: Phase4Data;
}

type HookType = "counterIntuitive" | "zoomIn" | "zoomOut";

export const IdeaUpgradeEngine: React.FC<IdeaUpgradeEngineProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<HookType>("counterIntuitive");

  if (!data || !data.hooks) {
    return (
      <div id="no-upgrade-engine" className="bg-[#F8FAFC] border border-dashed border-slate-200 p-8 rounded-2xl text-center">
        <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-3 animate-spin" style={{ animationDuration: "3s" }} />
        <h4 className="text-sm font-semibold text-slate-700">Upgrade Engine Not Required</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          This was an elite idea (🟢 Score {`>=`} 24) that bypassed re-engineering. It's ready for immediate production!
        </p>
      </div>
    );
  }

  const hooksMap: Record<HookType, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    counterIntuitive: {
      label: "Counter-Intuitive Flip",
      icon: <Radio className="w-4 h-4" />,
      color: "text-amber-600 border-amber-200 bg-amber-50",
      desc: "Challenging conventional consensus views with a bold, data-backed stance.",
    },
    zoomIn: {
      label: "Zoom-In Isolate",
      icon: <Shrink className="w-4 h-4" />,
      color: "text-sky-600 border-sky-200 bg-sky-50",
      desc: "Isolating an ultra-specific, high-value micro-action or metric from the broader concept.",
    },
    zoomOut: {
      label: "Zoom-Out Connect",
      icon: <Maximize2 className="w-4 h-4" />,
      color: "text-purple-600 border-purple-200 bg-purple-50",
      desc: "Connecting minor daily friction points to massive revenue loss or structural business impact.",
    },
  };

  const selectedHook: HookDetail = data.hooks[activeTab];

  return (
    <div id="upgrade-engine-container" className="bg-white border border-[#E2E8F0] shadow-sm rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5 mb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-amber-600 uppercase font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 4: Idea Engineering Engine (अपग्रेड/संशोधन)
          </span>
          <h3 className="text-lg font-display font-medium text-slate-900 mt-0.5">
            Engineered High-Converting Angles
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Three distinct strategic variations custom-fitted for premium backend sales.
          </p>
        </div>
        
        {data.engineered && (
          <span className="text-xs font-mono bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-md font-semibold">
            UPGRADE COMPLETED ACTIVE
          </span>
        )}
      </div>

      {/* Interactive Tabs Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-5">
        {(Object.keys(hooksMap) as HookType[]).map((tabKey) => {
          const config = hooksMap[tabKey];
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`flex items-center space-x-2 p-3 rounded-xl border text-left transition-all duration-300 ${
                isActive
                  ? "bg-slate-50 border-slate-300 text-slate-900 shadow-sm font-semibold"
                  : "bg-white border-[#E2E8F0] text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? "bg-slate-100 border border-slate-200" : "bg-slate-50 text-slate-400"}`}>
                {config.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold leading-tight truncate">{config.label}</p>
                <p className="text-[10px] text-slate-400 leading-normal whitespace-nowrap overflow-hidden text-ellipsis">
                  {tabKey === "counterIntuitive" ? "Bold claims" : tabKey === "zoomIn" ? "Micro focus" : "Macro impacts"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tab Showcase View */}
      {selectedHook && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main angle & visual headlines */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Recommended Title / Headline Hook
                </span>
                <p className="text-base font-display font-medium text-slate-900 mt-1 leading-relaxed">
                  "{selectedHook.title}"
                </p>
              </div>

              <div className="border-t border-[#E2E8F0] pt-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Script Lead-In / Hook Content Code
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line mt-1.5">
                  {selectedHook.body}
                </p>
              </div>
            </div>
          </div>

          {/* Asset-light operational validation checks */}
          <div className="lg:col-span-5">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1.5 mb-2.5">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-mono tracking-wider text-amber-700 uppercase font-bold">
                    Asset-Light Check (एसेट-लाइट जांच)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  {selectedHook.assetLightCheck}
                </p>
              </div>

              <div className="border-t border-amber-100 pt-3.5 mt-4">
                <p className="text-[10px] font-mono text-amber-800 leading-normal">
                  💡 <strong>Goal:</strong> Optimize market conversion with absolutely zero operational burnout, maintaining extremely low cost margins.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
