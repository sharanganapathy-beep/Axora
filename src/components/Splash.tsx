/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Sparkles, Terminal } from "lucide-react";

interface SplashProps {
  onDismiss: () => void;
}

export default function Splash({ onDismiss }: SplashProps) {
  return (
    <div id="splash-screen" className="relative min-h-[100dvh] flex flex-col justify-between items-center bg-[#150d0a] text-[#eaddca] p-8 overflow-hidden font-sans">
      {/* Background radial soft light blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#633821]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-[#e5c1a7]/5 blur-[100px] pointer-events-none" />

      {/* Decorative tiny brand border */}
      <div className="absolute inset-4 border border-[#633821]/20 rounded-xl pointer-events-none" />

      {/* Margins Status Indicator - Minimal & Literal as allowed */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono tracking-widest text-[#e5c1a7]/60 uppercase z-10">
        <span id="brand-location">2026 Core v2.9</span>
        <span id="brand-stamp" className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e5c1a7] animate-pulse"></span>
          Secure Sandbox Engaged
        </span>
      </div>

      {/* Cinematic Main Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Main Logo Text */}
          <h1 className="text-5xl md:text-6xl font-display font-light uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-[#f5f2ed] to-[#e5c1a7] leading-none select-none">
            Axora
          </h1>

          {/* Golden Separator */}
          <div className="flex justify-center items-center gap-2">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#e5c1a7]/40" />
            <Sparkles className="w-3.5 h-3.5 text-[#e5c1a7]/60" />
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#e5c1a7]/40" />
          </div>

          {/* Philosophy Tagline */}
          <p className="text-sm font-sans tracking-[0.4em] uppercase text-[#e5c1a7]/80">
            Think. Decide. Grow.
          </p>

          {/* Emotional Paradigm */}
          <p className="text-xs text-[#eaddca]/80 font-light leading-relaxed max-w-xs mx-auto pt-4 border-t border-[#633821]/30">
            Banks tell you if you qualify. <br />
            <span className="text-[#e5c1a7] font-medium">Axora</span> reveals if your structural cashflow can actually handle the decision.
          </p>
        </motion.div>
      </div>

      {/* Footer CTA & Quick Stats */}
      <div className="w-full max-w-sm flex flex-col gap-6 items-center z-10">
        <motion.button
          id="enter-axora-btn"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          onClick={onDismiss}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg bg-[#633821] border border-[#633821]/80 hover:border-[#e5c1a7] text-[#f5f2ed] text-xs font-mono tracking-widest uppercase cursor-pointer transition-all duration-300 hover:shadow-[0_4px_20px_rgba(99,56,33,0.3)] active:scale-98"
        >
          Begin Advisory Session
        </motion.button>

        <span className="text-[10px] font-sans tracking-wide text-[#eaddca]/65 text-center">
          End-to-End Encryption • Zero-File Persistence Standard
        </span>
      </div>
    </div>
  );
}
