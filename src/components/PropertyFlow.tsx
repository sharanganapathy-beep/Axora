/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Map, 
  Store, 
  Upload, 
  Sparkles, 
  ArrowLeft, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Crown, 
  ChevronRight, 
  Check, 
  X,
  TrendingUp,
  Landmark,
  Search,
  MessageSquare,
  Brain,
  FileText,
  Send,
  Loader2
} from "lucide-react";
import { 
  ResidentialInputs, 
  LandInputs, 
  CommercialInputs, 
  PropertySubType,
  ResidentialReport,
  LandReport,
  CommercialReport
} from "../types";
import { 
  computeResidentialReport, 
  computeLandReport, 
  computeCommercialReport 
} from "../utils/calculations";

interface PropertyFlowProps {
  onBack: () => void;
  currency: "USD" | "EUR" | "GBP" | "INR" | "AED";
}

export default function PropertyFlow({ onBack, currency }: PropertyFlowProps) {
  const [subType, setSubType] = useState<PropertySubType | null>(null);
  const [inputMethod, setInputMethod] = useState<"upload" | "manual" | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [currentParseStep, setCurrentParseStep] = useState(0);
  const [showExtractedReview, setShowExtractedReview] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick" | "vip">("quick");

  // Cinematic calculating State
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);

  // What-if simulator states
  const [whatIfRate, setWhatIfRate] = useState<number | null>(null);
  const [whatIfIncomeRatio, setWhatIfIncomeRatio] = useState<number>(1);
  const [whatIfPriceReduction, setWhatIfPriceReduction] = useState<number>(0);
  
  // What-if land
  const [whatIfDelayInfra, setWhatIfDelayInfra] = useState(false);
  const [whatIfSlowGrowth, setWhatIfSlowGrowth] = useState(false);

  // Residential Form State
  const [resInputs, setResInputs] = useState<ResidentialInputs>({
    purchasePrice: 650000,
    downPayment: 130000,
    interestRate: 6.2,
    tenureYears: 30,
    monthlyIncome: 10000,
    existingDebts: 800,
    monthlyMaintenance: 350,
    estimatedAppreciation: 5,
  });

  const [resFormErrors, setResFormErrors] = useState<Record<string, string>>({});

  // Land Form State
  const [landInputs, setLandInputs] = useState<LandInputs>({
    purchasePrice: 125000,
    taxesFees: 12000,
    holdingPeriodYears: 10,
    projectedAnnualGrowth: 10,
    growthCorridor: "strong",
    roadAccess: true,
    waterPowerGrid: true,
    metroHighwayPlanned: true,
    clearTitleChecked: true,
    liquidityTier: "medium",
    floodZoneRisk: false,
    agriConversionPending: false,
    landGoal: "appreciation",
    riskAppetite: "balanced",
  });

  const [landFormErrors, setLandFormErrors] = useState<Record<string, string>>({});

  // Commercial Form State
  const [commInputs, setCommInputs] = useState<CommercialInputs>({
    purchasePrice: 950000,
    downPayment: 250000,
    interestRate: 6.5,
    tenureYears: 20,
    annualRentIncome: 68000,
    vacancyRate: 8,
    annualMaintenance: 12000,
    tenantProfile: "standard",
  });

  const [commFormErrors, setCommFormErrors] = useState<Record<string, string>>({});

  // VIP Room Sub-Tabs and dynamic states for Property Flow
  const [vipSubTab, setVipSubTab] = useState<"wealth-advisor" | "negotiable-letters" | "strategic-briefing" | "sliders">("wealth-advisor");

  // A. Wealth Advisor Chat
  const [wealthMessages, setWealthMessages] = useState<Array<{ role: "user" | "model"; text: string }>>([
    {
      role: "model",
      text: "Securing connection... Welcome to your private Property Wealth Strategy corridor. I am your specialized Real Estate Legal Solicitor & Wealth Advisor. What asset parameters or covenant negotiations can we stress-test today?"
    }
  ]);
  const [wealthInput, setWealthInput] = useState("");
  const [isWealthLoading, setIsWealthLoading] = useState(false);
  const [wealthError, setWealthError] = useState("");

  // B. Negotiation Letters Copilot
  const [letterScenario, setLetterScenario] = useState("Offer to Purchase with Inspection Clauses");
  const [letterRecipient, setRecipient] = useState("Listing Broker & Lead Vendor");
  const [letterObjective, setLetterObjective] = useState("Offer 5% below listing, subject to structural inspection, clean title certification, and zero HOA liability inheritance.");
  const [letterTone, setLetterTone] = useState("Collaborative Negotiation Offer");
  const [letterCustom, setLetterCustom] = useState("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterError, setLetterError] = useState("");
  const [aiSubject, setAiSubject] = useState("");
  const [aiBody, setAiBody] = useState("");

  // C. Strategic Property Memo
  const [strategicMemo, setStrategicMemo] = useState("");
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [memoError, setMemoError] = useState("");

  const [isReportReady, setIsReportReady] = useState(false);
  const [showVerdictDetails, setShowVerdictDetails] = useState(false);

  // Helper currency format
  const formatValue = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AED: "د.إ",
  };
  const curSymbol = currencySymbols[currency];

  // Parsing progression steps
  const parsingSteps = [
    "Initializing Private Intelligence Core...",
    "Scanning document layouts & attachments...",
    "Executing OCR table boundary calculations...",
    "Recognizing price parameters, stamp duties & taxes...",
    "Sanitizing extracted loan variables & maintenance rules...",
    "Structuring certified schema..."
  ];

  const handleDocumentUpload = () => {
    setIsParsingDoc(true);
    setCurrentParseStep(0);
    
    const interval = setInterval(() => {
      setCurrentParseStep((prev) => {
        if (prev >= parsingSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsParsingDoc(false);
            setShowExtractedReview(true);
            
            // Populating beautiful values back based on subtype selected
            if (subType === "residential") {
              setResInputs({
                purchasePrice: 720000,
                downPayment: 150000,
                interestRate: 5.9,
                tenureYears: 30,
                monthlyIncome: 115000 / 12,
                existingDebts: 650,
                monthlyMaintenance: 400,
                estimatedAppreciation: 6,
              });
            } else if (subType === "land") {
              setLandInputs({
                purchasePrice: 140000,
                taxesFees: 14000,
                holdingPeriodYears: 10,
                projectedAnnualGrowth: 12,
                growthCorridor: "strong",
                roadAccess: true,
                waterPowerGrid: true,
                metroHighwayPlanned: true,
                clearTitleChecked: true,
                liquidityTier: "medium",
              });
            } else if (subType === "commercial") {
              setCommInputs({
                purchasePrice: 1050000,
                downPayment: 300000,
                interestRate: 6.2,
                tenureYears: 20,
                annualRentIncome: 76000,
                vacancyRate: 6,
                annualMaintenance: 11000,
                tenantProfile: "high",
              });
            }
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  // Validations
  const validateResForm = () => {
    const errors: Record<string, string> = {};
    if (!resInputs.purchasePrice || resInputs.purchasePrice <= 0) errors.purchasePrice = "Purchase price is required.";
    if (resInputs.downPayment === undefined || resInputs.downPayment < 0) errors.downPayment = "Down payment cannot be empty.";
    if (resInputs.interestRate <= 0) errors.interestRate = "Rate must be positive.";
    if (resInputs.tenureYears <= 0) errors.tenureYears = "Tenure must be positive.";
    if (!resInputs.monthlyIncome || resInputs.monthlyIncome <= 0) errors.monthlyIncome = "Monthly Income is required.";
    
    setResFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLandForm = () => {
    const errors: Record<string, string> = {};
    if (!landInputs.purchasePrice || landInputs.purchasePrice <= 0) errors.purchasePrice = "Purchase Price is required.";
    if (landInputs.holdingPeriodYears <= 0) errors.holdingPeriodYears = "Holding years is required.";
    setLandFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCommForm = () => {
    const errors: Record<string, string> = {};
    if (!commInputs.purchasePrice || commInputs.purchasePrice <= 0) errors.purchasePrice = "Purchase Price is required.";
    if (commInputs.annualRentIncome === undefined || commInputs.annualRentIncome < 0) errors.annualRentIncome = "Rental income cannot be empty.";
    setCommFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calcLoadingStories = [
    "Aligning physical asset metrics to standard safety lanes...",
    "Rebalancing gross monthly surpluses and interest weight...",
    "Structuring tactical negotiation playbook...",
    "Polishing emotional clarity reports..."
  ];

  const handleCalculate = () => {
    if (subType === "residential" && !validateResForm()) return;
    if (subType === "land" && !validateLandForm()) return;
    if (subType === "commercial" && !validateCommForm()) return;

    setIsCalculating(true);
    setCalcStep(0);
    
    const interval = setInterval(() => {
      setCalcStep((prev) => {
        if (prev >= calcLoadingStories.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCalculating(false);
            setIsReportReady(true);
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  // Derived calculations based on active input states & what-if parameters
  const getOutputData = () => {
    if (subType === "residential") {
      return computeResidentialReport(
        resInputs, 
        whatIfRate !== null ? whatIfRate : undefined, 
        whatIfIncomeRatio, 
        whatIfPriceReduction
      );
    } else if (subType === "land") {
      return computeLandReport(landInputs, whatIfDelayInfra, whatIfSlowGrowth);
    } else {
      return computeCommercialReport(commInputs);
    }
  };

  const report = getOutputData();

  // VIP Property API event handlers
  const handleSendWealthMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wealthInput.trim()) return;

    const userMsg = { role: "user" as const, text: wealthInput };
    setWealthMessages((prev) => [...prev, userMsg]);
    const originalInput = wealthInput;
    setWealthInput("");
    setIsWealthLoading(true);
    setWealthError("");

    try {
      const activeContext = 
        subType === "residential" ? resInputs :
        subType === "land" ? landInputs : commInputs;

      const response = await fetch("/api/property/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: originalInput,
          history: wealthMessages,
          context: activeContext,
          subType: subType,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to receive response from wealth advisor.");

      setWealthMessages((prev) => [...prev, { role: "model" as const, text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setWealthError(err.message || "Could not reach the Wealth strategy core.");
    } finally {
      setIsWealthLoading(false);
    }
  };

  const handleGeneratePropertyLetter = async () => {
    setIsGeneratingLetter(true);
    setLetterError("");
    setAiSubject("");
    setAiBody("");

    try {
      const activeContext = 
        subType === "residential" ? resInputs :
        subType === "land" ? landInputs : commInputs;

      const response = await fetch("/api/property/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: letterScenario,
          recipient: letterRecipient,
          objective: letterObjective,
          tone: letterTone,
          context: activeContext,
          subType: subType,
          extraContext: letterCustom,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate specialized negotiation letter.");

      setAiSubject(data.subject);
      setAiBody(data.body);
    } catch (err: any) {
      console.error(err);
      setLetterError(err.message || "An issue occurred while generating communication draft.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleGeneratePropertyMemo = async () => {
    setIsGeneratingMemo(true);
    setMemoError("");
    setStrategicMemo("");

    try {
      const activeContext = 
        subType === "residential" ? resInputs :
        subType === "land" ? landInputs : commInputs;

      const response = await fetch("/api/property/strategic-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: activeContext,
          subType: subType,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis engine failure.");

      setStrategicMemo(data.memo);
    } catch (err: any) {
      console.error(err);
      setMemoError(err.message || "Failed to construct active Property Wealth Memo.");
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  // Back handling path
  const handleTransitionBack = () => {
    if (isReportReady) {
      setIsReportReady(false);
      // Reset what-ifs
      setWhatIfRate(null);
      setWhatIfIncomeRatio(1);
      setWhatIfPriceReduction(0);
      setWhatIfDelayInfra(false);
      setWhatIfSlowGrowth(false);
    } else if (showExtractedReview) {
      setShowExtractedReview(false);
      setInputMethod(null);
    } else if (inputMethod) {
      setInputMethod(null);
    } else if (subType) {
      setSubType(null);
    } else {
      onBack();
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-auto w-full z-10 py-2">
      {/* Action Header bar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleTransitionBack}
          className="flex items-center gap-1.5 text-xs font-mono text-[#eaddca]/70 hover:text-[#e5c1a7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isReportReady ? "Adjust Parameters" : "Return"}
        </button>
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#e5c1a7]/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e5c1a7]"></span>
          Property Intelligence
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* Step: Cinematic Simulation engine */}
        {isCalculating && (
          <motion.div
            key="simulation-calculating"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="p-8 text-center bg-[#1c0e09] border border-[#633821]/45 rounded-xl space-y-6 flex flex-col items-center justify-center min-h-[350px] shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#e5c1a7]/30 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-solid border-[#e5c1a7]/50 animate-pulse flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#e5c1a7]" />
              </div>
            </div>

            <div className="space-y-4 max-w-sm">
              <h3 className="font-display font-medium text-lg text-[#f5f2ed]">Axora Strategic Deep Scan</h3>
              <p className="text-xs font-mono text-[#e5c1a7] tracking-wider h-12 flex items-center justify-center leading-relaxed">
                {calcLoadingStories[calcStep]}
              </p>
            </div>

            <div className="w-full space-y-2 max-w-xs pt-4 border-t border-[#633821]/20">
              <div className="text-[10px] uppercase tracking-widest text-[#eaddca]/40 font-mono animate-pulse">
                Running Safety Net Scenarios
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Subtype Choice */}
        {!subType && !isCalculating && (
          <motion.div
            key="sub-choice"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#e5c1a7]/60 mb-1">Sector Depth</p>
              <h2 className="text-2xl font-display font-light text-[#f5f2ed]">Choose your next big decision.</h2>
              <p className="text-xs text-[#eaddca]/80 font-light mt-1">Axora adapts its analysis based on the type of investment you’re planning.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Residential card */}
              <button
                id="type-residential-btn"
                onClick={() => setSubType("residential")}
                className="text-left p-5 rounded-lg bg-gradient-to-br from-[#2a170d] to-[#120703] border border-[#633821]/40 hover:border-[#e5c1a7]/60 hover:shadow-[0_0_25px_rgba(229,193,167,0.15)] flex items-start gap-4 cursor-pointer transition-all duration-300 ease-out active:scale-[0.99] group"
              >
                <div className="p-3 bg-gradient-to-br from-[#633821]/40 to-[#e5c1a7]/10 rounded-lg border border-[#e5c1a7]/20 text-[#e5c1a7] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-medium text-sm text-[#f5f2ed] group-hover:text-[#e5c1a7] transition-colors">Residential Home</h3>
                    <span className="text-[9px] bg-[#e5c1a7]/10 text-[#e5c1a7] px-2 py-0.5 rounded font-mono uppercase tracking-wider">Lifestyle</span>
                  </div>
                  <p className="text-[#eaddca]/70 text-[11px] font-light leading-relaxed">
                    Check affordability, EMI pressure, lifestyle comfort, and future home value.
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-[#e5c1a7]/80 font-light italic">Most used for first homes & family decisions</span>
                    <span className="text-[10px] text-white/40 group-hover:text-[#e5c1a7] transition-colors">&rarr;</span>
                  </div>
                </div>
              </button>

              {/* Land / Plot Card */}
              <button
                id="type-land-btn"
                onClick={() => setSubType("land")}
                className="text-left p-5 rounded-lg bg-gradient-to-br from-[#121c15] to-[#040806] border border-emerald-900/40 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] flex items-start gap-4 cursor-pointer transition-all duration-300 ease-out active:scale-[0.99] group"
              >
                <div className="p-3 bg-gradient-to-br from-[#0c2417]/40 to-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <Map className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-medium text-sm text-[#f5f2ed] group-hover:text-emerald-400 transition-colors">Land / Plot</h3>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">Future-focused</span>
                  </div>
                  <p className="text-[#eaddca]/70 text-[11px] font-light leading-relaxed">
                    Understand future appreciation, resale demand, and area growth potential.
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400/80 font-light italic">Best for long-term appreciation investors</span>
                    <span className="text-[10px] text-white/40 group-hover:text-emerald-400 transition-colors">&rarr;</span>
                  </div>
                </div>
              </button>

              {/* Commercial Property */}
              <button
                id="type-commercial-btn"
                onClick={() => setSubType("commercial")}
                className="text-left p-5 rounded-lg bg-gradient-to-br from-[#101b2b] to-[#040710] border border-blue-900/40 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.12)] flex items-start gap-4 cursor-pointer transition-all duration-300 ease-out active:scale-[0.99] group"
              >
                <div className="p-3 bg-gradient-to-br from-[#112440]/40 to-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-medium text-sm text-[#f5f2ed] group-hover:text-blue-400 transition-colors">Commercial Property</h3>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider">Investment</span>
                  </div>
                  <p className="text-[#eaddca]/70 text-[11px] font-light leading-relaxed">
                    Analyze rental income, occupancy stability, and long-term investment returns.
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-blue-400/80 font-light italic">Ideal for rental income & cash flow investors</span>
                    <span className="text-[10px] text-white/40 group-hover:text-blue-400 transition-colors">&rarr;</span>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Input Method Choice for Subtype */}
        {subType && !inputMethod && !isCalculating && (
          <motion.div
            key="input-method"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div>
              <p className="text-[10px] font-mono tracking-widest text-[#e5c1a7]/60 mb-1 uppercase">Asset: {subType}</p>
              <h2 className="text-xl font-display font-light text-[#f5f2ed]">How would you like to start?</h2>
              <p className="text-xs text-[#eaddca]/85 font-light mt-1">Upload an estimation spreadsheet, brochure, or cost sheet, or customize details manually.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option A: Document extraction */}
              <button
                id="method-upload-btn"
                onClick={() => setInputMethod("upload")}
                className="text-left p-5 rounded-lg bg-gradient-to-br from-[#2b160c] to-[#150d0a] border border-[#633821]/45 hover:border-[#633821]/80 transition-colors cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute right-3 top-3 px-1.5 py-0.5 bg-[#633821]/50 text-[9px] font-mono text-[#e5c1a7] rounded border border-[#633821]/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Vision
                </div>
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-[#633821] text-[#e5c1a7] rounded-full border border-[#633821]/30 group-hover:bg-[#e5c1a7] group-hover:text-[#150d0a] transition-all">
                    <Upload className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-display font-medium text-sm text-[#f5f2ed]">Upload Property Documents</h4>
                    <p className="text-[11px] font-light text-[#eaddca]/70 mt-1">Extract specifications from draft deeds, interest offers, or tax drafts automatically.</p>
                  </div>
                </div>
              </button>

              {/* Option B: Manual guided inputs */}
              <button
                id="method-manual-btn"
                onClick={() => setInputMethod("manual")}
                className="text-left p-5 rounded-lg glass-panel-interactive flex gap-4 items-center cursor-pointer group"
              >
                <div className="p-3 bg-[#150d0a]/60 text-[#eaddca] rounded-full border border-[#633821]/20 group-hover:border-[#633821]/60 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-medium text-sm text-[#f5f2ed]">Enter Manually</h4>
                  <p className="text-[11px] font-light text-[#eaddca]/70 mt-1">Prefer entering details yourself? Axora guides you with contextual explanations.</p>
                </div>
              </button>
            </div>

            {/* Privacy Alert banner */}
            <div className="p-4 bg-[#2b160c]/40 rounded border border-[#633821]/20 flex gap-3 items-start">
              <Info className="w-4.5 h-4.5 text-[#e5c1a7] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[#e5c1a7] text-[11px] font-medium leading-normal">Your Data is Whitelisted</p>
                <p className="text-[#eaddca]/80 text-[10px] font-light leading-relaxed">
                  Your uploaded brochures are analyzed locally in secondary sandboxes and parsed instantly. We preserve zero copies on physical clouds.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3A: AI Document intelligence Scanner overlay */}
        {subType && inputMethod === "upload" && isParsingDoc && !isCalculating && (
          <motion.div
            key="parsing-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center glass-panel rounded-xl space-y-6 flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="relative">
              {/* Premium double concentric circles spinning */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#633821]/45 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-solid border-[#e5c1a7]/50 animate-pulse flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#e5c1a7]" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-medium text-md text-[#f5f2ed]">Axora Document Intelligence</h3>
              <p className="text-xs font-mono text-[#e5c1a7] tracking-wide animate-pulse">{parsingSteps[currentParseStep]}</p>
            </div>

            {/* Skeletons animation */}
            <div className="w-full space-y-2 max-w-sm pt-4 border-t border-[#633821]/20">
              <div className="h-3 bg-[#633821]/30 rounded animate-pulse w-3/4 mx-auto" />
              <div className="h-2.5 bg-[#150d0a] rounded animate-pulse w-1/2 mx-auto" />
            </div>
          </motion.div>
        )}

        {/* Step 3B: Upload Trigger drag & drop box */}
        {subType && inputMethod === "upload" && !isParsingDoc && !showExtractedReview && !isCalculating && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="text-center p-8 rounded-lg border border-dashed border-[#633821]/50 bg-[#2b160c]/50 hover:bg-[#2b160c] transition-all cursor-pointer relative"
              onClick={handleDocumentUpload}
            >
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                e.preventDefault();
                handleDocumentUpload();
              }} />
              <Upload className="w-8 h-8 text-[#e5c1a7] mx-auto mb-3 animate-bounce" />
              <h4 className="font-display font-medium text-sm text-[#f5f2ed]">Drag or select property documents</h4>
              <p className="text-[11px] text-[#eaddca]/70 mt-1.5 max-w-xs mx-auto">
                Supports PDF deeds, builder interest offers, Excel allocation formulas, or land division blueprints.
              </p>
              <div className="mt-4 inline-block text-[10px] font-mono text-[#e5c1a7] bg-[#633821]/40 px-3.5 py-1 rounded-full border border-[#633821]/30">
                Simulate Rapid OCR Scan
              </div>
            </div>
            
            <button
              onClick={() => setInputMethod("manual")}
              className="w-full text-center py-3 border border-[#633821]/30 rounded font-mono text-xs text-[#eaddca]/70 hover:text-[#f5f2ed] cursor-pointer"
            >
              Cancel & Enter Details Manually
            </button>
          </motion.div>
        )}

        {/* Step 3C: OCR Review extracted numbers */}
        {subType && inputMethod === "upload" && showExtractedReview && !isReportReady && !isCalculating && (
          <motion.div
            key="ocr-review"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-[#2b160c] p-3 rounded border border-[#633821]/45">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#e5c1a7]" />
                <span className="text-xs text-[#f5f2ed] font-medium">Automatic Extraction Succeeded</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#633821]/40 text-[#e5c1a7] font-mono border border-[#633821]/30">
                98% CONFIDENCE
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-display font-light text-[#f5f2ed]">I found these numbers.</h2>
              <p className="text-xs text-[#eaddca]/70">Confirm or edit before Axora runs full intelligence scenarios.</p>
            </div>

            {/* Render editable fields mapped after upload extraction */}
            {subType === "residential" && (
              <div id="residential-confirm-fields" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Purchase Price ({curSymbol})</label>
                    <input 
                      type="number"
                      value={resInputs.purchasePrice}
                      onChange={(e) => setResInputs({...resInputs, purchasePrice: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Down Payment ({curSymbol})</label>
                    <input 
                      type="number"
                      value={resInputs.downPayment}
                      onChange={(e) => setResInputs({...resInputs, downPayment: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Interest Rate (%)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={resInputs.interestRate}
                      onChange={(e) => setResInputs({...resInputs, interestRate: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Monthly Gross Income ({curSymbol})</label>
                    <input 
                      type="number"
                      value={resInputs.monthlyIncome}
                      onChange={(e) => setResInputs({...resInputs, monthlyIncome: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {subType === "land" && (
              <div id="land-confirm-fields" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Purchase Price ({curSymbol})</label>
                    <input 
                      type="number"
                      value={landInputs.purchasePrice}
                      onChange={(e) => setLandInputs({...landInputs, purchasePrice: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Registration/Fees ({curSymbol})</label>
                    <input 
                      type="number"
                      value={landInputs.taxesFees}
                      onChange={(e) => setLandInputs({...landInputs, taxesFees: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {subType === "commercial" && (
              <div id="commercial-confirm-fields" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Purchase Price ({curSymbol})</label>
                    <input 
                      type="number"
                      value={commInputs.purchasePrice}
                      onChange={(e) => setCommInputs({...commInputs, purchasePrice: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Down Payment ({curSymbol})</label>
                    <input 
                      type="number"
                      value={commInputs.downPayment}
                      onChange={(e) => setCommInputs({...commInputs, downPayment: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Annual Rental Income ({curSymbol})</label>
                    <input 
                      type="number"
                      value={commInputs.annualRentIncome}
                      onChange={(e) => setCommInputs({...commInputs, annualRentIncome: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#eaddca]/80 uppercase mb-1">Annual Maintenance ({curSymbol})</label>
                    <input 
                      type="number"
                      value={commInputs.annualMaintenance}
                      onChange={(e) => setCommInputs({...commInputs, annualMaintenance: Number(e.target.value)})}
                      className="w-full bg-[#150d0a] border border-[#633821]/40 rounded p-2.5 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCalculate}
              className="w-full py-4 bg-gradient-to-r from-[#633821] to-[#2b160c] hover:from-[#78442a] hover:to-[#4e2815] border border-[#633821]/60 rounded text-xs font-mono uppercase tracking-widest text-[#f5f2ed] cursor-pointer"
            >
              Analyze Extraction Decisions
            </button>
          </motion.div>
        )}

        {/* Step 3D: Manual Form Editor */}
        {subType && inputMethod === "manual" && !isReportReady && !isCalculating && (
          <motion.div
            key="manual-form-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              {subType === "residential" ? (
                <>
                  <p className="text-[10px] font-mono tracking-widest text-[#e5c1a7]/70 uppercase">Let’s Understand Your Home Purchase</p>
                  <h2 className="text-xl font-display font-light text-[#f5f2ed]">Can This Home Fit Your Life?</h2>
                  <p className="text-xs text-[#a39485] mt-1">Add your home and income details below. Axora will instantly evaluate affordability, monthly pressure, and long-term safety.</p>
                </>
              ) : subType === "land" ? (
                <>
                  <p className="text-[10px] font-mono tracking-widest text-[#e5c1a7]/70 uppercase">Let’s Understand Your Land Purchase</p>
                  <h2 className="text-xl font-display font-light text-[#f5f2ed]">Can This Land Grow Your Wealth?</h2>
                  <p className="text-xs text-[#a39485] mt-1">Add your land and budget details below. Axora will instantly evaluate appreciation potential, nearby growth, and resale demand.</p>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-mono tracking-widest text-[#e5c1a7]/70 uppercase">Let’s Understand Your Commercial Purchase</p>
                  <h2 className="text-xl font-display font-light text-[#f5f2ed]">Can This Property Generate Profit?</h2>
                  <p className="text-xs text-[#a39485] mt-1">Add your property and tenant details below. Axora will instantly evaluate rental yield, monthly income, and long-term safety.</p>
                </>
              )}
            </div>

            {/* Form fields dependent on subtype */}
            {subType === "residential" && (() => {
              const P = Math.max(0, resInputs.purchasePrice - resInputs.downPayment);
              const r = (resInputs.interestRate / 100) / 12;
              const n = resInputs.tenureYears * 12;
              const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (n > 0 ? P / n : 0);
              const totalMonthlyOutflow = emi + resInputs.existingDebts + resInputs.monthlyMaintenance;
              const dti = resInputs.monthlyIncome > 0 ? (totalMonthlyOutflow / resInputs.monthlyIncome) : 0;
              
              let pressureLevel: "Comfortable" | "Tight" | "Stressful" = "Comfortable";
              let meterColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
              let meterTextColor = "text-emerald-400";
              let meterLabel = "Safe & Comfortable";
              if (dti > 0.50) {
                pressureLevel = "Stressful";
                meterColor = "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
                meterTextColor = "text-rose-400 font-bold";
                meterLabel = "Heavy Financial Burden";
              } else if (dti > 0.35) {
                pressureLevel = "Tight";
                meterColor = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
                meterTextColor = "text-amber-400";
                meterLabel = "Tight Lifestyle Strain";
              }

              // Downpayment real-time feedback
              let downPaymentFeedback = "Higher upfront payments can reduce monthly EMI pressure.";
              let downPaymentFeedbackColor = "text-[#eaddca]/70";
              if (resInputs.purchasePrice > 0) {
                const ratio = resInputs.downPayment / resInputs.purchasePrice;
                if (resInputs.downPayment === 0) {
                  downPaymentFeedback = "Low down payment may increase long-term pressure.";
                  downPaymentFeedbackColor = "text-amber-400/80";
                } else if (ratio < 0.20) {
                  downPaymentFeedback = "Low down payment may increase long-term pressure.";
                  downPaymentFeedbackColor = "text-amber-400/80";
                } else {
                  downPaymentFeedback = "Good start — this keeps EMI pressure healthier.";
                  downPaymentFeedbackColor = "text-emerald-400/80 font-medium";
                }
              }

              // Income real-time feedback
              let incomeFeedback = "Your combined monthly household income before taxes.";
              let incomeFeedbackColor = "text-[#eaddca]/70";
              if (resInputs.monthlyIncome > 0) {
                if (resInputs.monthlyIncome > emi * 3) {
                  incomeFeedback = "Current income comfortably supports this range.";
                  incomeFeedbackColor = "text-emerald-400/80 font-medium";
                } else {
                  incomeFeedback = "This purchase may feel tight monthly.";
                  incomeFeedbackColor = "text-amber-400/80";
                }
              }

              return (
                <div className="space-y-5">
                  {/* Real-time Lifestyle Pressure Meter */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#1b1009] to-[#0c0604] border border-[#633821]/45 space-y-2.5 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono tracking-widest text-[#e5c1a7]/75 uppercase block">Lifestyle Pressure Meter</span>
                        <span className="text-[11px] text-[#eaddca]/60">Reacting in real-time to your custom parameters</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        pressureLevel === "Comfortable" ? "bg-emerald-500/10 text-emerald-400" : 
                        pressureLevel === "Tight" ? "bg-amber-500/10 text-amber-400" : 
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {pressureLevel}
                      </span>
                    </div>

                    <div className="h-2 bg-[#050302] rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-[35%] h-full border-r border-[#150d0a]/25 bg-emerald-500/10" />
                      <div className="absolute top-0 left-[35%] w-[15%] h-full border-r border-[#150d0a]/25 bg-amber-500/10" />
                      <div className="absolute top-0 left-[50%] w-[50%] h-full bg-rose-500/10" />
                      <motion.div
                        className={`h-full ${meterColor}`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min(100, Math.max(5, dti * 100))}%` }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[9px] font-mono text-[#c7b39b]/60 uppercase tracking-wider">
                      <span>🟢 Comfortable</span>
                      <span>🟡 Tight</span>
                      <span>🔴 Stressful</span>
                    </div>
                  </div>

                  {/* Field 1: Purchase Price */}
                  <div className="p-4 bg-gradient-to-br from-[#1b1009] to-[#0c0604] border border-[#e5c1a7]/35 rounded-xl hover:border-[#e5c1a7]/60 shadow-[0_0_20px_rgba(229,193,167,0.06)] hover:shadow-[0_0_25px_rgba(229,193,167,0.12)] transition-all duration-300 space-y-3">
                    <div className="flex justify-between items-center-center">
                      <label className="text-[11px] font-sans font-semibold tracking-wide text-[#eaddca] flex items-center gap-1.5">
                        Property purchase price ({curSymbol})
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-[#f5f2ed] font-semibold font-mono">{formatValue(resInputs.purchasePrice)}</span>
                    </div>
                    <input
                      type="number"
                      value={resInputs.purchasePrice || ""}
                      onChange={(e) => setResInputs({ ...resInputs, purchasePrice: Number(e.target.value) })}
                      placeholder="e.g. 550000"
                      className={`w-full bg-[#0c0604] border rounded-lg p-3 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none transition-all ${resFormErrors.purchasePrice ? "border-red-500/70 bg-red-950/10" : "border-[#633821]/40"}`}
                    />
                    {resFormErrors.purchasePrice && <p className="text-[10px] text-red-400 mt-1">{resFormErrors.purchasePrice}</p>}
                    <p className="text-[10px] font-sans font-light text-[#eaddca]/70 leading-relaxed">
                      The total cost of the home you’re planning to buy.
                    </p>
                  </div>

                  {/* Field 2: Downpayment & Safety warning */}
                  <div className="p-4 bg-gradient-to-br from-[#1b1009] to-[#0c0604] border border-[#e5c1a7]/25 hover:border-[#e5c1a7]/50 rounded-xl hover:shadow-[0_0_20px_rgba(229,193,167,0.05)] transition-all duration-300 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-sans font-semibold tracking-wide text-[#eaddca]">
                        Down payment / Equity contribution ({curSymbol})
                      </label>
                      <span className="text-xs text-[#f5f2ed] font-semibold font-mono">
                        {formatValue(resInputs.downPayment)} ({resInputs.purchasePrice > 0 ? Math.round(resInputs.downPayment / resInputs.purchasePrice * 100) : 0}%)
                      </span>
                    </div>
                    <input
                      type="number"
                      value={resInputs.downPayment || ""}
                      onChange={(e) => setResInputs({ ...resInputs, downPayment: Number(e.target.value) })}
                      placeholder="e.g. 110000"
                      className="w-full bg-[#0c0604] border border-[#633821]/40 rounded-lg p-3 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none"
                    />
                    {resInputs.purchasePrice > 0 && resInputs.downPayment / resInputs.purchasePrice < 0.2 && (
                      <div className="p-3 bg-amber-950/15 border border-amber-500/15 rounded-lg flex gap-2 items-start">
                        <AlertTriangle className="w-4 h-4 text-[#e5c1a7] shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[#e5c1a7] text-[10px] font-medium">Low Equity Warning (&lt;20%)</p>
                          <p className="text-[9px] text-[#eaddca]/65 leading-normal">
                            Down payments below 20% trigger mortgage insurance premiums and increase leverage risks during local market shifts.
                          </p>
                        </div>
                      </div>
                    )}
                    <p className={`text-[10px] font-sans font-light leading-relaxed transition-colors duration-200 ${downPaymentFeedbackColor}`}>
                      {downPaymentFeedback}
                    </p>
                  </div>

                  {/* Field 3: Financial Parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-[#0d0604] border border-[#633821]/30 rounded-xl space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-[#eaddca]">Interest rate (%)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={resInputs.interestRate}
                        onChange={(e) => setResInputs({ ...resInputs, interestRate: Number(e.target.value) })}
                        className="w-full bg-[#150d0a] border border-[#633821]/30 rounded-lg p-2.5 text-xs text-[#f5f2ed] focus:border-[#e5c1a7] outline-none"
                      />
                    </div>
                    <div className="p-3.5 bg-[#0d0604] border border-[#633821]/30 rounded-xl space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-[#eaddca]">Tenure (Years)</label>
                      <select
                        value={resInputs.tenureYears}
                        onChange={(e) => setResInputs({ ...resInputs, tenureYears: Number(e.target.value) })}
                        className="w-full bg-[#150d0a] border border-[#633821]/30 rounded-lg p-2.5 text-xs text-[#f5f2ed] focus:border-[#e5c1a7] outline-none"
                      >
                        <option value={15}>15 Years</option>
                        <option value={20}>20 Years</option>
                        <option value={25}>25 Years</option>
                        <option value={30}>30 Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Field 4: Gross Household monthly income */}
                  <div className="p-4 bg-gradient-to-br from-[#1b1009] to-[#0c0604] border border-[#e5c1a7]/25 hover:border-[#e5c1a7]/50 rounded-xl hover:shadow-[0_0_20px_rgba(229,193,167,0.05)] transition-all duration-300 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-sans font-semibold tracking-wide text-[#eaddca]">
                        Gross monthly household income ({curSymbol}) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-[#f5f2ed] font-semibold font-mono">{formatValue(resInputs.monthlyIncome)}</span>
                    </div>
                    <input
                      type="number"
                      value={resInputs.monthlyIncome || ""}
                      onChange={(e) => setResInputs({ ...resInputs, monthlyIncome: Number(e.target.value) })}
                      placeholder="e.g. 12000"
                      className={`w-full bg-[#0c0604] border rounded-lg p-3 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none ${resFormErrors.monthlyIncome ? "border-red-500/70" : "border-[#633821]/40"}`}
                    />
                    <p className={`text-[10px] font-sans font-light leading-relaxed transition-colors duration-200 ${incomeFeedbackColor}`}>
                      {incomeFeedback}
                    </p>
                  </div>

                  {/* Field 5: Debts & Maintenance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-[#0d0604] border border-[#633821]/30 rounded-xl space-y-1.5">
                      <label className="block text-[10px] font-mono text-[#eaddca]">Existing debts ({curSymbol})</label>
                      <input
                        type="number"
                        value={resInputs.existingDebts || ""}
                        onChange={(e) => setResInputs({ ...resInputs, existingDebts: Number(e.target.value) })}
                        placeholder="e.g. 500"
                        className="w-full bg-[#150d0a] border border-[#633821]/30 rounded-lg p-2.5 text-xs text-[#f5f2ed] focus:border-[#e5c1a7] outline-none"
                      />
                      <p className="text-[9px] text-[#eaddca]/65 mt-1">Existing EMIs, loans, or monthly debt commitments.</p>
                    </div>
                    <div className="p-3.5 bg-[#0d0604] border border-[#633821]/30 rounded-xl space-y-1.5">
                      <label className="block text-[10px] font-mono text-[#eaddca]">Monthly costs & taxes ({curSymbol})</label>
                      <input
                        type="number"
                        value={resInputs.monthlyMaintenance || ""}
                        onChange={(e) => setResInputs({ ...resInputs, monthlyMaintenance: Number(e.target.value) })}
                        placeholder="e.g. 250"
                        className="w-full bg-[#150d0a] border border-[#633821]/30 rounded-lg p-2.5 text-xs text-[#f5f2ed] focus:border-[#e5c1a7] outline-none"
                      />
                      <p className="text-[9px] text-[#eaddca]/65 mt-1">Maintenance, taxes, society fees, and regular property expenses.</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {subType === "land" && (
              <div className="space-y-5">
                {/* Land Asking Price */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#eaddca]">Land Asking Price ({curSymbol})</label>
                    <span className="text-[11px] text-[#f5f2ed] font-medium font-mono">{formatValue(landInputs.purchasePrice)}</span>
                  </div>
                  <input
                    type="number"
                    value={landInputs.purchasePrice}
                    onChange={(e) => setLandInputs({ ...landInputs, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-[#150d0a] border border-[#633821]/30 rounded p-3 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none"
                    id="land-asking-price-input"
                  />
                  {landFormErrors.purchasePrice && (
                    <span className="text-rose-400 text-[10px] uppercase font-mono mt-0.5 block">{landFormErrors.purchasePrice}</span>
                  )}
                </div>

                {/* Taxes & Registration Fees */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#eaddca] mb-1">Registration & Duty ({curSymbol})</label>
                  <input
                    type="number"
                    value={landInputs.taxesFees}
                    onChange={(e) => setLandInputs({ ...landInputs, taxesFees: Number(e.target.value) })}
                    className="w-full bg-[#150d0a] border border-[#633821]/30 rounded p-3 text-sm text-[#f5f2ed] focus:border-[#e5c1a7] outline-none"
                  />
                </div>

                {/* Holding period with Segmented Button Pills */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-[#e5c1a7] tracking-wider">How long do you plan to hold this land?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "1–3 years", value: 2 },
                      { label: "3–7 years", value: 5 },
                      { label: "7–15 years", value: 10 },
                      { label: "Generational hold", value: 30 }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setLandInputs({ ...landInputs, holdingPeriodYears: opt.value })}
                        className={`py-2.5 px-2 rounded border text-xs font-medium font-mono tracking-tight text-center cursor-pointer transition-all ${
                          landInputs.holdingPeriodYears === opt.value
                            ? "bg-[#633821] border-[#e5c1a7] text-white shadow-[0_0_10px_rgba(229,193,167,0.2)]"
                            : "bg-[#150d0a] border-[#633821]/30 text-[#eaddca]/70 hover:border-[#633821]/60"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* INFRASTRUCTURE GROWTH CORRIDOR -> VISUAL CARDS */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-[#e5c1a7] tracking-wider">Infrastructure Growth Corridor</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "metro", label: "Metro Expansion Zone", dot: "🟢", desc: "Adjacent to rapid light rail or future high-density metro terminals." },
                      { id: "highway", label: "Highway Corridor", dot: "🟠", desc: "Located along major state/federal arterial highway networks." },
                      { id: "airport", label: "Airport Expansion Belt", dot: "🔵", desc: "Within international aviation, logistics, or custom free zones." },
                      { id: "it", label: "IT Growth Cluster", dot: "🟣", desc: "Near high-tech business parks, enterprise parks, or tech campuses." },
                      { id: "rural", label: "Rural / Slow Growth", dot: "⚪", desc: "Outside municipal expansion ranges; standard slow-growth setups." },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLandInputs({ ...landInputs, growthCorridor: opt.id as any })}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex gap-3 items-start group ${
                          landInputs.growthCorridor === opt.id
                            ? "bg-[#2b160c] border-[#e5c1a7] shadow-[0_0_12px_rgba(229,193,167,0.15)]"
                            : "bg-[#150d0a] border-[#633821]/30 hover:border-[#633821]/60"
                        }`}
                      >
                        <span className="text-sm mt-0.5">{opt.dot}</span>
                        <div className="space-y-0.5">
                          <span className={`text-xs font-semibold block ${
                            landInputs.growthCorridor === opt.id ? "text-white animate-pulse" : "text-[#f5f2ed] group-hover:text-white"
                          }`}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-[#eaddca]/65 leading-relaxed block">
                            {opt.desc}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* LAND safety verification tags */}
                <div className="space-y-2 pt-1 border-t border-[#633821]/10">
                  <label className="block text-[10px] font-mono uppercase text-[#e5c1a7] tracking-wider">Land Safety Verification</label>
                  <p className="text-[11px] text-[#eaddca]/65 leading-tight">Tactile verification factors. Axora's audit engine dynamically assesses mitigations.</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setLandInputs({ ...landInputs, roadAccess: !landInputs.roadAccess })}
                      className={`px-3 py-2 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 cursor-pointer transition-all ${
                        landInputs.roadAccess
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-950/20 text-rose-400 border-rose-500/25"
                      }`}
                    >
                      {landInputs.roadAccess ? "✅ Clear road access" : "❌ Substandard/no road access"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandInputs({ ...landInputs, clearTitleChecked: !landInputs.clearTitleChecked })}
                      className={`px-3 py-2 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 cursor-pointer transition-all ${
                        landInputs.clearTitleChecked
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-950/20 text-rose-400 border-rose-500/25"
                      }`}
                    >
                      {landInputs.clearTitleChecked ? "✅ Clean title" : "🚨 Title unverified/dispute risk"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandInputs({ ...landInputs, metroHighwayPlanned: !landInputs.metroHighwayPlanned })}
                      className={`px-3 py-2 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 cursor-pointer transition-all ${
                        landInputs.metroHighwayPlanned
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                          : "bg-gray-900/60 text-gray-400 border-gray-800"
                      }`}
                    >
                      {landInputs.metroHighwayPlanned ? "✅ Government infrastructure nearby" : "⚪ No public projects nearby"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandInputs({ ...landInputs, floodZoneRisk: !landInputs.floodZoneRisk })}
                      className={`px-3 py-2 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 cursor-pointer transition-all ${
                        landInputs.floodZoneRisk
                          ? "bg-[#2b170c]/90 text-amber-500 border-amber-600/40 shadow-[0_0_8px_rgba(217,119,6,0.15)] font-semibold"
                          : "bg-emerald-950/20 text-emerald-400 border-emerald-500/10"
                      }`}
                    >
                      {landInputs.floodZoneRisk ? "⚠️ Flood zone unknown" : "✅ Flood risk check passed"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLandInputs({ ...landInputs, agriConversionPending: !landInputs.agriConversionPending })}
                      className={`px-3 py-2 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 cursor-pointer transition-all ${
                        landInputs.agriConversionPending
                          ? "bg-[#2b170c]/90 text-amber-500 border-amber-600/40 shadow-[0_0_8px_rgba(217,119,6,0.15)] font-semibold"
                          : "bg-emerald-950/20 text-emerald-400 border-emerald-500/10"
                      }`}
                    >
                      {landInputs.agriConversionPending ? "⚠️ Agricultural conversion pending" : "✅ Commercial/Resi build zoning"}
                    </button>
                  </div>
                </div>

                {/* EMOTIONAL INVESTMENT GOAL */}
                <div className="space-y-2 border-t border-[#633821]/20 pt-4">
                  <label className="block text-[10px] font-mono uppercase text-[#e5c1a7] tracking-wider">What is your goal for this land?</label>
                  <p className="text-[11px] text-[#eaddca]/65 leading-tight">Your vision drives Axora's strategic risk mitigation suggestions.</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { id: "home", label: "🏡 Build future home", desc: "Custom sovereign residence." },
                      { id: "appreciation", label: "📈 Long-term appreciation", desc: "Urban growth spillover accumulation." },
                      { id: "commercial", label: "🏢 Future commercial use", desc: "Leasehold/business setups." },
                      { id: "retreat", label: "🌴 Weekend retreat", desc: "Leisure haven quiet compounding." },
                      { id: "flip", label: "🏗️ Flip after growth", desc: "Liquid speed infrastructure exit." },
                      { id: "legacy", label: "🧬 Legacy asset for family", desc: "Generational wealth preservation." },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLandInputs({ ...landInputs, landGoal: opt.id as any })}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          landInputs.landGoal === opt.id
                            ? "bg-[#2b160c] border-[#e5c1a7] shadow-[0_0_10px_rgba(229,193,167,0.2)]"
                            : "bg-[#150d0a] border-[#633821]/30 hover:border-[#633821]/60"
                        }`}
                      >
                        <span className="text-xs font-semibold text-white block">{opt.label}</span>
                        <span className="text-[10px] text-[#eaddca]/50 mt-0.5 leading-tight block">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* RISK APPETITE */}
                <div className="space-y-2 border-t border-[#633821]/20 pt-4">
                  <label className="block text-[10px] font-mono uppercase text-[#e5c1a7] tracking-wider">Risk Appetite</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "safe", label: "🟢 Safe & stable", desc: "Sovereign checks" },
                      { id: "balanced", label: "🟠 Balanced growth", desc: "Calculated risk" },
                      { id: "aggressive", label: "🔴 Aggressive upside", desc: "Max terminal alpha" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLandInputs({ ...landInputs, riskAppetite: opt.id as any })}
                        className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          landInputs.riskAppetite === opt.id
                            ? "bg-[#2b160c] border-[#e5c1a7] shadow-[0_0_10px_rgba(229,193,167,0.2)]"
                            : "bg-[#150d0a] border-[#633821]/30 hover:border-[#633821]/60"
                        }`}
                      >
                        <span className="text-xs font-semibold text-white block">{opt.label}</span>
                        <span className="text-[9px] text-[#eaddca]/45 block mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subType === "commercial" && (
              <div className="space-y-4">
                {/* Commercial Property inputs */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#eaddca]">Commercial Building Price ({curSymbol})</label>
                    <span className="text-[11px] text-[#f5f2ed] font-medium font-mono">{formatValue(commInputs.purchasePrice)}</span>
                  </div>
                  <input
                    type="number"
                    value={commInputs.purchasePrice}
                    onChange={(e) => setCommInputs({ ...commInputs, purchasePrice: Number(e.target.value) })}
                    className="w-full bg-[#150d0a] border border-[#633821]/30 rounded p-3 text-sm text-[#f5f2ed]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#eaddca] mb-1">Equity/Down Payment ({curSymbol})</label>
                    <input
                      type="number"
                      value={commInputs.downPayment}
                      onChange={(e) => setCommInputs({ ...commInputs, downPayment: Number(e.target.value) })}
                      className="w-full bg-[#150d0a] border border-[#633821]/30 rounded p-2.5 text-xs text-[#f5f2ed]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#eaddca] mb-1">Annual Rental Income ({curSymbol})</label>
                    <input
                      type="number"
                      value={commInputs.annualRentIncome}
                      onChange={(e) => setCommInputs({ ...commInputs, annualRentIncome: Number(e.target.value) })}
                      className="w-full bg-[#150d0a] border border-[#633821]/30 rounded p-2.5 text-xs text-[#f5f2ed]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#eaddca] mb-1">Expected Tenant Profile</label>
                  <select
                    value={commInputs.tenantProfile}
                    onChange={(e) => setCommInputs({ ...commInputs, tenantProfile: e.target.value as any })}
                    className="w-full bg-[#150d0a] border border-[#633821]/30 rounded p-3 text-sm text-[#f5f2ed]"
                  >
                    <option value="high">Corporate Anchor (Multinational, exceptional rating)</option>
                    <option value="standard">Standard SME (Solid local business historical financials)</option>
                    <option value="speculative">Speculative startup or individual retail operator</option>
                  </select>
                </div>
              </div>
            )}

            {/* Execute trigger */}
            <button
              id="property-execute-analysis-btn"
              onClick={handleCalculate}
              className="w-full py-4 bg-gradient-to-r from-[#633821] to-[#2b160c] hover:from-[#7c4629] border border-[#633821]/50 rounded text-xs font-mono uppercase tracking-widest text-[#f5f2ed] cursor-pointer hover:shadow-lg transition-all"
            >
              {subType === "residential" ? "Analyze This Home" : subType === "land" ? "Reveal Land Potential" : "Analyze This Property"}
            </button>
          </motion.div>
        )}

        {/* Step 4: Output Intelligence Report Canvas */}
        {subType && isReportReady && !isCalculating && (
          <motion.div
            key="decision-intelligence-report"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Elegant Header Tag, highlighting dynamic/VIP status */}
            <div className="flex justify-between items-center bg-[#2b160c] p-4 rounded border border-[#633821]/45">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e5c1a7] block">
                  Quick Home Analysis
                </span>
                <span className="text-sm font-display text-transparent bg-clip-text bg-gradient-to-r from-[#f5f2ed] to-[#e5c1a7]/80 font-medium">
                  {activeTab === "vip" ? "Business Intelligence VIP Mode" : "Quick Affordability Snapshot"}
                </span>
              </div>

              {/* Seamless tab selectors resembling clean hardware controls */}
              <div className="flex bg-[#150d0a] border border-[#633821]/45 p-0.5 rounded-lg text-[10px] font-mono uppercase">
                <button
                  onClick={() => setActiveTab("quick")}
                  className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${activeTab === "quick" ? "bg-[#633821] text-[#f5f2ed]" : "text-[#eaddca]/60 hover:text-white"}`}
                >
                  Quick
                </button>
                <button
                  id="tab-vip-btn"
                  onClick={() => setActiveTab("vip")}
                  className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${activeTab === "vip" ? "bg-[#e5c1a7] text-[#150d0a] font-semibold" : "text-[#eaddca]/60 hover:text-white"}`}
                >
                  <Crown className="w-2.5 h-2.5" />
                  VIP
                </button>
              </div>
            </div>

            {/* Strategic interpretation replaces raw repeating copy */}
            <div className="p-5 rounded-lg border border-[#633821]/30 bg-[#2b160c]/80 relative overflow-hidden space-y-3">
              <div className="absolute top-3 right-3 text-[8.5px] font-mono uppercase px-2 py-0.5 rounded border border-[#633821]/30 bg-[#2b160c]/60 flex items-center gap-1.5 text-[#e5c1a7]">
                <Check className="w-3 h-3" />
                Axora Verified Verdict
              </div>

              <div className="flex gap-3 items-start">
                <span className={`inline-block w-3 h-3 rounded-full mt-1.5 ${
                  report.verifiedVerdict.status === "approved" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" :
                  report.verifiedVerdict.status === "conditional" ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
                  "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                }`} />
                <div className="space-y-1.5 flex-1 pr-24">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-medium text-[#f5f2ed] text-[15px]">{report.verifiedVerdict.title}</h3>
                    <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                      report.verifiedVerdict.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                      report.verifiedVerdict.status === "conditional" ? "bg-amber-500/10 text-amber-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {report.verifiedVerdict.status === "approved" ? "🟢 Comfortable" :
                       report.verifiedVerdict.status === "conditional" ? "🟠 Tight" : "🔴 Risky"}
                     </span>
                  </div>
                  <p className="text-xs text-[#eaddca]/70 font-light leading-relaxed">{report.verifiedVerdict.rationale}</p>
                  
                  {/* "Why did Axora say this?" collapsible dropdown */}
                  {subType === "residential" && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowVerdictDetails(!showVerdictDetails)}
                        className="text-[10px] font-mono text-[#e5c1a7]/80 hover:text-[#f5f2ed] transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer focus:outline-none"
                      >
                        <span>{showVerdictDetails ? "Press to Hide Rationale Details" : "Why did Axora calculate this verdict?"}</span>
                        <span className="text-xs">{showVerdictDetails ? "▲" : "▼"}</span>
                      </button>
                      {showVerdictDetails && (
                        <div className="mt-3.5 p-3.5 bg-[#150d0a]/60 rounded-lg border border-[#633821]/20 space-y-2 text-xs text-[#eaddca]/85 animate-fadeIn">
                          <div className="flex items-center gap-2">
                            <span className={(report as ResidentialReport).debtToIncomeRatio < 35 ? "text-emerald-400" : "text-amber-400"}>
                              {(report as ResidentialReport).debtToIncomeRatio < 35 ? "✓" : "⚠"}
                            </span>
                            <span>
                              {(report as ResidentialReport).debtToIncomeRatio < 35 
                                ? "Strong income buffer: Your monthly liabilities represent a healthy share of revenues." 
                                : "Taxing monthly load: Liabilities are starting to claim a heavy share of income."}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={(report as ResidentialReport).breathingRoom > 1500 ? "text-emerald-400" : "text-amber-400"}>
                              {(report as ResidentialReport).breathingRoom > 1500 ? "✓" : "⚠"}
                            </span>
                            <span>
                              {(report as ResidentialReport).breathingRoom > 1500 
                                ? "Comfortable buffer: Wide margin remains after all basic home expenses." 
                                : "Narrow buffer: Your monthly headroom might feel slightly confined."}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={(resInputs.downPayment / resInputs.purchasePrice) >= 0.2 ? "text-emerald-400" : "text-amber-400"}>
                              {(resInputs.downPayment / resInputs.purchasePrice) >= 0.2 ? "✓" : "⚠"}
                            </span>
                            <span>
                              {(resInputs.downPayment / resInputs.purchasePrice) >= 0.2 
                                ? "Healthy initial equity: You have crossed the conservative downpayment threshold." 
                                : "Lower security equity: Upfront deposit is under 20%, placing heavier pressure on the EMI."}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Unified Quick and VIP Report Section */}
            {activeTab === "quick" && (
              <div className="space-y-6">
                {subType === "residential" && (
                  <div className="space-y-5">
                    {/* Confidence & Breathing Area */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded border border-[#633821]/30 bg-[#150d0a] flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-[#eaddca]/60 tracking-wider uppercase font-semibold">Cash Confidence Score</span>
                        <div className="my-2.5 flex items-baseline gap-1">
                          <span id="residential-confidence-value" className="text-3xl font-display font-light text-[#e5c1a7]">{(report as ResidentialReport).cashConfidenceScore}</span>
                          <span className="text-xs font-mono text-[#eaddca]/50">/ 100</span>
                        </div>
                        <div className="space-y-2">
                          <div className="h-1 bg-[#150d0a] rounded-full overflow-hidden border border-[#633821]/30">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#633821] to-[#e5c1a7]" 
                              initial={{ width: 0 }}
                              animate={{ width: `${(report as ResidentialReport).cashConfidenceScore}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <p className="text-[10px] text-[#eaddca]/70 font-light leading-normal">
                            {(report as ResidentialReport).cashConfidenceScore >= 75 
                              ? "Your savings and income currently provide strong purchase stability." 
                              : (report as ResidentialReport).cashConfidenceScore >= 45 
                              ? "Average stability; slight planning adjustments recommended."
                              : "High financial pressure detected; reconsider or wait."}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded border border-[#633821]/30 bg-[#150d0a] flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-[#eaddca]/60 tracking-wider uppercase font-semibold block">Financial Breathing Room</span>
                        <div className="my-2.5 text-2xl font-display font-medium tracking-tight text-[#f5f2ed]" id="residential-breathing-value">
                          {formatValue((report as ResidentialReport).breathingRoom)}
                          <span className="text-[10px] font-light text-[#eaddca]/60 block mt-0.5">surplus each month</span>
                        </div>
                        <span className="text-[9.5px] text-[#eaddca]/60 font-light leading-relaxed block">
                          Your expected monthly comfort buffer after all major costs.
                        </span>
                      </div>
                    </div>

                    {/* Main section quick stats */}
                    <div className="grid grid-cols-3 gap-3 p-4.5 rounded border border-[#633821]/30 bg-[#2b160c]/40 text-center">
                      <div>
                        <span className="block text-[8px] font-mono text-[#eaddca]/60 uppercase font-semibold">Monthly EMI</span>
                        <span className="text-xs font-mono font-medium text-[#f5f2ed]" id="residential-emi">
                          {formatValue((report as ResidentialReport).emi)}
                        </span>
                      </div>
                      <div className="border-x border-[#633821]/30">
                        <span className="block text-[8px] font-mono text-[#eaddca]/60 uppercase font-semibold">Income Pressure</span>
                        <span className="text-xs font-mono font-medium text-[#f5f2ed]" id="residential-dti">
                          {(report as ResidentialReport).debtToIncomeRatio}%
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono text-[#eaddca]/60 uppercase font-semibold">Future Home Value (10Y)</span>
                        <span className="text-xs font-mono font-medium text-[#e5c1a7]">
                          {formatValue((report as ResidentialReport).futureValueScenarios.years10)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#2b160c] border border-[#633821]/30 rounded space-y-1.5 text-left">
                      <span className="text-[10px] font-mono uppercase text-[#e5c1a7]/80 block font-semibold">Want deeper future scenarios?</span>
                      <p className="text-xs text-[#eaddca]/75 font-light leading-relaxed">
                        Deep Analysis unlocks lifestyle stress testing, area growth forecasting, negotiation guidance, and advanced risk simulations.
                      </p>
                    </div>
                  </div>
                )}

                {subType === "land" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded border border-[#633821]/30 bg-[#150d0a] flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-[#eaddca]/65 uppercase block">Appreciation corridor</span>
                        <span id="land-grade-value" className="text-2xl font-display font-medium text-[#e5c1a7] my-2">{(report as LandReport).investmentGrade} Grade</span>
                        <p className="text-[10px] text-[#eaddca]/75 leading-relaxed">{(report as LandReport).gradeTitle}</p>
                      </div>

                      <div className="p-4 rounded border border-[#633821]/30 bg-[#150d0a] flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-[#eaddca]/65 uppercase block">Resale Liquidity Index</span>
                        <div className="my-2.5 flex items-baseline gap-1">
                          <span id="land-liquidity-value" className="text-2xl font-display text-white font-semibold">{(report as LandReport).liquidityScore}</span>
                          <span className="text-[10px] text-[#eaddca]/60 font-mono">/ 100</span>
                        </div>
                        <span className="text-[10px] text-[#e5c1a7] font-mono">{(report as LandReport).liquidityRating}</span>
                      </div>
                    </div>

                    {/* Scenario details */}
                    <div className="p-5 rounded border border-[#633821]/30 bg-[#2b160c]/40 space-y-4">
                      <span className="text-[10px] font-mono tracking-widest text-[#e5c1a7] uppercase block">
                        Holding tenure appreciation pathways ({landInputs.holdingPeriodYears} years)
                      </span>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2.5 rounded bg-[#150d0a] border border-[#633821]/20">
                          <span className="block text-[8px] font-mono text-[#eaddca]/60 uppercase">Conservative</span>
                          <span className="text-xs font-mono font-medium text-[#f5f2ed]" id="land-conservative">
                            {formatValue((report as LandReport).appreciationScenarios.cautious)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-[#150d0a] border border-[#633821]/30">
                          <span className="block text-[8px] font-mono text-[#e5c1a7] uppercase">Expected Line</span>
                          <span className="text-xs font-mono font-semibold text-[#e5c1a7]" id="land-expected">
                            {formatValue((report as LandReport).appreciationScenarios.expected)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-[#150d0a] border border-[#633821]/20">
                          <span className="block text-[8px] font-mono text-[#eaddca]/60 uppercase">Corridor Boom</span>
                          <span className="text-xs font-mono font-medium text-white">
                            {formatValue((report as LandReport).appreciationScenarios.aggressive)}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#eaddca]/70 font-light leading-relaxed">
                        Conservative line models slow infrastructure growth corridor. Expected uses baseline annual targets. Highly dependent on title preservation.
                      </p>
                    </div>

                    {/* Goal & Risk Alignment Results */}
                    {((report as LandReport).goalRationale || (report as LandReport).riskRationale) && (
                      <div className="p-5 rounded border border-[#633821]/30 bg-[#150d0a] space-y-4 text-left">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#633821]/15">
                          <Brain className="w-4 h-4 text-[#e5c1a7] animate-pulse" />
                          <span className="text-[10px] font-mono tracking-widest text-[#e5c1a7] uppercase block">
                            Vision & Risk Alignment Profile
                          </span>
                        </div>

                        {((report as LandReport).goalRationale) && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-mono tracking-wider text-[#eaddca]/60 block font-semibold">Strategic Goal Alignment</span>
                            <div className="p-3 rounded bg-[#2b160c]/25 border border-[#633821]/20 text-[11px] text-[#f5f2ed] leading-normal font-sans">
                              {(report as LandReport).goalRationale}
                            </div>
                          </div>
                        )}

                        {((report as LandReport).riskRationale) && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[9px] uppercase font-mono tracking-wider text-[#eaddca]/60 block font-semibold">Risk Tolerance Factor</span>
                            <div className="p-3 rounded bg-[#2b160c]/25 border border-[#633821]/20 text-[11px] text-[#f5f2ed] leading-normal font-sans">
                              {(report as LandReport).riskRationale}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {subType === "commercial" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded border border-[#633821]/30 bg-[#150d0a] flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-[#eaddca]/65 uppercase">Net Yield Rate</span>
                        <span className="text-3xl font-display font-light text-[#e5c1a7] my-2">{(report as CommercialReport).netYield}%</span>
                        <span className="text-[9px] text-[#eaddca]/60">Gross Yield: {(report as CommercialReport).grossYield}%</span>
                      </div>

                      <div className="p-4 rounded border border-[#633821]/30 bg-[#150d0a] flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-[#eaddca]/65 uppercase">Emi Surplus coverage</span>
                        <span className="text-2xl font-display text-white font-medium my-2">{formatValue((report as CommercialReport).breathingRoom)}</span>
                        <span className="text-[9px] text-[#eaddca]/60">Cash Flow Margin /mo</span>
                      </div>
                    </div>

                    <div className="p-5 rounded border border-[#633821]/30 bg-[#2b160c]/40 space-y-3">
                      <span className="text-[10px] font-mono text-[#e5c1a7]/80 uppercase block">Commercial Parameters</span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-light text-[#eaddca]/70">
                        <div>Cap Rate: <span className="font-mono text-white">{(report as CommercialReport).capRate}%</span></div>
                        <div>Vacancy Buffer: <span className="font-mono text-white">{commInputs.vacancyRate}%</span></div>
                        <div>Tenant Default risk: <span className="font-mono text-white">{(report as CommercialReport).tenantRiskRating}</span></div>
                        <div>Asset Value projection: <span className="font-mono text-white">{formatValue((report as CommercialReport).futureValue)}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIP Intelligence Suite Content */}
            {activeTab === "vip" && (
              <div className="space-y-6">
                <div className="text-center space-y-2 py-2">
                  <h3 className="font-display text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#f5f2ed] to-[#e5c1a7] tracking-tight">
                    Private Property Intelligence Suite
                  </h3>
                  <p className="text-xs text-[#eaddca]/70 max-w-md mx-auto leading-relaxed">
                    Axora Wealth Group has authorized your direct gateway to Gemini decision engines. Toggle strategies, run macro simulations or draft covenants.
                  </p>
                </div>

                {/* Sub-tab selection menu for VIP Room */}
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#150d0a] p-1.5 rounded-lg border border-[#633821]/45 font-sans font-medium text-[11px] gap-1">
                  <button
                    onClick={() => setVipSubTab("wealth-advisor")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "wealth-advisor"
                        ? "bg-[#e5c1a7] text-[#150d0a] font-bold shadow-md"
                        : "text-[#eaddca]/70 hover:text-white hover:bg-[#2b160c]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Wealth Advisor</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </button>

                  <button
                    onClick={() => setVipSubTab("negotiable-letters")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "negotiable-letters"
                        ? "bg-[#e5c1a7] text-[#150d0a] font-bold shadow-md"
                        : "text-[#eaddca]/70 hover:text-white hover:bg-[#2b160c]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Letters Copilot</span>
                  </button>

                  <button
                    onClick={() => setVipSubTab("strategic-briefing")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "strategic-briefing"
                        ? "bg-[#e5c1a7] text-[#150d0a] font-bold shadow-md"
                        : "text-[#eaddca]/70 hover:text-white hover:bg-[#2b160c]"
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Decision Briefing</span>
                  </button>

                  <button
                    onClick={() => setVipSubTab("sliders")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "sliders"
                        ? "bg-[#e5c1a7] text-[#150d0a] font-bold shadow-md"
                        : "text-[#eaddca]/70 hover:text-white hover:bg-[#2b160c]"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Sandbox Sliders</span>
                  </button>
                </div>

                {/* Sub-Tab 1: AI Wealth Advisor Chat */}
                {vipSubTab === "wealth-advisor" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-lg border border-[#633821]/30 bg-[#2b160c]/80 space-y-4"
                  >
                    {/* AXORA PROPERTY ADVISOR Conversation Cards */}
                    <div className="p-4 rounded-xl bg-[#150d0a]/80 border border-[#e5c1a7]/35 space-y-3.5 shadow-md">
                      <div className="flex items-center gap-1.5 border-b border-[#633821]/20 pb-2">
                        <MessageSquare className="w-4 h-4 text-[#e5c1a7]" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e5c1a7] font-semibold">
                          AXORA PROPERTY ADVISOR
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Card 1: Current Position */}
                        <div className="p-3 bg-[#2b160c]/40 rounded-lg border border-[#633821]/25 space-y-1">
                          <span className="text-[9.5px] font-mono uppercase text-[#eaddca]/60 block font-semibold">Current Position</span>
                          <div className="text-xs font-semibold text-[#f5f2ed] flex items-center gap-1.5">
                            {subType === "residential" ? (
                              (report as ResidentialReport).debtToIncomeRatio < 35 
                                ? "🟢 Financially safe purchase" 
                                : (report as ResidentialReport).debtToIncomeRatio < 50 
                                ? "🟠 Tight & high pressure purchase" 
                                : "🔴 Risky & heavy liability burden"
                            ) : subType === "land" ? (
                              "🟢 Positive layout & clear valuation"
                            ) : (
                              "🟢 Solid performing capital asset"
                            )}
                          </div>
                        </div>

                        {/* Card 2: Biggest Risk */}
                        <div className="p-3 bg-[#2b160c]/40 rounded-lg border border-[#633821]/25 space-y-1">
                          <span className="text-[9.5px] font-mono uppercase text-[#eaddca]/60 block font-semibold">Biggest Risk</span>
                          <div className="text-xs font-semibold text-[#f5f2ed] flex items-center gap-1.5">
                            {subType === "residential" ? (
                              resInputs.downPayment / resInputs.purchasePrice < 0.2 
                                ? "⚠️ Low equity contribution increases debt pressure" 
                                : "⚠️ Interest rate sensitivity after Year 3"
                            ) : subType === "land" ? (
                              "⚠️ Holding liquidity block & regional infrastructure delay"
                            ) : (
                              "⚠️ Tenant default concentration vacancy risks"
                            )}
                          </div>
                        </div>

                        {/* Card 3: Strongest Advantage */}
                        <div className="p-3 bg-[#2b160c]/40 rounded-lg border border-[#633821]/25 space-y-1">
                          <span className="text-[9.5px] font-mono uppercase text-[#eaddca]/60 block font-semibold">Strongest Advantage</span>
                          <div className="text-xs font-semibold text-[#f5f2ed]">
                            {subType === "residential" ? (
                              (report as ResidentialReport).breathingRoom > 1500 
                                ? "🏡 Low lifestyle strain & healthy comfort buffer" 
                                : "🏡 Highly rentable asset class shields raw costs"
                            ) : subType === "land" ? (
                              "🌱 Prime development potential & clean title markers"
                            ) : (
                              "🏢 NNN lease protection shifts upkeep liability to tenants"
                            )}
                          </div>
                        </div>

                        {/* Card 4: Recommended Next Move */}
                        <div className="p-3 bg-[#2b160c]/40 rounded-lg border border-[#633821]/25 space-y-1">
                          <span className="text-[9.5px] font-mono uppercase text-[#eaddca]/60 block font-semibold">Recommended Next Move</span>
                          <div className="text-xs font-semibold text-[#e5c1a7]">
                            {subType === "residential" ? (
                              "📉 Negotiate 5–7% below listing price"
                            ) : subType === "land" ? (
                              "📜 Secure local legal path easements"
                            ) : (
                              "✍️ Secure anchor tenants with long lock-in covenants"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#eaddca]/65">Ask Axora Anything</span>
                      <div className="h-44 overflow-y-auto space-y-3 p-3 bg-[#150d0a] rounded border border-[#633821]/20 select-text scrollbar-thin">
                        {wealthMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`p-3 rounded-lg text-xs max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                                msg.role === "user"
                                  ? "bg-[#633821] text-[#f5f2ed] rounded-br-none"
                                  : "bg-[#2b160c] text-[#eaddca]/90 border border-[#633821]/30 rounded-bl-none font-light"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {isWealthLoading && (
                          <div className="flex justify-start">
                            <div className="p-3 bg-[#2b160c] border border-[#633821]/20 rounded-lg rounded-bl-none text-xs text-[#eaddca]/65 flex items-center gap-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e5c1a7]" />
                              <span>Axora is conducting asset scenario stress-tests...</span>
                            </div>
                          </div>
                        )}
                        {wealthError && (
                          <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded">
                            {wealthError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono uppercase text-[#eaddca]/55">SUGGESTED CLIENT SCENARIOS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {subType === "residential" && [
                          "How can I buy down this rate by 1%?",
                          "Is my debt-to-income ratio safe for structural changes?",
                          "What covenants protect me from developer late fees?"
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => setWealthInput(q)}
                            className="text-[10px] text-[#eaddca]/75 bg-[#150d0a]/50 border border-[#633821]/25 rounded px-2.5 py-1 hover:border-[#e5c1a7] transition-colors cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                        {subType === "land" && [
                          "How do I guarantee clear title boundary mapping?",
                          "Suggestions for negotiating developer pre-payment terms?",
                          "How does severe road access delays affect holding taxes?"
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => setWealthInput(q)}
                            className="text-[10px] text-[#eaddca]/75 bg-[#150d0a]/50 border border-[#633821]/25 rounded px-2.5 py-1 hover:border-[#e5c1a7] transition-colors cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                        {subType === "commercial" && [
                          "What lease clauses protect me from commercial vacancy defaults?",
                          "How can I structure a Triple Net Lease (NNN) covenant?",
                          "Evaluate macro risk of speculative tenant profiles vs retail."
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => setWealthInput(q)}
                            className="text-[10px] text-[#eaddca]/75 bg-[#150d0a]/50 border border-[#633821]/25 rounded px-2.5 py-1 hover:border-[#e5c1a7] transition-colors cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSendWealthMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={wealthInput}
                        onChange={(e) => setWealthInput(e.target.value)}
                        placeholder="Ask about rate buy-downs, legal exits, tax deductions..."
                        className="flex-1 bg-[#150d0a] border border-[#633821]/30 rounded px-3 py-2 text-xs text-[#f5f2ed] focus:border-[#e5c1a7] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isWealthLoading || !wealthInput.trim()}
                        className="px-4 py-2 bg-[#e5c1a7] disabled:bg-[#e5c1a7]/20 disabled:text-[#eaddca]/35 text-[#150d0a] font-mono text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer hover:bg-[#f5d0bd] transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>SEND</span>
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Sub-Tab 2: AI Negotiable Letters Copilot */}
                {vipSubTab === "negotiable-letters" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-lg border border-[#633821]/30 bg-[#2b160c]/80 space-y-5"
                  >
                    <div className="border-b border-[#633821]/20 pb-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e5c1a7] font-semibold">Letters Copilot</span>
                        <h4 className="font-display text-[#f5f2ed] text-sm">Strategic Deal Communications</h4>
                      </div>
                      <span className="text-[10px] text-[#eaddca]/50 font-mono tracking-wider">HARVEY AI ENGINE powered</span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono uppercase text-[#eaddca]/60 block font-semibold">What do you need help with?</span>
                      
                      {/* Scenario Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {[
                          {
                            id: "negotiate-price",
                            label: "Negotiate Lower Price",
                            scenario: "Offer to Purchase with Custom Price Negotiation",
                            objective: "Propose a firm 5-8% discount off asking price based on macroeconomic rate environments and verified liquidity contributions.",
                            recipient: "Listing Broker & Lead Vendor"
                          },
                          {
                            id: "delay-possession",
                            label: "Delay Possession Terms",
                            scenario: "Extend Handover/Possession Clause",
                            objective: "Propose an extended 60-day possession delay parameter to facilitate safe cash-liquidation, free of penalty brackets.",
                            recipient: "Property Developer"
                          },
                          {
                            id: "structural-inspection",
                            label: "Ask For Structural Inspection",
                            scenario: "Offer Contingent on Structural Inspection",
                            objective: "Add structural survey, drainage soundness, and roof safety contingencies under absolute escrow guarantees.",
                            recipient: "Listing Broker"
                          },
                          {
                            id: "reduce-maintenance",
                            label: "Reduce Maintenance Charges",
                            scenario: "Mitigate Common Upkeep Assessments",
                            objective: "Request a 2-year capped restriction or lower base maintenance fees during early occupation stages to offset monthly pressure.",
                            recipient: "Building Developer / HOA Chair"
                          },
                          {
                            id: "investor-rental",
                            label: "Investor Rental Proposal",
                            scenario: "Pre-Lease Escrow Outline",
                            objective: "Propose immediate pre-leasing covenants with locked minimum indexations to protect early investor yield assets.",
                            recipient: "Corporate Commercial Agent"
                          }
                        ].map((opt) => {
                          const isSelected = letterScenario === opt.scenario;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                setLetterScenario(opt.scenario);
                                setLetterObjective(opt.objective);
                                setRecipient(opt.recipient);
                              }}
                              className={`p-3 rounded-lg text-left cursor-pointer transition-all border text-xs flex flex-col justify-between h-20 ${
                                isSelected
                                  ? "bg-[#e5c1a7] border-[#e5c1a7] text-[#150d0a]"
                                  : "bg-[#150d0a]/60 border-[#633821]/30 text-[#eaddca]/80 hover:bg-[#150d0a] hover:border-[#633821]/60"
                              }`}
                            >
                              <span className="font-semibold block">{opt.label}</span>
                              <span className={`text-[9.5px] line-clamp-1 font-mono uppercase tracking-wide block ${isSelected ? "text-[#150d0a]/70" : "text-[#eaddca]/45"}`}>
                                {opt.recipient}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Form Details */}
                      <div className="space-y-4">
                        {/* Custom Tone Pills */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase text-[#eaddca]/65 block font-semibold">Select Tone</label>
                          <div className="flex flex-wrap gap-1.5">
                            {["Friendly", "Firm", "Professional", "Aggressive", "Luxury Buyer"].map((t) => {
                              const isSelected = letterTone === t || (t === "Luxury Buyer" && letterTone === "Luxury Buyer");
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setLetterTone(t)}
                                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono transition-all cursor-pointer border ${
                                    isSelected
                                      ? "bg-[#633821] border-[#e5c1a7] text-[#f5f2ed]"
                                      : "bg-[#150d0a] border-[#633821]/30 text-[#eaddca]/70 hover:border-[#633821]"
                                  }`}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recipient */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-[#eaddca]/65 block font-semibold">Recipient name</label>
                          <input
                            type="text"
                            value={letterRecipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full bg-[#150d0a] border border-[#633821]/25 rounded p-2.5 text-xs text-[#f5f2ed] focus:outline-none focus:border-[#e5c1a7] transition-all"
                          />
                        </div>

                        {/* Special Objectives */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-[#eaddca]/65 block font-semibold">Resolution Targets & Objective</label>
                          <textarea
                            value={letterObjective}
                            onChange={(e) => setLetterObjective(e.target.value)}
                            className="w-full h-20 bg-[#150d0a] border border-[#633821]/25 rounded p-2 text-xs text-[#f5f2ed] resize-none focus:outline-none focus:border-[#e5c1a7] transition-all"
                          />
                        </div>

                        {/* Custom addition parameters */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-[#eaddca]/65 block font-semibold">Add Context (Optional)</label>
                          <input
                            type="text"
                            value={letterCustom}
                            onChange={(e) => setLetterCustom(e.target.value)}
                            placeholder="e.g. adjacent plot pricing discrepancy, local water connection delay"
                            className="w-full bg-[#150d0a] border border-[#633821]/25 rounded p-2.5 text-xs text-[#f5f2ed] focus:outline-none focus:border-[#e5c1a7] transition-all"
                          />
                        </div>

                        <button
                          onClick={handleGeneratePropertyLetter}
                          disabled={isGeneratingLetter}
                          className="w-full py-2.5 bg-[#e5c1a7] disabled:bg-[#e5c1a7]/20 disabled:text-[#eaddca]/30 hover:bg-[#f5d0bd] font-mono font-bold text-xs text-[#150d0a] uppercase tracking-wider rounded cursor-pointer transition-all flex items-center justify-center gap-2"
                        >
                          {isGeneratingLetter ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Compiling Strategic Letter...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              <span>Draft Official Letter</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Apple Mail Style Right Preview Feedback */}
                      <div className="bg-[#150d0a] border border-[#633821]/30 rounded-lg p-4.5 flex flex-col justify-between h-[360px] relative">
                        {!aiSubject && !isGeneratingLetter && (
                          <div className="h-full flex flex-col items-center justify-center text-center text-[#eaddca]/50 space-y-2">
                            <FileText className="w-10 h-10 text-[#633821]/50" />
                            <p className="text-xs font-light max-w-xs">
                              Select a scenario, set your communication tone, and draft list letters representing calm billionaire confidence.
                            </p>
                          </div>
                        )}

                        {isGeneratingLetter && (
                          <div className="h-full flex flex-col items-center justify-center text-center text-[#eaddca]/65 space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-[#e5c1a7]" />
                            <p className="text-xs">
                              Structuring contractual safeguards with customized tactical leverage...
                            </p>
                          </div>
                        )}

                        {aiSubject && !isGeneratingLetter && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col select-text overflow-hidden text-left"
                          >
                            <div className="border-b border-[#633821]/20 pb-2.5 mb-2.5 space-y-1">
                              <div className="flex justify-between items-center text-[10px] text-[#eaddca]/50 font-mono">
                                <span>FROM: CLIENT CORRESPONDENT</span>
                                <span className="text-[#e5c1a7]">PREVIEW</span>
                              </div>
                              <div className="text-xs text-[#eaddca] font-mono font-medium">To: {letterRecipient}</div>
                              <div className="text-xs text-[#f5f2ed] font-mono font-semibold">Subject: {aiSubject}</div>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 text-[11.5px] leading-relaxed text-[#eaddca]/85 whitespace-pre-wrap font-light scrollbar-thin">
                              {aiBody}
                            </div>
                          </motion.div>
                        )}

                        {letterError && (
                          <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded">
                            {letterError}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Sub-Tab 3: AI Strategic Property Audit Memo */}
                {vipSubTab === "strategic-briefing" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-lg border border-[#633821]/30 bg-[#2b160c]/80 space-y-5 text-left"
                  >
                    <div className="border-b border-[#633821]/20 pb-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#e5c1a7] font-semibold">Axora Private Intelligence</span>
                        <h4 className="font-display text-[#f5f2ed] text-sm">Decision Briefing</h4>
                      </div>
                      <span className="text-[10.5px] text-[#eaddca]/50 font-mono tracking-wider">SECURED BRIEFING</span>
                    </div>

                    <div className="space-y-4">
                      {/* Final Recommendation */}
                      <div className="p-4 rounded-lg bg-[#150d0a]/70 border border-[#633821]/30 flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wide text-[#eaddca]/70 font-semibold">Final Recommendation</span>
                        <span className={`text-xs font-bold font-mono uppercase px-3 py-1 rounded-full ${
                          subType === "residential" ? (
                            (report as ResidentialReport).debtToIncomeRatio < 35 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                              : (report as ResidentialReport).debtToIncomeRatio < 50 
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                          ) : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                        }`}>
                          {subType === "residential" ? (
                            (report as ResidentialReport).debtToIncomeRatio < 35 
                              ? "🟢 Proceed Confidently" 
                              : (report as ResidentialReport).debtToIncomeRatio < 50 
                              ? "🟠 Proceed Carefully" 
                              : "🔴 Reconsider Terms"
                          ) : "🟢 Proceed Confidently"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Section A: Why Axora Is Concerned */}
                        <div className="p-4 rounded-lg bg-[#150d0a]/50 border border-[#633821]/20 space-y-2.5">
                          <h5 className="text-[11px] font-mono uppercase text-[#e5c1a7] font-semibold tracking-wide">Why Axora Is Concerned</h5>
                          <ul className="space-y-2 text-xs text-[#eaddca]/80">
                            {subType === "residential" ? (
                              <>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#e5c1a7]">✦</span>
                                  <span>Monthly EMI pressure claim represents {(report as ResidentialReport).debtToIncomeRatio}% of household income.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#e5c1a7]">✦</span>
                                  <span>Local savings cover provides moderate room for unforeseen transactional overheads.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#e5c1a7]">✦</span>
                                  <span>Interest rate spikes can trigger sudden, severe cash flow reductions.</span>
                                </li>
                              </>
                            ) : subType === "land" ? (
                              <>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#e5c1a7]">✦</span>
                                  <span>Holding capital outlays may compromise exit profitability limits.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#e5c1a7]">✦</span>
                                  <span>Zoning adjustments require extensive, unguaranteed legal procedures.</span>
                                </li>
                              </>
                            ) : (
                              <>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#e5c1a7]">✦</span>
                                  <span>Structural management outlays can fluctuate unexpectedly depending on tenant uses.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[#e5c1a7]">✦</span>
                                  <span>Tenant concentration default risks are high in regional retail spheres.</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>

                        {/* Section B: Hidden Risks */}
                        <div className="p-4 rounded-lg bg-[#150d0a]/50 border border-[#633821]/20 space-y-2.5">
                          <h5 className="text-[11px] font-mono uppercase text-rose-400 font-semibold tracking-wide flex items-center gap-1">
                            ⚠️ Hidden Risks
                          </h5>
                          <ul className="space-y-2 text-xs text-[#eaddca]/80">
                            {subType === "residential" ? (
                              <>
                                <li className="flex items-start gap-2">
                                  <span className="text-rose-400 font-bold">•</span>
                                  <span>Property taxes may rise after local revaluations.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-rose-400 font-bold">•</span>
                                  <span>Maintenance upkeep or HOA levies are consistently underestimated in vendor sheets.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-rose-400 font-bold">•</span>
                                  <span>Special assessments are often hidden within early HOA minutes.</span>
                                </li>
                              </>
                            ) : (
                              <>
                                <li className="flex items-start gap-2">
                                  <span className="text-rose-400 font-bold">•</span>
                                  <span>Project construction delays could freeze continuous holding reserves.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-rose-400 font-bold">•</span>
                                  <span>Regional zoning modifications can reduce land boundary value flexibility.</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Best Negotiation Angle */}
                      <div className="p-4 rounded-lg bg-[#2b160c]/40 border border-[#633821]/30 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#e5c1a7] block font-semibold">Best Negotiation Angle</span>
                        <p className="text-xs text-[#f5f2ed] italic leading-relaxed">
                          💬 "Use current borrowing interest rates as strategic leverage to negotiate a 5–8% lower listing price."
                        </p>
                      </div>

                      {/* Worst-Case Scenario */}
                      <div className="p-4 rounded-lg bg-[#150d0a]/60 border border-[#633821]/25 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-rose-400 block font-semibold">Worst-Case Scenario</span>
                          <span className="text-xs font-semibold text-[#f5f2ed] mt-1 block">
                            {subType === "residential" 
                              ? "📉 Sudden tenant vacancy could drain 40% of your reserve cash buffer." 
                              : "📉 Delayed road connectivity might freeze land utility plans permanently."}
                          </span>
                        </div>
                        
                        {/* Smart Buyer Checklist */}
                        <div className="space-y-2 border-t md:border-t-0 md:border-l border-[#633821]/20 pt-3.5 md:pt-0 md:pl-4 text-left">
                          <span className="text-[10px] font-mono uppercase text-[#eaddca]/65 block font-semibold">Smart Buyer Checklist</span>
                          <div className="space-y-1.5 text-xs text-[#eaddca]/85">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span>Build 6-month secure emergency cash reserve</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span>Avoid floating variable-rate financing models</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              <span>Insist on seller structural concessions before close</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {vipSubTab === "sliders" && (
                  <div className="space-y-6 text-left">
                    {subType === "residential" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                      >
                        {/* Left Column: Storytelling Sliders (7 cols) */}
                        <div className="lg:col-span-7 space-y-5">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono tracking-widest text-[#e5c1a7] uppercase block font-semibold">Stress Testing Studio</span>
                            <h4 className="font-display text-[#f5f2ed] text-lg font-medium">What if thing changes?</h4>
                            <p className="text-xs text-[#eaddca]/65">Drag the sliders below to stress-test your life against macro-economic shocks.</p>
                          </div>

                          <div className="space-y-5 p-5 rounded-lg border border-[#633821]/30 bg-[#150d0a]/65">
                            {/* Slider 1: Mortgage rate spike */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                  <span className="text-xs font-semibold text-[#f5f2ed] block">1. What if mortgage interest rates spike?</span>
                                  <span className="text-[10px] text-[#eaddca]/60 block">Simulate post-Year 3 floating rate trigger spikes.</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-[#e5c1a7] bg-[#2b160c] px-2 py-1 rounded">
                                  {whatIfRate !== null ? `${whatIfRate.toFixed(2)}%` : `Baseline (${resInputs.interestRate}%)`}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="4"
                                max="12"
                                step="0.1"
                                value={whatIfRate !== null ? whatIfRate : resInputs.interestRate}
                                onChange={(e) => setWhatIfRate(Number(e.target.value))}
                                className="w-full h-1 bg-[#2b160c] rounded-lg appearance-none cursor-pointer accent-[#e5c1a7]"
                              />
                              <p className="text-[10.5px] italic text-[#eaddca]/50">
                                {whatIfRate !== null && whatIfRate > 8 
                                  ? "⚠️ Rate is highly elevated. This adds substantial weight to your monthly debt commitment."
                                  : "✓ Rates remain in stable, historically manageable corridors."}
                              </p>
                            </div>

                            {/* Slider 2: Income compression risk */}
                            <div className="space-y-2 border-t border-[#633821]/15 pt-4">
                              <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                  <span className="text-xs font-semibold text-[#f5f2ed] block">2. What if your household income compresses?</span>
                                  <span className="text-[10px] text-[#eaddca]/60 block">Simulate salary cuts, global recessions, or job gaps.</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-[#e5c1a7] bg-[#2b160c] px-2 py-1 rounded">
                                  {whatIfIncomeRatio === 1 ? "Fully Secure (100%)" : `${Math.round(whatIfIncomeRatio * 100)}% of income`}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="1"
                                step="0.05"
                                value={whatIfIncomeRatio}
                                onChange={(e) => setWhatIfIncomeRatio(Number(e.target.value))}
                                className="w-full h-1 bg-[#2b160c] rounded-lg appearance-none cursor-pointer accent-[#e5c1a7]"
                              />
                              <p className="text-[10.5px] italic text-[#eaddca]/50">
                                {whatIfIncomeRatio < 0.8 
                                  ? "⚠️ Imposing severe income strain. Let's look at how much cushion you have left on the right."
                                  : "✓ Income is fully secure within standard reserves."}
                              </p>
                            </div>

                            {/* Slider 3: Price Negotiation discount */}
                            <div className="space-y-2 border-t border-[#633821]/15 pt-4">
                              <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                  <span className="text-xs font-semibold text-[#f5f2ed] block">3. What if you negotiate a tighter discount?</span>
                                  <span className="text-[10px] text-[#eaddca]/60 block">Shave off up to 15% of the listing price at close.</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-emerald-400 bg-[#150d0a] px-2 py-1 rounded">
                                  -{formatValue(whatIfPriceReduction)}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={resInputs.purchasePrice * 0.15}
                                step="5000"
                                value={whatIfPriceReduction}
                                onChange={(e) => setWhatIfPriceReduction(Number(e.target.value))}
                                className="w-full h-1 bg-[#2b160c] rounded-lg appearance-none cursor-pointer accent-[#e5c1a7]"
                              />
                            </div>

                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => {
                                  setWhatIfRate(null);
                                  setWhatIfIncomeRatio(1);
                                  setWhatIfPriceReduction(0);
                                }}
                                className="text-[10px] font-mono text-[#eaddca]/60 hover:text-white underline cursor-pointer"
                              >
                                Reset Simulation
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: LIVE Visual Verdict (5 cols) */}
                        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                          <div className="p-5 rounded-lg border border-[#633821]/45 bg-[#2b160c]/70 space-y-4">
                            <span className="text-[10px] font-mono tracking-widest text-[#e5c1a7] uppercase block font-semibold">Live Simulation Verdict</span>
                            
                            {/* Animated Verdict Badge */}
                            <motion.div 
                              key={(report as ResidentialReport).humanSafetyReport.status}
                              initial={{ scale: 0.95, opacity: 0.8 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`p-4 rounded-lg border text-center ${
                                (report as ResidentialReport).humanSafetyReport.status === "safe" 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                                  : (report as ResidentialReport).humanSafetyReport.status === "caution" 
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                              }`}
                            >
                              <span className="text-[10px] font-mono uppercase tracking-widest block opacity-70">CURRENT HEALTH</span>
                              <span className="text-sm font-display font-semibold block mt-0.5">
                                {(report as ResidentialReport).humanSafetyReport.status === "safe" && "🟢 FINANCIALLY SECURE"}
                                {(report as ResidentialReport).humanSafetyReport.status === "caution" && "🟠 CAUTION WARRANTED"}
                                {(report as ResidentialReport).humanSafetyReport.status === "danger" && "🔴 HIGHLY STRESSED"}
                              </span>
                            </motion.div>

                            {/* Breathing room dynamic metric */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-[#eaddca]/60 uppercase block">Monthly Breathing Room</span>
                              <div className="text-3xl font-display font-bold text-white tracking-tight">
                                {formatValue((report as ResidentialReport).breathingRoom)}
                              </div>
                              <p className="text-[11px] text-[#eaddca]/75 font-light leading-relaxed">
                                {(report as ResidentialReport).humanSafetyReport.lifestyleImpact}
                              </p>
                            </div>
                          </div>

                          {/* Dynamic Spoken Script Playbook */}
                          <div className="p-5 rounded-lg border border-[#633821]/30 bg-[#150d0a]/80 space-y-3">
                            <span className="text-[9px] font-mono tracking-widest text-[#eaddca]/55 uppercase block font-semibold">How to talk to the Seller</span>
                            
                            <div className="space-y-1">
                              <span className="text-[9.5px] text-[#eaddca]/50 font-mono">RECOMMENDED OPTIMAL OFFER</span>
                              <p className="text-lg font-display text-emerald-400 font-semibold">
                                {formatValue((report as ResidentialReport).negotiationScript.recommendedOffer)}
                              </p>
                            </div>

                            <div className="space-y-1 border-t border-[#633821]/15 pt-2.5">
                              <span className="text-[9px] font-mono text-[#eaddca]/50 block">OPENING SCRIPT FOR BROKER:</span>
                              <p className="text-xs text-[#f5f2ed] italic leading-relaxed pl-2 border-l-2 border-[#e5c1a7] py-0.5 bg-[#2b160c]/10 rounded">
                                "{(report as ResidentialReport).negotiationScript.openingLine}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {subType === "land" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        {/* Interactive land toggle */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono tracking-widest text-[#e5c1a7] uppercase block font-semibold">Land Scenarios</span>
                            <h4 className="font-display text-[#f5f2ed] text-lg font-medium">Test Real-world Land Hazards</h4>
                          </div>

                          <div className="p-5 rounded-lg border border-[#633821]/30 bg-[#150d0a]/65 space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-[#2b160c]/20 border border-transparent hover:border-[#633821]/20 transition-all">
                              <input
                                type="checkbox"
                                checked={whatIfDelayInfra}
                                onChange={(e) => setWhatIfDelayInfra(e.target.checked)}
                                className="accent-[#e5c1a7] mt-1"
                              />
                              <div className="space-y-1">
                                <span className="text-xs text-white block font-semibold">What if primary utilities are delayed by 3 years?</span>
                                <p className="text-[11px] text-[#eaddca]/65 leading-relaxed">Simulates delayed road, water, and power connection lines creating sterile holding liability hazards.</p>
                              </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-[#2b160c]/20 border border-transparent hover:border-[#633821]/20 transition-all border-t border-[#633821]/15 pt-4">
                              <input
                                type="checkbox"
                                checked={whatIfSlowGrowth}
                                onChange={(e) => setWhatIfSlowGrowth(e.target.checked)}
                                className="accent-[#e5c1a7] mt-1"
                              />
                              <div className="space-y-1">
                                <span className="text-xs text-white block font-semibold">What if regional appreciation flattens?</span>
                                <p className="text-[11px] text-[#eaddca]/65 leading-relaxed">Appreciation parameters fall back into a low-growth 1.5% development band.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Land Risks Output */}
                        <div className="p-5 rounded-lg border border-[#633821]/45 bg-[#2b160c]/70 space-y-4">
                          <div className="flex justify-between items-center border-b border-[#633821]/25 pb-2">
                            <span className="text-[10px] font-mono uppercase text-[#e5c1a7] font-semibold">Exit Liquidation Suitability</span>
                            <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border font-semibold ${
                              (report as LandReport).exitRisk.level === "Low" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              {(report as LandReport).exitRisk.level} RISK ZONE
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            <span className="text-[10px] font-mono uppercase text-[#eaddca]/50 block">CRITICAL SUITABILITY WARNINGS:</span>
                            <ul className="space-y-2">
                              {(report as LandReport).exitRisk.warnings.map((warning, index) => (
                                <li key={index} className="flex gap-2 items-start text-xs text-[#eaddca]/80 leading-relaxed">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {subType === "commercial" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-lg border border-[#633821]/30 bg-[#150d0a]/65 space-y-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono tracking-widest text-[#e5c1a7] uppercase block font-semibold">Commercial Yield Sandbox</span>
                          <h4 className="font-display text-[#f5f2ed] text-lg font-medium">Commercial Stress Analyzer</h4>
                          <p className="text-xs text-[#eaddca]/65">Commercial performance operates purely on Cap Rate thresholds and tenant anchor status stability.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="p-4 bg-[#2b160c]/40 rounded border border-[#633821]/15 space-y-1">
                            <span className="text-[10px] font-mono text-[#eaddca]/50 uppercase block">Yield Cap Rate</span>
                            <span className="text-lg font-semibold text-white">{(report as CommercialReport).capRate}%</span>
                            <p className="text-[11px] text-[#eaddca]/60 leading-relaxed mt-1">Reflects regional tenant cash generation index.</p>
                          </div>
                          <div className="p-4 bg-[#2b160c]/40 rounded border border-[#633821]/15 space-y-1">
                            <span className="text-[10px] font-mono text-[#eaddca]/50 uppercase block">Tenant Credit Quality</span>
                            <span className="text-lg font-semibold text-[#e5c1a7]">{(report as CommercialReport).tenantRiskRating}</span>
                            <p className="text-[11px] text-[#eaddca]/60 leading-relaxed mt-1">Macro corporate buffer index rating.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Clear workflow actions */}
            <div className="flex gap-4 pt-4 border-t border-[#633821]/30">
              <button
                onClick={() => setIsReportReady(false)}
                className="flex-1 py-3 bg-[#150d0a] hover:bg-[#2b160c] text-xs font-mono uppercase text-[#e5c1a7] rounded border border-[#633821]/30 cursor-pointer text-center"
              >
                Change numbers
              </button>
              <button
                onClick={handleTransitionBack}
                className="flex-1 py-3 bg-[#633821] hover:bg-[#78442a] text-xs font-mono uppercase text-[#f5f2ed] rounded cursor-pointer text-center"
              >
                Start New Decision
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
