/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Briefcase, ChevronRight, Lock, ArrowLeft } from "lucide-react";
import { DecisionType } from "../types";

interface OnboardingProps {
  onSelected: (vertical: DecisionType) => void;
  onBackToSplash: () => void;
}

export default function Onboarding({ onSelected, onBackToSplash }: OnboardingProps) {
  const [selectedVertical, setSelectedVertical] = useState<DecisionType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (vertical: DecisionType) => {
    setSelectedVertical(vertical);
    setIsTransitioning(true);

    // Beautiful premium timer for transition screen
    setTimeout(() => {
      onSelected(vertical);
    }, 400);
  };

  return (
    <div id="onboarding-viewport" className="relative min-h-[100dvh] bg-[#150d0a] text-[#eaddca] flex flex-col justify-between p-6 overflow-hidden md:p-12 font-sans">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#633821]/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#e5c1a7]/5 blur-[120px] pointer-events-none" />

      {/* Decorative frame line */}
      <div className="absolute inset-4 border border-[#633821]/20 rounded-xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div
            key="selection-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full z-10 py-4"
          >
            {/* Header */}
            <div>
              <button
                onClick={onBackToSplash}
                className="group flex items-center gap-2 text-xs font-mono text-[#eaddca]/60 hover:text-[#e5c1a7] transition-colors mb-8 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Return
              </button>

              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#e5c1a7]/60 mb-2">
                Decisual Intake Engine
              </p>
              <h2 className="text-3xl font-display font-light text-[#f5f2ed] tracking-tight leading-tight mb-4">
                Choose where you'd like <br />
                <span className="text-[#e5c1a7] font-normal italic font-serif">clarity</span> first.
              </h2>
              <p className="text-[#eaddca]/80 text-xs font-light leading-relaxed">
                Every major investment deserves absolute stress testing of liabilities, safety corridors, and worst-case micro-economies.
              </p>
            </div>

            {/* Selection Cards */}
            <div className="space-y-4 my-8">
              {/* Option 1: Property */}
              <button
                id="select-property-card"
                onClick={() => handleSelect("property")}
                className="w-full text-left p-6 rounded-lg glass-panel-interactive flex items-start gap-5 cursor-pointer group"
              >
                <div className="p-3.5 rounded-md bg-[#2b160c] border border-[#633821]/40 text-[#e5c1a7] group-hover:text-[#f5f2ed] transition-colors group-hover:border-[#e5c1a7]/50">
                  <Building2 className="w-5.5 h-5.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-medium text-[#f5f2ed] text-md group-hover:text-[#e5c1a7] transition-colors">
                      Property & Land
                    </h3>
                    <ChevronRight className="w-4 h-4 text-[#e5c1a7]/40 group-hover:text-[#e5c1a7] transition-colors group-hover:translate-x-1" />
                  </div>
                  <p className="text-[#eaddca]/70 text-[11px] font-light leading-relaxed">
                    Understand physical valuation, holding overheads, EMI thresholds, appreciation scenario metrics, and human comfort corridors.
                  </p>
                </div>
              </button>

              {/* Option 2: Business */}
              <button
                id="select-business-card"
                onClick={() => handleSelect("business")}
                className="w-full text-left p-6 rounded-lg glass-panel-interactive flex items-start gap-5 cursor-pointer group"
              >
                <div className="p-3.5 rounded-md bg-[#2b160c] border border-[#633821]/40 text-[#e5c1a7] group-hover:text-[#f5f2ed] transition-colors group-hover:border-[#e5c1a7]/50">
                  <Briefcase className="w-5.5 h-5.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-medium text-[#f5f2ed] text-md group-hover:text-[#e5c1a7] transition-colors">
                      Business Health
                    </h3>
                    <ChevronRight className="w-4 h-4 text-[#e5c1a7]/40 group-hover:text-[#e5c1a7] transition-colors group-hover:translate-x-1" />
                  </div>
                  <p className="text-[#eaddca]/70 text-[11px] font-light leading-relaxed">
                    Determine true operating profitability, hidden overhead risks, accounts receivable lags, custom cash runways, and deep strategic guidance.
                  </p>
                </div>
              </button>
            </div>

            {/* Bottom Security Info */}
            <div className="flex items-center gap-2 justify-center py-2 border-t border-[#633821]/30 text-[10px] font-light text-[#eaddca]/70">
              <Lock className="w-3.5 h-3.5 text-[#e5c1a7]/50" />
              <span>Full confidentiality guaranteed. Axora does not serialize or cache inputs.</span>
            </div>
          </motion.div>
        ) : (
          /* Transition screen */
          <motion.div
            key="transition-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-center items-center text-center z-10"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-4 max-w-sm"
            >
              <div className="inline-block px-3 py-1 bg-[#2b160c] border border-[#633821]/50 rounded text-[10px] font-mono uppercase text-[#e5c1a7] tracking-widest animate-pulse">
                Axora Cortex Loading
              </div>

              <h2 className="text-sm font-mono uppercase tracking-[0.4em] text-[#e5c1a7]/50">
                {selectedVertical === "property" ? "AXORA PROPERTY" : "AXORA BUSINESS"}
              </h2>

              <p className="text-2xl font-serif font-light text-[#f5f2ed] leading-snug tracking-tight italic">
                {selectedVertical === "property"
                  ? "“Property decisions shape your future.”"
                  : "“See what your numbers are trying to tell you.”"}
              </p>

              <div className="h-[2px] w-12 bg-[#633821]/30 mx-auto my-6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-[#e5c1a7]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                />
              </div>

              <p className="text-[11px] font-sans text-[#eaddca]/80 font-light">
                Structuring core calculations, Stress variables context, and visual grade scenarios...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
