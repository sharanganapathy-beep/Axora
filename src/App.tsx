/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Splash from "./components/Splash";
import Onboarding from "./components/Onboarding";
import PropertyFlow from "./components/PropertyFlow";
import BusinessFlow from "./components/BusinessFlow";
import { DecisionType } from "./types";

type AppStage = "splash" | "onboarding" | "decision-hub";

export default function App() {
  const [stage, setStage] = useState<AppStage>("splash");
  const [activeVertical, setActiveVertical] = useState<DecisionType | null>(null);

  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "INR" | "AED">("USD");

  const handleLandingDismiss = () => {
    setStage("onboarding");
  };

  const handleVerticalChoice = (vertical: DecisionType) => {
    setActiveVertical(vertical);
    setStage("decision-hub");
  };

  const handleBackToSplash = () => {
    setStage("splash");
  };

  const handleBackFromVertical = () => {
    setStage("onboarding");
    setActiveVertical(null);
  };

  return (
    <div id="application-container" className="min-h-[100dvh] bg-[#150d0a] text-[#eaddca] flex flex-col font-sans selection:bg-[#633821]/40 selection:text-[#f5f2ed]">
      <AnimatePresence mode="wait">
        {/* Splash Landing stage */}
        {stage === "splash" && (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Splash onDismiss={handleLandingDismiss} />
          </motion.div>
        )}

        {/* Vertical Selector Stage */}
        {stage === "onboarding" && (
          <motion.div
            key="onboarding-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Onboarding 
              onSelected={handleVerticalChoice} 
              onBackToSplash={handleBackToSplash}
            />
          </motion.div>
        )}

        {/* Dynamic Decision Core (Property Flow vs Business Health Flow) */}
        {stage === "decision-hub" && (
          <motion.div
            key="decision-core"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full min-h-[100dvh] flex flex-col p-4 md:p-8"
          >
            {/* Top Minimalist Branding bar */}
            <div className="w-full max-w-xl mx-auto flex justify-between items-center py-4 border-b border-[#633821]/30 mb-6 font-sans">
              <span className="text-xl uppercase tracking-[0.25em] font-display font-bold text-[#e5c1a7]">
                Axora
              </span>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-[#2b160c] border border-[#633821]/45 p-0.5 rounded text-[10px] font-mono flex-wrap gap-0.5 max-w-[200px] justify-center sm:max-w-none">
                  {(["USD", "EUR", "GBP", "INR", "AED"] as const).map((curr) => {
                    const symMap = { USD: "$", EUR: "€", GBP: "£", INR: "₹", AED: "د.إ" };
                    return (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-all ${currency === curr ? "bg-[#e5c1a7] text-black font-semibold" : "text-[#eaddca]/60 hover:text-white"}`}
                      >
                        {symMap[curr] || curr}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[9px] font-mono tracking-widest text-[#e5c1a7]/60 uppercase hidden sm:inline">
                  Think • Decide • Grow
                </span>
              </div>
            </div>

            {/* Dynamic workspace renderer */}
            <div className="flex-1 flex flex-col justify-center">
              {activeVertical === "property" ? (
                <PropertyFlow onBack={handleBackFromVertical} currency={currency} />
              ) : (
                <BusinessFlow onBack={handleBackFromVertical} currency={currency} />
              )}
            </div>

            {/* Global minimal footer */}
            <footer className="w-full max-w-xl mx-auto text-center py-6 border-t border-[#633821]/30 text-[10px] text-[#eaddca]/40 font-mono tracking-widest uppercase mt-12">
              AXORA INTEGRATED PLATFORMS LTD © 2026
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

