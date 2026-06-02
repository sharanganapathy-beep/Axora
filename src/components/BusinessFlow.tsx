/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  Upload, 
  Sparkles, 
  ArrowLeft, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Crown, 
  ChevronRight, 
  TrendingUp, 
  X, 
  Check, 
  Coins, 
  Clock, 
  FileSpreadsheet,
  Copy,
  BookOpen,
  DollarSign,
  Eye,
  Building2,
  MessageSquare,
  Send,
  Loader2,
  FileText,
  Brain,
  Globe,
  Download
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { BusinessInputs, BusinessReport } from "../types";
import { computeBusinessReport } from "../utils/calculations";
import { generateCfoChat, generateCfoEmail, generateCfoStrategicAudit } from "../utils/gemini";

interface BusinessFlowProps {
  onBack: () => void;
  currency: "USD" | "EUR" | "GBP" | "INR" | "AED";
}

export default function BusinessFlow({ onBack, currency }: BusinessFlowProps) {
  // Business Profile States
  const [profileSelected, setProfileSelected] = useState(false);
  const [industry, setIndustry] = useState<string>("saas");
  const [teamSize, setTeamSize] = useState<number>(5);
  const [yearsOperating, setYearsOperating] = useState<number>(2);
  const [ownerGoal, setOwnerGoal] = useState<string>("scale");
  const [customIndustry, setCustomIndustry] = useState<string>("");
  const [isEditingTeam, setIsEditingTeam] = useState<boolean>(false);
  const [isEditingYears, setIsEditingYears] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const formatYearsOperating = (y: number) => {
    if (y === 0) return "Just launched (< 3 mos)";
    if (y === 0.25) return "3 months";
    if (y === 0.5) return "6 months";
    if (y === 0.75) return "9 months";
    if (y === 1) return "1 year";
    if (y === 1.25) return "1.25 years (15 mos)";
    if (y === 1.5) return "1.5 years (18 mos)";
    if (y === 1.75) return "1.75 years (21 mos)";
    return `${y} years`;
  };

  const toggleHint = (field: string) => {
    setActiveHint(activeHint === field ? null : field);
  };

  const [inputMethod, setInputMethod] = useState<"upload" | "manual" | null>(null);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [currentParseStep, setCurrentParseStep] = useState(0);
  const [showExtractedReview, setShowExtractedReview] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick" | "vip">("quick");

  // Cinematic calculating states
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);

  const calcLoadingStories = [
    "Re-calibrating liquidity position under industry stress weights...",
    "Rebalancing operational burn rates against active payroll levels...",
    "Simulating strategic client attrition and runway horizons...",
    "Authoring clinical private advisor action plan..."
  ];

  // What-If Sliders state
  const [whatIfSalesDrop, setWhatIfSalesDrop] = useState<number>(0);
  const [whatIfCOGSIncrease, setWhatIfCOGSIncrease] = useState<number>(0);
  const [whatIfClientLoss, setWhatIfClientLoss] = useState<number>(0);
  const [whatIfSalaryHike, setWhatIfSalaryHike] = useState<number>(0);

  // Business inputs
  const [inputs, setInputs] = useState<BusinessInputs>({
    monthlyRevenue: 65000,
    cogs: 22000,
    opex: 24000,
    cashBalance: 80000,
    receivables: 32000,
    payables: 15000,
    debtRepayments: 3000,
    businessSector: "e-commerce",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isReportReady, setIsReportReady] = useState(false);

  // Premium interactive VIP states
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number>(0);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [showLaymanDict, setShowLaymanDict] = useState<boolean>(true);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // VIP Sandbox Custom Simulation Hook states
  const [simText, setSimText] = useState<string>("");
  const [simExtraExpenses, setSimExtraExpenses] = useState<number>(0);
  const [simExtraSales, setSimExtraSales] = useState<number>(0);

  const [vipSubTab, setVipSubTab] = useState<"cfo-chat" | "email-negotiator" | "strategic-audit" | "sliders">("cfo-chat");

  // Premium Live AI states
  const [cfoMessages, setCfoMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    {
      role: "assistant",
      text: `Greetings. I am Axora, your AI Business Strategist. I have synchronized with your current business metrics. 

With your active cash reserves of **${inputs.cashBalance ? inputs.cashBalance.toLocaleString('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }) : "N/A"}** and a net monthly flow that looks **${inputs.monthlyRevenue - (inputs.opex + inputs.cogs + inputs.debtRepayments) >= 0 ? "comfortable and stable" : "slightly squeezed"}**, what business scenarios should we explore today? 

Ask me anything, or try testing a few ideas:
- *"What happens if I hire an assistant for $3,500/mo?"*
- *"How can we safely adjust pricing to protect our breathing room?"*
- *"If our running costs decrease by $2,000, how does that extend our runway?"*`
    }
  ]);
  const [cfoInput, setCfoInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [cfoError, setCfoError] = useState<string>("");

  const [aiSubject, setAiSubject] = useState<string>("");
  const [aiBody, setAiBody] = useState<string>("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState<boolean>(false);
  const [emailScenario, setEmailScenario] = useState<string>("Overdue Client Collection");
  const [emailCustom, setEmailCustom] = useState<string>("");
  const [emailObjective, setEmailObjective] = useState<string>("Collect $15,000 overdue for 45 days with strict corporate urgency.");
  const [emailRecipient, setEmailRecipient] = useState<string>("Customer Accounts Payable Supervisor");
  const [emailTone, setEmailTone] = useState<string>("Firm & Legal");
  const [emailError, setEmailError] = useState<string>("");

  const [strategicMemo, setStrategicMemo] = useState<string>("");
  const [isGeneratingMemo, setIsGeneratingMemo] = useState<boolean>(false);
  const [memoError, setMemoError] = useState<string>("");

  // Functions to query backend API
  const handleSendCfoMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cfoInput.trim() || isChatLoading) return;

    const userMsg = cfoInput.trim();
    setCfoInput("");
    setCfoError("");
    setIsChatLoading(true);

    const updatedHistory = [...cfoMessages, { role: "user" as const, text: userMsg }];
    setCfoMessages(updatedHistory);

    try {
      const reply = await generateCfoChat(userMsg, updatedHistory.slice(0, -1), inputs);
      setCfoMessages((prev) => [...prev, { role: "assistant" as const, text: reply }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setCfoError(err.message || "Failed to establish secure link to the Fractional CFO.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateAiEmail = async () => {
    setIsGeneratingEmail(true);
    setEmailError("");
    setAiSubject("");
    setAiBody("");

    try {
      const data = await generateCfoEmail(
        emailScenario,
        emailRecipient,
        emailObjective,
        emailTone,
        inputs,
        emailCustom
      );
      setAiSubject(data.subject || "Strategic Update");
      setAiBody(data.body || "");
    } catch (err: any) {
      console.error("Email generation error:", err);
      setEmailError(err.message || "Failed to generate dynamic client communication.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleGenerateStrategicMemo = async () => {
    setIsGeneratingMemo(true);
    setMemoError("");
    setStrategicMemo("");

    try {
      const memo = await generateCfoStrategicAudit(inputs);
      setStrategicMemo(memo || "");
    } catch (err: any) {
      console.error("Strategic memo error:", err);
      setMemoError(err.message || "Could not compile interactive strategic CFO audit briefing.");
    } finally {
      setIsGeneratingMemo(false);
    }
  };

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

  const parsingSteps = [
    "Opening Statement Ledger parser...",
    "Reconciling bank balances and active payroll blocks...",
    "Determining AR/AP outstanding parameters...",
    "Evaluating variable COGS percentages...",
    "Validating secure structural schema..."
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
            
            // Populating beautiful mock sheet extraction
            setInputs({
              monthlyRevenue: 84000,
              cogs: 29000,
              opex: 31000,
              cashBalance: 125000,
              receivables: 48000,
              payables: 19000,
              debtRepayments: 4500,
              businessSector: "saas",
            });
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!inputs.monthlyRevenue || inputs.monthlyRevenue <= 0) errors.monthlyRevenue = "Monthly Revenue is required.";
    if (inputs.cogs === undefined || inputs.cogs < 0) errors.cogs = "COGS cannot be negative.";
    if (inputs.opex === undefined || inputs.opex < 0) errors.opex = "OPEX cannot be negative.";
    if (inputs.cashBalance === undefined || inputs.cashBalance < 0) errors.cashBalance = "Bank cash reserves are required.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) return;
    
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

  // Generate calculations on current triggers
  const report = computeBusinessReport(
    inputs,
    whatIfSalesDrop,
    whatIfCOGSIncrease,
    whatIfClientLoss,
    whatIfSalaryHike
  );

  const handleBack = () => {
    if (isReportReady) {
      setIsReportReady(false);
      setWhatIfSalesDrop(0);
      setWhatIfCOGSIncrease(0);
      setWhatIfClientLoss(0);
      setWhatIfSalaryHike(0);
    } else if (showExtractedReview) {
      setShowExtractedReview(false);
      setInputMethod(null);
    } else if (inputMethod) {
      setInputMethod(null);
    } else if (profileSelected) {
      setProfileSelected(false);
    } else {
      onBack();
    }
  };

  const downloadReportHTML = () => {
    const curSymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "INR" ? "₹" : "$";
    const profit = inputs.monthlyRevenue - inputs.cogs - inputs.opex - inputs.debtRepayments;
    const netMargin = inputs.monthlyRevenue > 0 ? Math.round((profit / inputs.monthlyRevenue) * 100) : 0;
    const runwayText = report.runwayMonths === 99 ? "Self-Sustaining" : `${report.runwayMonths} Months`;
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Axora Strategic Business Lab Report - ${inputs.businessSector || 'My Business'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Playfair Display', 'serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #070301;
      color: #f7f2ea;
    }
    .text-gold {
      color: #e5c199;
    }
    .border-gold {
      border-color: rgba(214, 167, 117, 0.2);
    }
    .bg-dark-card {
      background-color: #0c0604;
    }
  </style>
</head>
<body class="font-sans antialiased min-h-screen pb-16 bg-[#070301] text-[#f7f2ea]">
  <div class="max-w-4xl mx-auto px-4 pt-10 space-y-8">
    
    <!-- Branding Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded bg-[#170b06] border border-[#d6a775]/25 gap-4">
      <div>
        <span class="text-[10px] font-mono uppercase tracking-widest text-[#d6a775] block">Strategic Mode Report</span>
        <h1 class="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#f7f2ea] to-[#d6a775]/80 font-medium">
          Axora Strategic Business Lab
        </h1>
        <p class="text-[11px] text-[#c7b39b]/70 mt-1 font-medium italic">
          "Built for founders, not accountants."
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="window.print()" class="px-4 py-2 bg-[#d6a775] text-[#140a05] font-semibold rounded text-xs uppercase tracking-wider font-mono hover:bg-[#e5c199] transition duration-200">
          Print / Save PDF
        </button>
      </div>
    </div>

    <!-- Active Profile Overview -->
    <div class="bg-dark-card rounded border border-gold p-6 space-y-4">
      <div class="border-b border-white/5 pb-3">
        <span class="text-[10px] font-mono uppercase tracking-wider text-[#d6a775]/70 block">Sector / Business Model</span>
        <h2 class="text-xl font-serif text-white">${inputs.businessSector || 'Custom Business'} Baseline</h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span class="text-[10px] text-[#c7b39b]/60 uppercase block">Monthly Revenue</span>
          <span class="text-base font-semibold font-mono text-white">${curSymbol}${inputs.monthlyRevenue.toLocaleString()}</span>
        </div>
        <div>
          <span class="text-[10px] text-[#c7b39b]/60 uppercase block">COGS / Product Costs</span>
          <span class="text-base font-semibold font-mono text-white">${curSymbol}${inputs.cogs.toLocaleString()}</span>
        </div>
        <div>
          <span class="text-[10px] text-[#c7b39b]/60 uppercase block">OPEX / Running Costs</span>
          <span class="text-base font-semibold font-mono text-white">${curSymbol}${inputs.opex.toLocaleString()}</span>
        </div>
        <div>
          <span class="text-[10px] text-[#c7b39b]/60 uppercase block">Cash in Bank</span>
          <span class="text-base font-semibold font-mono text-gold font-bold">${curSymbol}${inputs.cashBalance.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Main Live Insight View -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Stability Score Card -->
      <div class="bg-dark-card rounded border border-gold p-6 flex flex-col justify-between space-y-4">
        <div>
          <span class="text-[10px] uppercase font-mono tracking-wider text-gold/70 block">Business Stability Score</span>
          <div class="flex items-baseline gap-1 mt-2">
            <span class="text-5xl font-bold text-gold" id="stability-score-val">${report.cashConfidenceScore}</span>
            <span class="text-sm text-[#c7b39b]/40">/ 100</span>
          </div>
        </div>
        <div class="p-3 bg-[#110703] border border-gold/10 rounded">
          <span class="text-[9px] font-mono tracking-wider text-emerald-400 block uppercase">Status Evaluation</span>
          <p class="text-xs text-[#a39485] mt-1 font-serif leading-relaxed italic">
            "Your business currently has enough breathing room to handle weaker months safely."
          </p>
        </div>
      </div>

      <!-- Business Runway Card -->
      <div class="bg-dark-card rounded border border-gold p-6 flex flex-col justify-between space-y-4">
        <div>
          <span class="text-[10px] uppercase font-mono tracking-wider text-gold/70 block">Business Runway</span>
          <div class="text-4xl font-bold text-white mt-2" id="runway-val">
            ${runwayText}
          </div>
        </div>
        <div class="text-[11px] text-[#a39485] font-light leading-relaxed">
          Your current cash position looks stable and comfortable. A safe operational runway is 6 or more months.
        </div>
      </div>

    </div>

    <!-- What-If Risk Simulator -->
    <div class="bg-dark-card rounded border border-gold p-6 space-y-6">
      <div>
        <span class="text-[10px] uppercase font-mono tracking-wider text-gold/70 block">Interactive Tool</span>
        <h3 class="text-lg font-serif text-white">Future Risk Simulator</h3>
        <p class="text-xs text-[#a39485] font-light">Drag the sliders below to stress-test your business resilience in real-time.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-xs mb-1 text-[#c7b39b]">
              <span>Drop in Sales (%)</span>
              <span id="sales-drop-label" class="font-mono text-gold font-bold">0%</span>
            </div>
            <input type="range" id="sales-drop-range" min="0" max="80" value="0" class="w-full accent-[#d6a775] bg-[#140804] rounded-lg h-1.5 cursor-pointer">
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1 text-[#c7b39b]">
              <span>Increase in OPEX / Running Costs (%)</span>
              <span id="opex-inc-label" class="font-mono text-gold font-bold">0%</span>
            </div>
            <input type="range" id="opex-inc-range" min="0" max="100" value="0" class="w-full accent-[#d6a775] bg-[#140804] rounded-lg h-1.5 cursor-pointer">
          </div>
        </div>

        <div class="bg-[#140804] border border-gold/10 rounded-lg p-5 flex flex-col justify-between">
          <span class="text-[9px] font-mono text-gold/70 uppercase tracking-widest block">Simulation Prediction Outcome</span>
          <div class="my-4">
            <span class="text-xs text-[#a39485]">Simulated Runway Left:</span>
            <div class="text-3xl font-bold text-white mt-1" id="sim-runway-text">${runwayText}</div>
          </div>
          <p class="text-xs text-[#a39485] font-light italic leading-normal" id="sim-status-desc">
            Your metrics represent normal operations.
          </p>
        </div>
      </div>
    </div>

    <!-- Suggested Moves -->
    <div class="bg-dark-card rounded border border-[#d6a775]/25 bg-gradient-to-tr from-[#1b0a04] to-[#0c0604] p-6 space-y-4">
      <span class="text-[10px] font-mono text-[#e5c199] tracking-widest uppercase block">Suggested Next Moves</span>
      
      <div class="space-y-1.5 pb-2 border-b border-[#d6a775]/5">
        <span class="text-[9.5px] text-[#a39485] uppercase block">Primary Roadmap Focus Action:</span>
        <p class="text-xs text-[#f7f2ea] font-medium leading-relaxed">${report.strategicCFOAdvice.priorityAction.replace(/"/g, '&quot;')}</p>
      </div>

      <div class="space-y-2">
        <span class="text-[9.5px] text-[#c7b39b] uppercase block">Operations Tactics Summary:</span>
        <ul class="space-y-2">
          ${report.strategicCFOAdvice.tactics.map(t => `
            <li class="flex gap-2.5 items-start text-xs text-[#a39485] leading-relaxed">
              <span class="text-emerald-500 font-bold shrink-0">✓</span>
              <span>${t.replace(/"/g, '&quot;')}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>

    <!-- Advisory Credit -->
    <p class="text-center text-[10px] text-[#a39485]/40 font-mono uppercase tracking-widest">
      AXORA BUSINESS ADVISORY LAB • STANDALONE EXPORT
    </p>

  </div>

  <script>
    const initialRev = ${inputs.monthlyRevenue};
    const initialCogs = ${inputs.cogs};
    const initialOpex = ${inputs.opex};
    const initialDebt = ${inputs.debtRepayments};
    const initialCash = ${inputs.cashBalance};
    const curSymbol = "${curSymbol}";

    const salesRange = document.getElementById('sales-drop-range');
    const opexRange = document.getElementById('opex-inc-range');
    
    const salesLabel = document.getElementById('sales-drop-label');
    const opexLabel = document.getElementById('opex-inc-label');

    const simRunwayText = document.getElementById('sim-runway-text');
    const simStatusDesc = document.getElementById('sim-status-desc');

    function updateSimulation() {
      const salesDropPercent = parseInt(salesRange.value);
      const opexIncreasePercent = parseInt(opexRange.value);

      salesLabel.innerText = salesDropPercent + "%";
      opexLabel.innerText = opexIncreasePercent + "%";

      const simRev = initialRev * (1 - (salesDropPercent / 100));
      const simOpex = initialOpex * (1 + (opexIncreasePercent / 100));
      const totalOutflow = initialCogs + simOpex + initialDebt;
      const netProfit = simRev - totalOutflow;

      let simulatedRunway = initialCash / (initialCogs + simOpex);
      if (initialCogs + simOpex <= 0) {
        simulatedRunway = 99;
      } else if (simulatedRunway < 0) {
        simulatedRunway = 0;
      }

      let txt = "";
      let desc = "";

      if (netProfit >= 0) {
        txt = "Self-Sustaining";
        desc = "Your revenue comfortably exceeds outlays. Even with these parameters, your cash reserve handles business operations comfortable.";
      } else {
        const months = Math.round(simulatedRunway * 10) / 10;
        txt = months + " Months";
        if (months < 2) {
          desc = "⚠️ Runway is critically short under simulated conditions. We recommend checking variable costs immediately.";
        } else if (months < 6) {
          desc = "⚠️ Cash reserves feel slightly tight under simulated parameters. Conserving cash is recommended.";
        } else {
          desc = "✅ Your business remains safely protected with comfortable backup reserves.";
        }
      }

      simRunwayText.innerText = txt;
      simStatusDesc.innerText = desc;
    }

    salesRange.addEventListener('input', updateSimulation);
    opexRange.addEventListener('input', updateSimulation);
    updateSimulation();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `axora-strategic-lab-${inputs.businessSector.toLowerCase().replace(/\s+/g, "-") || "report"}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getAxoraLiveReaction = () => {
    const { monthlyRevenue, cogs, opex, cashBalance, debtRepayments } = inputs;
    
    // Default starting message when numbers are zero
    if (!monthlyRevenue && !cashBalance) {
      return {
        type: "neutral",
        text: "Sharing is power. Type your numbers below to watch Axora process your business health coordinates in real-time.",
        glow: "border-[#d6a775]/20 bg-[#140703]/30 text-[#a39485]/70"
      };
    }
    
    const profit = monthlyRevenue - cogs - opex - debtRepayments;
    const totalOutflow = cogs + opex + debtRepayments;
    const margin = monthlyRevenue > 0 ? (profit / monthlyRevenue) * 100 : 0;
    const runningCosts = cogs + opex;
    const runway = runningCosts > 0 ? cashBalance / runningCosts : cashBalance > 0 ? 12 : 0;

    if (monthlyRevenue > 0 && totalOutflow > monthlyRevenue) {
      return {
        type: "danger",
        text: "⚠️ Cash flow is in negative territory. Your monthly running costs exceed your revenue, which means we are drawing down bank reserves.",
        glow: "border-red-500/30 bg-red-950/20 text-red-200"
      };
    }

    if (cashBalance > 0 && runningCosts > 0 && runway < 2) {
      return {
        type: "warn",
        text: "⚠️ Your cash buffer may feel tight during slow months. We detect under 2 months of standard operational runway.",
        glow: "border-amber-500/30 bg-[#29170c] text-amber-200"
      };
    }

    if (monthlyRevenue > 0 && opex / monthlyRevenue > 0.5) {
      return {
        type: "warn",
        text: "⚠️ Your running costs (overhead) may be slightly heavy. Monthly running costs are swallowing over 50% of your sales income.",
        glow: "border-amber-500/30 bg-[#29170c] text-[#ebd4b0]"
      };
    }

    if (cashBalance > 0 && runningCosts > 0 && runway >= 5) {
      return {
        type: "success",
        text: "✅ Your business currently has strong breathing room! Your bank reserves can sustain over 5 weeks/months of standard expenses.",
        glow: "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
      };
    }

    if (monthlyRevenue > 0 && margin >= 25) {
      return {
        type: "success",
        text: "✅ Your margins currently look healthy! You possess neat operating leverage (above 25% net profit margin).",
        glow: "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
      };
    }

    return {
      type: "neutral",
      text: "📊 Processing coordinates in real-time. Numbers look stable — let's continue to compile your full forecast.",
      glow: "border-[#d6a775]/20 bg-[#140703]/50 text-[#c7b39b]"
    };
  };

  const liveReaction = getAxoraLiveReaction();

  return (
    <div className="flex-1 max-w-xl mx-auto w-full z-10 py-2">
      {/* Action header bar */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs font-mono text-[#c7b39b]/70 hover:text-[#e5c199] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isReportReady ? "Adjust Baseline" : "Return"}
        </button>
        <span className="text-[10px] uppercase font-mono tracking-widest text-[#d6a775]/50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d6a775]"></span>
          Axora Intelligence
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* Step: Private Advisor Cinematic Calculator Spinner */}
        {isCalculating && (
          <motion.div
            key="business-simulation-calculating"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="p-8 text-center bg-[#170904]/80 border border-[#d6a775]/25 rounded-xl space-y-6 flex flex-col items-center justify-center min-h-[350px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#d6a775]/25 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-solid border-[#d6a775]/50 animate-pulse flex items-center justify-center">
                <Sliders className="w-5 h-5 text-[#d6a775] animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            <div className="space-y-4 max-w-sm">
              <h3 className="font-display font-medium text-lg text-[#f7f2ea]">Private Advisor Deep Scan</h3>
              <p className="text-xs font-mono text-[#d6a775] tracking-wider h-12 flex items-center justify-center leading-relaxed">
                {calcLoadingStories[calcStep]}
              </p>
            </div>

            <div className="w-full space-y-2 max-w-xs pt-4 border-t border-[#d6a775]/10">
              <div className="text-[10px] uppercase tracking-widest text-[#c7b39b]/40 font-mono animate-pulse">
                Running Survivability Scenario Models
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 0: Business Profile Customizer setup */}
        {!profileSelected && !isCalculating && (
          <motion.div
            key="business-profile-setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <p className="text-[10px] font-mono tracking-widest text-[#d6a775]/60 mb-1 uppercase">Let's set your foundation</p>
              <h2 className="text-xl font-display font-light text-[#f7f2ea]">Tell us about your dream & venture</h2>
              <p className="text-xs text-[#a39485] font-light mt-1">
                Share the current shape of your business so we can tailor our guidance to your personal journey, priorities, and cash flow comfort.
              </p>
            </div>

            {/* Selector 1: Business Industry Sector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-[#c7b39b]">Venture Category / Industry Sector</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "saas", name: "SaaS / Tech Sector", icon: Sparkles },
                  { id: "agency", name: "Agency / Consulting", icon: Briefcase },
                  { id: "ecommerce", name: "E-Commerce / Retail", icon: Coins },
                  { id: "services", name: "Professional Services", icon: CheckCircle2 },
                  { id: "manufacturing", name: "Manufacturing Sector", icon: Building2 },
                  { id: "importexport", name: "Import & Export", icon: TrendingUp },
                  { id: "other", name: "Other / Custom Industry", icon: Globe },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setIndustry(item.id)}
                    className={`p-3.5 text-left rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${item.id === 'other' ? 'col-span-2' : ''} ${industry === item.id ? "bg-[#30160a] border-[#d6a775] text-[#f7f2ea] shadow-md" : "bg-[#140703]/60 border-[#d6a775]/10 hover:border-[#d6a775]/25 text-[#c7b39b]"}`}
                  >
                    <item.icon className="w-4 h-4 text-[#d6a775]" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Industry Input Panel if selected */}
            <AnimatePresence>
              {industry === "other" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="block text-[10px] font-mono uppercase text-[#c7b39b]">Tell us about your industry</label>
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="e.g. Wellness Studio, Biotech, Franchise, Creative Design..."
                    className="w-full bg-[#180c07] border border-[#d6a775]/35 rounded p-3 text-xs text-[#f7f2ea] focus:border-[#d6a775] outline-none"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sliders 2 & 3: Team size & Operating History */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#140703]/60 p-4 rounded-lg border border-[#d6a775]/15">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#c7b39b]">Team Size</label>
                  {isEditingTeam ? (
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={teamSize}
                      onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
                      onBlur={() => setIsEditingTeam(false)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTeam(false); }}
                      className="w-16 bg-[#180c07] border border-[#d6a775]/40 text-xs text-[#f7f2ea] font-mono px-1 rounded text-right focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => setIsEditingTeam(true)}
                      className="text-xs font-mono font-medium text-[#f7f2ea] cursor-pointer hover:text-[#d6a775] underline decoration-dotted decoration-[#d6a775]/40"
                      title="Click to type manually"
                    >
                      {teamSize} {teamSize === 1 ? "person" : "people"}
                    </span>
                  )}
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={teamSize > 500 ? 500 : teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-[#d6a775]"
                />
              </div>

              <div className="bg-[#140703]/60 p-4 rounded-lg border border-[#d6a775]/15">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-mono uppercase text-[#c7b39b]">Years Active</label>
                  {isEditingYears ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.25"
                      value={yearsOperating}
                      onChange={(e) => setYearsOperating(Math.max(0, Number(e.target.value)))}
                      onBlur={() => setIsEditingYears(false)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingYears(false); }}
                      className="w-16 bg-[#180c07] border border-[#d6a775]/40 text-xs text-[#f7f2ea] font-mono px-1 rounded text-right focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span 
                      onClick={() => setIsEditingYears(true)}
                      className="text-xs font-mono font-medium text-[#f7f2ea] cursor-pointer hover:text-[#d6a775] underline decoration-dotted decoration-[#d6a775]/40"
                      title="Click to type manually"
                    >
                      {formatYearsOperating(yearsOperating)}
                    </span>
                  )}
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.25"
                  value={yearsOperating > 15 ? 15 : yearsOperating}
                  onChange={(e) => setYearsOperating(Number(e.target.value))}
                  className="w-full accent-[#d6a775]"
                />
              </div>
            </div>

            {/* Selector 4: Primary Goals */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase text-[#c7b39b]">What matters most right now?</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "survive", title: "Protect My Business", desc: "Set up a strong cash buffer to survive tough times and unexpected bills safely." },
                  { id: "scale", title: "Grow & Expand Sales", desc: "Confidently find ways to increase your sales without running out of bank money." },
                  { id: "stress", title: "Reduce Daily Stress", desc: "Plug immediate money leaks and secure your cash so you can sleep peacefully." },
                  { id: "funding", title: "Get Ready for Loans & Investors", desc: "Build clean, strong financial sheets that banks or investors love to see." },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOwnerGoal(item.id)}
                    className={`p-3 text-left rounded-lg border text-xs cursor-pointer transition-all relative ${ownerGoal === item.id ? "bg-[#30160a] border-[#d6a775] shadow-md" : "bg-[#140703]/60 border-[#d6a775]/10 hover:border-[#d6a775]/25 text-[#c7b39b]"}`}
                  >
                    <div className="font-medium text-[#f7f2ea] flex items-center justify-between">
                      <span>{item.title}</span>
                      {ownerGoal === item.id && <Check className="w-3.5 h-3.5 text-[#d6a775]" />}
                    </div>
                    <p className="text-[10px] text-[#a39485] font-light mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Proceed CTA button */}
            <button
              onClick={() => {
                const finalSector = industry === "other" ? (customIndustry.trim() || "Independent Custom Business") : industry;
                setInputs({ ...inputs, businessSector: finalSector });
                setProfileSelected(true);
              }}
              className="w-full py-4 bg-gradient-to-r from-[#d6a775] to-[#8a5b28] hover:from-[#e5c199] hover:to-[#a16c34] border border-[#d6a775]/35 rounded text-xs font-mono uppercase tracking-widest text-[#140a05] font-semibold cursor-pointer shadow-lg transition-all"
            >
              Build My Decision Report &rarr;
            </button>
          </motion.div>
        )}

        {/* Step 1: Input method selection */}
        {!inputMethod && profileSelected && !isCalculating && (
          <motion.div
            key="business-onboarding"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div>
              <p className="text-[10px] font-mono tracking-widest text-[#d6a775]/60 mb-1 uppercase">Axora Advisors</p>
              <h2 className="text-2xl font-display font-light text-[#f7f2ea]">How should we ingest your numbers?</h2>
              <p className="text-xs text-[#a39485] font-light mt-1">
                Upload your profit & loss statements or bookkeeping exports directly, or construct a custom ledger manually.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option A: Document upload */}
              <button
                id="business-method-upload"
                onClick={() => setInputMethod("upload")}
                className="text-left p-5 rounded-lg bg-gradient-to-br from-[#1e0f09] to-[#0c0604] border border-[#d6a775]/15 hover:border-[#d6a775]/40 transition-colors cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute right-3 top-3 px-1.5 py-0.5 bg-[#4a2412] text-[9px] font-mono text-[#e5c199] rounded border border-[#d6a775]/15 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Smart Ledger Scan
                </div>
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-[#3a1d0f] text-[#d6a775] rounded-full border border-[#d6a775]/25 group-hover:bg-[#d6a775] group-hover:text-black transition-all">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-medium text-sm text-[#f7f2ea]">Upload Financial Sheets</h4>
                    <p className="text-[11px] font-light text-[#a39485] mt-1">Read P&L benchmarks, balances and overheads instantly from transaction sheets.</p>
                  </div>
                </div>
              </button>

              {/* Option B: Enter manually */}
              <button
                id="business-method-manual"
                onClick={() => setInputMethod("manual")}
                className="text-left p-5 rounded-lg glass-panel-interactive flex gap-4 items-center cursor-pointer group"
              >
                <div className="p-3 bg-[#221008] text-[#c7b39b] rounded-full border border-[#d6a775]/10 group-hover:border-[#d6a775]/40 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-medium text-sm text-[#f7f2ea]">Manual Ledger Builder</h4>
                  <p className="text-[11px] font-light text-[#a39485] mt-1">Select key revenue metrics and overhead scopes manually to test direct growth concepts.</p>
                </div>
              </button>
            </div>

            <div className="p-4 bg-[#140a06] rounded border border-[#d6a775]/10 flex gap-3 items-start">
              <Info className="w-4.5 h-4.5 text-[#e5c199] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[#e2b78b] text-[11px] font-medium leading-normal">Zero-Retention Policy</p>
                <p className="text-[#a39485] text-[10px] font-light leading-relaxed">
                  Financial books stay 100% private. Axora loads details only inside active client session cache and deletes raw files on close.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2A: Upload active state parser */}
        {inputMethod === "upload" && isParsingDoc && !isCalculating && (
          <motion.div
            key="business-parsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center glass-panel rounded-xl space-y-6 flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#d6a775]/30 animate-spin" />
              <div className="absolute inset-2 rounded-full border border-solid border-[#d6a775] animate-pulse flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#e5c199]" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-medium text-md text-[#f7f2ea]">Axora Intelligence Engine</h3>
              <p className="text-xs font-mono text-[#d6a775] tracking-wide animate-pulse">{parsingSteps[currentParseStep]}</p>
            </div>

            <div className="w-full space-y-2 max-w-sm pt-4 border-t border-[#d6a775]/5">
              <div className="h-3 bg-[#2a140b] rounded animate-pulse w-3/4 mx-auto" />
              <div className="h-2.5 bg-[#1b0a04] rounded animate-pulse w-1/2 mx-auto" strokeDasharray="3" />
            </div>
          </motion.div>
        )}

        {/* Step 2B: Upload prompt trigger box */}
        {inputMethod === "upload" && !isParsingDoc && !showExtractedReview && !isCalculating && (
          <motion.div
            key="business-upload-prompter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            <div className="text-center p-8 rounded-lg border border-dashed border-[#d6a775]/35 bg-[#170b06]/50 hover:bg-[#1f1008]/50 transition-all cursor-pointer"
              onClick={handleDocumentUpload}
            >
              <Upload className="w-8 h-8 text-[#d6a775] mx-auto mb-3 animate-bounce" />
              <h4 className="font-display font-medium text-sm text-[#f7f2ea]">Select Profit & Loss statement spreadsheet</h4>
              <p className="text-[11px] text-[#a39485] mt-1.5 max-w-xs mx-auto">
                Supports Excel (.xlsx), CSV, Quickbooks ledgers, or standard PDF statements.
              </p>
              <div className="mt-4 inline-block text-[10px] font-mono text-[#e5c199] bg-[#2d160b] px-3.5 py-1 rounded-full border border-[#d6a775]/20">
                Trigger Sheet Extraction Simulation
              </div>
            </div>
            
            <button
              onClick={() => setInputMethod("manual")}
              className="w-full text-center py-3 border border-[#d6a775]/10 rounded font-mono text-xs text-[#c7b39b] hover:text-white cursor-pointer"
            >
              Enter Manually
            </button>
          </motion.div>
        )}

        {/* Step 2C: Extracted Review Confirmation */}
        {inputMethod === "upload" && showExtractedReview && !isReportReady && !isCalculating && (
          <motion.div
            key="business-review-extraction"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-[#24130b] p-3 rounded border border-[#d6a775]/25">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#d6a775]" />
                <span className="text-xs text-[#f7f2ea] font-medium">Automatic Balance Extraction Completed</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#412111] text-[#e5c199] font-mono border border-[#d6a775]/15">
                97% INTEGRITY
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-display font-light text-[#f7f2ea]">I found these business numbers.</h2>
              <p className="text-xs text-[#a39485]">Confirm extracted operational inputs before proceeding to risk forecast.</p>
            </div>

            <div className="space-y-4" id="business-confirm-fields">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#c7b39b] uppercase mb-1">Monthly Revenue ({curSymbol})</label>
                  <input
                    type="number"
                    value={inputs.monthlyRevenue}
                    onChange={(e) => setInputs({ ...inputs, monthlyRevenue: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2.5 text-sm text-[#f7f2ea]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#c7b39b] uppercase mb-1">Direct Costs (COGS) ({curSymbol})</label>
                  <input
                    type="number"
                    value={inputs.cogs}
                    onChange={(e) => setInputs({ ...inputs, cogs: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2.5 text-sm text-[#f7f2ea]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#c7b39b] uppercase mb-1">Operating Cash Reserves ({curSymbol})</label>
                  <input
                    type="number"
                    value={inputs.cashBalance}
                    onChange={(e) => setInputs({ ...inputs, cashBalance: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2.5 text-sm text-[#f7f2ea]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#c7b39b] uppercase mb-1">Active Payroll/OPEX ({curSymbol})</label>
                  <input
                    type="number"
                    value={inputs.opex}
                    onChange={(e) => setInputs({ ...inputs, opex: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2.5 text-sm text-[#f7f2ea]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full py-4 bg-[#633821] hover:bg-[#7a4529] border border-[#d6a775]/30 rounded text-xs font-mono uppercase tracking-widest text-[#f7f2ea] cursor-pointer"
            >
              Analyze Extracted Scenarios
            </button>
          </motion.div>
        )}

        {/* Step 2D: Manual entries custom inputs */}
        {inputMethod === "manual" && !isReportReady && !isCalculating && (
          <motion.div
            key="business-manual-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-[10px] font-mono tracking-widest text-[#d6a775]/70 uppercase">Axora Intelligence</p>
              <h2 className="text-xl font-display font-light text-[#f7f2ea]">Let's understand your business.</h2>
              <p className="text-xs text-[#a39485]">These numbers help Axora understand how stable, safe and scalable your business is.</p>
            </div>

            {/* Live AI Reaction Pod */}
            <div className={`p-4 rounded-lg border ${liveReaction.glow} transition-all duration-300 flex items-start gap-3`}>
              <div className="w-2 h-2 rounded-full bg-[#d6a775] mt-1.5 animate-ping shrink-0" />
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-wider text-[#d6a775]/70 block uppercase">Real-Time Axora Evaluation</span>
                <p className="text-xs font-light leading-relaxed">{liveReaction.text}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Gross income */}
              <div className="bg-[#140703]/20 p-4 rounded-lg border border-[#d6a775]/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-serif text-[#f7f2ea] flex items-center gap-1">
                      Monthly Sales / Revenue <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleHint("revenue")}
                      className="text-[10px] font-mono text-[#d6a775]/60 hover:text-[#d6a775] underline decoration-dotted cursor-pointer flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3" /> Why?
                    </button>
                  </div>
                  <span className="text-[11px] text-[#f7f2ea] font-medium font-mono">{formatValue(inputs.monthlyRevenue)}</span>
                </div>
                <p className="text-[11px] text-[#a39485] font-light">How much money the business brings in monthly before expenses.</p>
                <input
                  type="number"
                  value={inputs.monthlyRevenue || ""}
                  onChange={(e) => setInputs({ ...inputs, monthlyRevenue: Number(e.target.value) })}
                  className={`w-full bg-[#180c07] border rounded p-3 text-sm text-[#f7f2ea] focus:border-[#d6a775] outline-none ${formErrors.monthlyRevenue ? "border-red-500/80 bg-red-950/10" : "border-[#d6a775]/20"}`}
                  placeholder="e.g. 25000"
                />
                <AnimatePresence>
                  {activeHint === "revenue" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#241209] p-2.5 rounded border border-[#d6a775]/20 text-[11px] text-[#ebd4b0]/90 font-light leading-relaxed gap-1.5 flex"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d6a775] shrink-0 mt-0.5" />
                      <span>This helps Axora understand your current business scale.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* COGS and OPEX Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product / Service Costs */}
                <div className="bg-[#140703]/20 p-4 rounded-lg border border-[#d6a775]/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-serif text-[#f7f2ea]">
                        Product / Service Costs
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleHint("cogs")}
                        className="text-[10px] font-mono text-[#d6a775]/60 hover:text-[#d6a775] underline decoration-dotted cursor-pointer flex items-center gap-0.5"
                      >
                        <Info className="w-3 h-3" /> Why?
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-[#a39485]">{inputs.monthlyRevenue > 0 ? `${Math.round(inputs.cogs / inputs.monthlyRevenue * 100)}% of sales` : ""}</span>
                  </div>
                  <p className="text-[11px] text-[#a39485] font-light">Inventory, supplier costs, contractor fees or shipping expenses.</p>
                  <input
                    type="number"
                    value={inputs.cogs || ""}
                    onChange={(e) => setInputs({ ...inputs, cogs: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2.5 text-xs text-[#f7f2ea] focus:border-[#d6a775] outline-none"
                    placeholder="e.g. 5000"
                  />
                  <AnimatePresence>
                    {activeHint === "cogs" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#241209] p-2.5 rounded border border-[#d6a775]/20 text-[11px] text-[#ebd4b0]/90 font-light leading-relaxed gap-1.5 flex"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d6a775] shrink-0 mt-0.5" />
                        <span>This helps calculate your gross profit margins and product viability.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Monthly Running Costs */}
                <div className="bg-[#140703]/20 p-4 rounded-lg border border-[#d6a775]/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-serif text-[#f7f2ea]">
                        Monthly Running Costs
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleHint("opex")}
                        className="text-[10px] font-mono text-[#d6a775]/60 hover:text-[#d6a775] underline decoration-dotted cursor-pointer flex items-center gap-0.5"
                      >
                        <Info className="w-3 h-3" /> Why?
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-[#a39485]">{inputs.monthlyRevenue > 0 ? `${Math.round(inputs.opex / inputs.monthlyRevenue * 100)}% of sales` : ""}</span>
                  </div>
                  <p className="text-[11px] text-[#a39485] font-light">Salaries, rent, software, operations and admin expenses.</p>
                  <input
                    type="number"
                    value={inputs.opex || ""}
                    onChange={(e) => setInputs({ ...inputs, opex: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2.5 text-xs text-[#f7f2ea] focus:border-[#d6a775] outline-none"
                    placeholder="e.g. 7000"
                  />
                  <AnimatePresence>
                    {activeHint === "opex" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#241209] p-2.5 rounded border border-[#d6a775]/20 text-[11px] text-[#ebd4b0]/90 font-light leading-relaxed gap-1.5 flex"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d6a775] shrink-0 mt-0.5" />
                        <span>This detects how much baseline money is spent just to keep the lights on.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Cash Available in Bank */}
              <div className="bg-[#140703]/20 p-4 rounded-lg border border-[#d6a775]/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-serif text-[#f7f2ea] flex items-center gap-1">
                      Cash Available in Bank <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleHint("cashBalance")}
                      className="text-[10px] font-mono text-[#d6a775]/60 hover:text-[#d6a775] underline decoration-dotted cursor-pointer flex items-center gap-0.5"
                    >
                      <Info className="w-3 h-3" /> Why?
                    </button>
                  </div>
                  <span className="text-[11px] text-[#f7f2ea] font-medium font-mono">{formatValue(inputs.cashBalance)}</span>
                </div>
                <p className="text-[11px] text-[#a39485] font-light">Axora uses this to calculate how many weak months your business can survive.</p>
                <input
                  type="number"
                  value={inputs.cashBalance || ""}
                  onChange={(e) => setInputs({ ...inputs, cashBalance: Number(e.target.value) })}
                  className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-3 text-sm text-[#f7f2ea] focus:border-[#d6a775] outline-none"
                  placeholder="e.g. 50000"
                />
                <AnimatePresence>
                  {activeHint === "cashBalance" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#241209] p-2.5 rounded border border-[#d6a775]/20 text-[11px] text-[#ebd4b0]/90 font-light leading-relaxed gap-1.5 flex"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d6a775] shrink-0 mt-0.5" />
                      <span>This helps Axora estimate how long your business can survive if sales slow down.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Receivables & Payables & Debt limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Money Customers Still Owe You */}
                <div className="bg-[#140703]/20 p-4 rounded-lg border border-[#d6a775]/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-serif text-[#f7f2ea]">Money Customers Still Owe You</label>
                    <button
                      type="button"
                      onClick={() => toggleHint("receivables")}
                      className="text-[10px] font-mono text-[#d6a775]/60 hover:text-[#d6a775] underline decoration-dotted cursor-pointer"
                    >
                      Why?
                    </button>
                  </div>
                  <p className="text-[10px] text-[#a39485] font-light">Pending customer payments or unpaid invoices.</p>
                  <input
                    type="number"
                    value={inputs.receivables || ""}
                    onChange={(e) => setInputs({ ...inputs, receivables: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2 text-xs text-[#f7f2ea]"
                    placeholder="e.g. 15000"
                  />
                  <AnimatePresence>
                    {activeHint === "receivables" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#241209] p-2 rounded border border-[#d6a775]/20 text-[10px] text-[#ebd4b0]/90 font-light leading-normal"
                      >
                        This shows your near-term pipeline cash waiting to clear.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bills You Still Need to Pay */}
                <div className="bg-[#140703]/20 p-4 rounded-lg border border-[#d6a775]/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-serif text-[#f7f2ea]">Bills You Still Need to Pay</label>
                    <button
                      type="button"
                      onClick={() => toggleHint("payables")}
                      className="text-[10px] font-mono text-[#d6a775]/60 hover:text-[#d6a775] underline decoration-dotted cursor-pointer"
                    >
                      Why?
                    </button>
                  </div>
                  <p className="text-[10px] text-[#a39485] font-light">Supplier dues, unpaid bills or pending vendor payments.</p>
                  <input
                    type="number"
                    value={inputs.payables || ""}
                    onChange={(e) => setInputs({ ...inputs, payables: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2 text-xs text-[#f7f2ea]"
                    placeholder="e.g. 5000"
                  />
                  <AnimatePresence>
                    {activeHint === "payables" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#241209] p-2 rounded border border-[#d6a775]/20 text-[10px] text-[#ebd4b0]/90 font-light leading-normal"
                      >
                        This registers near-term cash draining demands on your business.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Loan / EMI Payments */}
                <div className="bg-[#140703]/20 p-4 rounded-lg border border-[#d6a775]/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-serif text-[#f7f2ea]">Loan / EMI Payments</label>
                    <button
                      type="button"
                      onClick={() => toggleHint("debtRepayments")}
                      className="text-[10px] font-mono text-[#d6a775]/60 hover:text-[#d6a775] underline decoration-dotted cursor-pointer"
                    >
                      Why?
                    </button>
                  </div>
                  <p className="text-[10px] text-[#a39485] font-light">Monthly bank loans, EMI or repayment obligations.</p>
                  <input
                    type="number"
                    value={inputs.debtRepayments || ""}
                    onChange={(e) => setInputs({ ...inputs, debtRepayments: Number(e.target.value) })}
                    className="w-full bg-[#180c07] border border-[#d6a775]/20 rounded p-2 text-xs text-[#f7f2ea]"
                    placeholder="e.g. 1200"
                  />
                  <AnimatePresence>
                    {activeHint === "debtRepayments" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#241209] p-2 rounded border border-[#d6a775]/20 text-[10px] text-[#ebd4b0]/90 font-light leading-normal"
                      >
                        This tracks mandatory debt commitments that can restrict growth.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <button
              id="business-execute-analysis-btn"
              onClick={handleCalculate}
              className="w-full py-4 bg-gradient-to-r from-[#d6a775] to-[#8a5b28] hover:from-[#e5c199] hover:to-[#a16c34] border border-[#d6a775]/35 rounded text-xs font-mono uppercase tracking-widest text-[#140a05] font-semibold cursor-pointer shadow-lg transition-all"
            >
              Continue with Axora &rarr;
            </button>
          </motion.div>
        )}

        {/* Step 3: Analysis Reports Page */}
        {isReportReady && !isCalculating && (
          <motion.div
            key="business-reports-dashboard"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Elegant Header with VIP switcher */}
            <div className="flex justify-between items-center bg-[#170b06] p-4 rounded border border-[#d6a775]/15">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d6a775] block">
                  {activeTab === "vip" ? "Advanced Business Intelligence" : "Axora Quick Insight"}
                </span>
                <span className="text-sm font-display text-transparent bg-clip-text bg-gradient-to-r from-[#f7f2ea] to-[#d6a775]/80 font-medium block">
                  {activeTab === "vip" ? "Deep Analysis Dashboard" : "Your Business Snapshot"}
                </span>
                <span className="text-[9.5px] text-[#c7b39b]/60 font-medium block">
                  Built for founders, not accountants.
                </span>
              </div>

              <div className="flex bg-[#0c0604] border border-[#d6a775]/10 p-0.5 rounded-lg text-[10px] font-mono uppercase">
                <button
                  onClick={() => setActiveTab("quick")}
                  className={`px-3 py-1.5 rounded cursor-pointer transition-colors ${activeTab === "quick" ? "bg-[#3a1d0f] text-[#f7f2ea]" : "text-[#c7b39b]/60 hover:text-white"}`}
                >
                  Quick
                </button>
                <button
                  id="tab-business-vip-btn"
                  onClick={() => setActiveTab("vip")}
                  className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${activeTab === "vip" ? "bg-[#e5c199] text-black font-semibold" : "text-[#c7b39b]/60 hover:text-white"}`}
                >
                  <Crown className="w-2.5 h-2.5" />
                  Deep Analysis
                </button>
              </div>
            </div>

            {/* Verdict Snapshot */}
            <div className="p-5 rounded-lg border border-[#d6a775]/10 bg-[#160c07]/80">
              <div className="flex gap-3 items-start">
                <span className={`inline-block w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                  report.executiveVerdict.status === "green" ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" :
                  report.executiveVerdict.status === "amber" ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
                  "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                }`} />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#d6a775]/60 block">Strategic Advisor Decision</span>
                  <h3 className="font-display font-medium text-[#f7f2ea] text-sm">{report.executiveVerdict.title}</h3>
                  <p className="text-xs text-[#a39485] font-light leading-relaxed">{report.executiveVerdict.rationale}</p>
                </div>
              </div>
            </div>

            {/* Metric widgets (Plain English & ultra-readable fonts) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Business Stability Score */}
              <div className="p-4 rounded border border-[#d6a775]/10 bg-[#0c0604] flex flex-col justify-between">
                <span className="text-[9px] font-sans text-[#c7b39b]/70 tracking-wider uppercase font-medium">Business Stability Score</span>
                <div className="my-2 flex items-baseline gap-1">
                  <span id="business-confidence-value" className="text-3xl font-sans font-bold text-[#e5c199]">{report.cashConfidenceScore}</span>
                  <span className="text-xs font-sans text-[#c7b39b]/50">/ 100</span>
                </div>
                <div className="h-1.5 bg-[#180a04] rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#633821] to-[#e5c199]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${report.cashConfidenceScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Business Runway */}
              <div className="p-4 rounded border border-[#d6a775]/10 bg-[#0c0604] flex flex-col justify-between">
                <span className="text-[9px] font-sans text-[#c7b39b]/70 tracking-wider uppercase font-medium">Business Runway</span>
                <div className="my-2 text-2xl font-sans font-bold tracking-tight text-white" id="business-runway-value">
                  {report.runwayMonths === 99 ? "Self-Sustaining" : `${report.runwayMonths} Months`}
                </div>
                <span className="text-[9px] text-[#a39485] font-light">Safe runway target is 6 or more months of backup reserves</span>
              </div>
            </div>

            {/* Core Health stats in basic language */}
            <div className="grid grid-cols-4 gap-2.5 p-4 rounded border border-[#d6a775]/10 bg-[#160c07]/40 text-center">
              <div>
                <span className="block text-[8px] font-sans text-[#c7b39b]/60 uppercase font-semibold">Monthly Sales</span>
                <span className="text-[11px] font-sans font-semibold text-white">{formatValue(report.revenue)}</span>
              </div>
              <div className="border-x border-[#d6a775]/10">
                <span className="block text-[8px] font-sans text-[#c7b39b]/60 uppercase font-semibold">Profit Margin</span>
                <span className="text-[11px] font-sans font-bold text-[#e5c199]">{report.grossMargin}%</span>
              </div>
              <div className="border-r border-[#d6a775]/10">
                <span className="block text-[8px] font-sans text-[#c7b39b]/60 uppercase font-semibold">Expense Load</span>
                <span className="text-[11px] font-sans font-semibold text-white">{report.operatingMargin}%</span>
              </div>
              <div>
                <span className="block text-[8px] font-sans text-[#c7b39b]/60 uppercase font-semibold font-mono">Payment speed</span>
                <span className="text-[11px] font-sans font-semibold text-white">{report.accountsReceivableTurnoverRisk} Risk</span>
              </div>
            </div>

            {/* Standard quick advice summary - Redesigned to look amazing and be super interesting without boring paragraphs */}
            {activeTab === "quick" && (
              <div className="space-y-4">
                {/* Visual Good News / Attention Panel */}
                <div className="p-5 rounded-lg border border-[#d6a775]/15 bg-gradient-to-b from-[#110703] to-[#070301] space-y-3.5">
                  <span className="text-[9px] font-mono uppercase text-[#e5c199]/85 tracking-widest block">What Axora Noticed</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                    {/* Strengths card */}
                    <div className="p-3 bg-[#1c0f0a] rounded border border-emerald-500/10 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>What’s Going Well</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-[#a39485] font-light leading-relaxed">
                        <li>• After paying supplier and product costs, your business still keeps a strong portion of its revenue ({report.grossMargin}%).</li>
                        <li>• Your business generates <span className="font-semibold text-white">{formatValue(report.revenue)}</span> in baseline sales.</li>
                      </ul>
                    </div>

                    {/* Action Cards */}
                    <div className="p-3 bg-[#1c0f0a] rounded border border-[#d6a775]/10 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[#e5c199] font-medium text-xs">
                        <ArrowLeft className="w-4 h-4 rotate-185" />
                        <span>Immediate Opportunities</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-[#a39485] font-light leading-relaxed">
                        {inputs.receivables > 0 && (
                          <li>• Collect <span className="font-sans font-bold text-white">{formatValue(inputs.receivables)}</span> in pending customer payments to strengthen cash reserves.</li>
                        )}
                        <li>• Trim background subscriptions to stretch your countdown clock months further.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Switch CTA button overlay */}
                <div className="p-4 bg-gradient-to-r from-[#170904] to-[#120502] border border-[#d6a775]/15 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-center sm:text-left space-y-0.5">
                    <span className="text-xs font-semibold text-white block">Want to explore future business scenarios?</span>
                    <span className="text-[10px] text-[#a39485] font-light block">Explore business stress tests, future forecasts and AI strategic guidance.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("vip")}
                    className="px-4 py-2 bg-[#e5c199] hover:bg-[#ebd0b4] text-black font-semibold font-mono text-[10px] uppercase rounded tracking-wider shrink-0 transition-colors shadow"
                  >
                    Unlock Deep Analysis &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* VIP mode view */}
            {activeTab === "vip" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Premium Vault Header Indicator */}
                <div className="p-5 rounded-lg border-2 border-[#d6a775]/30 bg-gradient-to-r from-[#170a04] via-[#211108] to-[#170a04] text-center space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d6a775] to-transparent animate-pulse" />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5c199]/10 border border-[#e5c199]/20 text-[10px] font-mono text-[#e5c199] uppercase tracking-wider mx-auto">
                    <Crown className="w-3 h-3 text-[#e5c199] animate-bounce" />
                    Advanced Business Intelligence
                  </div>
                  <h4 className="text-base font-display font-medium text-[#f7f2ea]">Your Strategic Business Room</h4>
                  <p className="text-xs text-[#c7b39b]/80 max-w-md mx-auto leading-relaxed">
                    Clear business guidance built for real founders — not accountants.
                  </p>
                </div>

                {/* Sub-tab selection menu for VIP Room */}
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#140a05] p-1.5 rounded-lg border border-[#d6a775]/15 font-sans font-medium text-[11px] gap-1">
                  <button
                    onClick={() => setVipSubTab("cfo-chat")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "cfo-chat"
                        ? "bg-[#e5c199] text-black font-bold shadow-md"
                        : "text-[#c7b39b]/70 hover:text-[#f7f2ea] hover:bg-[#1c0e07]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Axora AI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </button>

                  <button
                    onClick={() => setVipSubTab("email-negotiator")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "email-negotiator"
                        ? "bg-[#e5c199] text-black font-bold shadow-md"
                        : "text-[#c7b39b]/70 hover:text-[#f7f2ea] hover:bg-[#1c0e07]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>AI Copilot Letters</span>
                  </button>

                  <button
                    onClick={() => setVipSubTab("strategic-audit")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "strategic-audit"
                        ? "bg-[#e5c199] text-black font-bold shadow-md"
                        : "text-[#c7b39b]/70 hover:text-[#f7f2ea] hover:bg-[#1c0e07]"
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Strategic Memo</span>
                  </button>

                  <button
                    onClick={() => setVipSubTab("sliders")}
                    className={`py-2 rounded text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      vipSubTab === "sliders"
                        ? "bg-[#e5c199] text-black font-bold shadow-md"
                        : "text-[#c7b39b]/70 hover:text-[#f7f2ea] hover:bg-[#1c0e07]"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>What Happens If…</span>
                  </button>
                </div>

                {/* Sub-Tab 1: AI Fractional CFO Hotline Chat */}
                {vipSubTab === "cfo-chat" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-lg border border-[#d6a775]/20 bg-[#0a0502]/90 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-[#d6a775]/10 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#e5c199]" />
                        <span className="text-xs font-sans font-bold text-[#e5c199] tracking-wider uppercase">Ask Axora AI</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Interactive AI Session Secured
                      </span>
                    </div>

                    {/* Chat Messages Frame */}
                    <div className="h-80 overflow-y-auto space-y-3.5 p-3 rounded bg-[#070301] border border-[#d6a775]/15 scrollbar-thin">
                      {cfoMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`p-3 rounded-lg text-xs max-w-[85%] leading-relaxed ${
                              msg.role === "user"
                                ? "bg-[#e5c199] text-black font-semibold rounded-tr-none"
                                : "bg-[#140804] border border-[#d6a775]/10 text-[#a39485] rounded-tl-none whitespace-pre-wrap select-text"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="p-3 rounded-lg text-xs bg-[#140804] border border-[#d6a775]/10 text-[#a39485] rounded-tl-none flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 text-[#e5c199] animate-spin shrink-0" />
                            <span>Axora is scanning your ledger and analyzing data...</span>
                          </div>
                        </div>
                      )}
                      {cfoError && (
                        <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-sans">
                          {cfoError}
                        </div>
                      )}
                    </div>

                    {/* Suggestions list for rapid click questions */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono text-[#c7b39b]/50 uppercase tracking-wider block">Suggested Questions for Axora:</span>
                      <div className="flex flex-col gap-1 sm:grid sm:grid-cols-2 sm:gap-1.5">
                        {[
                          "What are my three most immediate cash flow risk areas?",
                          "How can I safely increase our raw service pricing by 15%?",
                          "What happens if I rent a new office for $2,000 per month?",
                          "Should I freeze optional operations spend to protect our countdown clock?"
                        ].map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCfoInput(q)}
                            className="px-2 py-1.5 bg-[#180a04] hover:bg-[#201007] border border-[#d6a775]/10 rounded text-[10px] text-[#c7b39b] hover:text-white cursor-pointer transition-all text-left"
                          >
                            &bull; {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat input box */}
                    <form onSubmit={handleSendCfoMessage} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type strategic question... (e.g. should I cut costs?)"
                        value={cfoInput}
                        onChange={(e) => setCfoInput(e.target.value)}
                        className="flex-1 bg-[#0b0503] border border-[#d6a775]/25 hover:border-[#d6a775]/50 focus:border-[#d6a775] rounded px-3 py-2 text-xs text-[#f7f2ea] outline-none placeholder-[#a39485]/50"
                      />
                      <button
                        type="submit"
                        disabled={isChatLoading || !cfoInput.trim()}
                        className="px-4 py-2 bg-[#e5c199] hover:bg-[#d6a775] disabled:bg-[#d6a775]/20 disabled:text-[#c7b39b]/30 text-[#140a05] font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Sub-Tab 2: AI strategic communications copilot */}
                {vipSubTab === "email-negotiator" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-lg border border-[#d6a775]/20 bg-[#0a0502]/90 space-y-4"
                  >
                    <div className="border-b border-[#d6a775]/10 pb-2 flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#e5c199]" />
                        <span className="text-xs font-sans font-bold text-[#e5c199] tracking-wider uppercase">Strategic AI Communications Copilot</span>
                      </div>
                      <span className="text-[10px] text-[#a39485] font-light">Custom negotiations copy generalist</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#c7b39b]/70 font-mono uppercase">Scenario Objective</label>
                        <select
                          value={emailScenario}
                          onChange={(e) => {
                            setEmailScenario(e.target.value);
                            if (e.target.value === "Overdue Client Collection") {
                              setEmailObjective("Collect $15,000 overdue for 45 days with strict corporate urgency.");
                              setEmailRecipient("Customer Accounts Payable Supervisor");
                            } else if (e.target.value === "Vendor Term Delay") {
                              setEmailObjective("Politely request an extension of payments from 14 days to Net-45 terms.");
                              setEmailRecipient("Suppliers Accounting Department");
                            } else if (e.target.value === "SaaS Tool Rate Negotiation") {
                              setEmailObjective("Politely request a 20% discount on annual premium enterprise tiers.");
                              setEmailRecipient("Platform Customer Success Manager");
                            } else if (e.target.value === "Contractual Scope Creep") {
                              setEmailObjective("Notify a client that additional requirements require budget amendments.");
                              setEmailRecipient("Active Enterprise Project Sponsor");
                            }
                          }}
                          className="w-full bg-[#140a06] border border-[#d6a775]/25 rounded p-2 text-xs text-white cursor-pointer"
                        >
                          <option value="Overdue Client Collection">Overdue Client Collection</option>
                          <option value="Vendor Term Delay">Vendor Contract Extension</option>
                          <option value="SaaS Tool Rate Negotiation">SaaS Software Bill Negotation</option>
                          <option value="Contractual Scope Creep">Project Scope Creep Charge</option>
                          <option value="custom">-- Custom Negotiator Target --</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#c7b39b]/70 font-mono uppercase">Professional Tone</label>
                        <select
                          value={emailTone}
                          onChange={(e) => setEmailTone(e.target.value)}
                          className="w-full bg-[#140a06] border border-[#d6a775]/25 rounded p-2 text-xs text-white cursor-pointer"
                        >
                          <option value="Gentle Reminder">Gentle Reminder</option>
                          <option value="Direct Executive">Direct Executive</option>
                          <option value="Firm & Legal">Firm & Legal</option>
                          <option value="Aesthetic Partner Proposal">Highly Collaborative Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#c7b39b]/70 font-mono uppercase">Target Recipient Representative</label>
                        <input
                          type="text"
                          value={emailRecipient}
                          onChange={(e) => setEmailRecipient(e.target.value)}
                          className="w-full bg-[#140a06] border border-[#d6a775]/25 rounded p-2 text-xs text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#c7b39b]/70 font-mono uppercase">Target Financial Objective</label>
                        <input
                          type="text"
                          value={emailObjective}
                          onChange={(e) => setEmailObjective(e.target.value)}
                          className="w-full bg-[#140a06] border border-[#d6a775]/25 rounded p-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    {emailScenario === "custom" && (
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#c7b39b]/70 font-mono uppercase">Custom Situation Specifications</label>
                        <textarea
                          placeholder="Type specific parameters (e.g. Acme corp is 12 days late, we delivered all design files but our point person hasn't responded)..."
                          value={emailCustom}
                          onChange={(e) => setEmailCustom(e.target.value)}
                          className="w-full h-16 bg-[#140a06] border border-[#d6a775]/25 rounded p-2 text-xs text-white resize-none outline-none"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleGenerateAiEmail}
                      disabled={isGeneratingEmail}
                      className="w-full py-2.5 bg-[#e5c199] hover:bg-[#d6a775] disabled:bg-[#d6a775]/20 disabled:text-[#c7b39b]/30 text-black font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isGeneratingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 text-black animate-spin shrink-0" />
                          <span>Forging Persuasive Copy...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-black animate-pulse" />
                          <span>Forge Custom Negotiator Letter</span>
                        </>
                      )}
                    </button>

                    {emailError && (
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
                        {emailError}
                      </div>
                    )}

                    {aiSubject && aiBody && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded bg-[#070301] border border-[#d6a775]/15 space-y-3"
                      >
                        <div className="border-b border-[#d6a775]/10 pb-2 flex justify-between items-center text-xs">
                          <div className="flex-1 min-w-0 mr-2">
                            <span className="text-[#c7b39b]/60 uppercase font-mono text-[9px] block">Generated Subject Line:</span>
                            <span className="text-[#f7f2ea] font-medium block truncate">{aiSubject}</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`Subject: ${aiSubject}\n\n${aiBody}`);
                              alert("Copied entire communication pack to clipboard.");
                            }}
                            className="text-[9px] font-mono text-[#e5c199] border border-[#e5c199]/20 hover:bg-[#e5c199]/10 px-2 py-1 rounded cursor-pointer shrink-0"
                          >
                            Copy Pack
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={aiBody}
                          className="w-full h-48 bg-transparent resize-none text-[#a39485] font-light leading-relaxed scrollbar-thin outline-none text-xs select-text"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Sub-Tab 3: AI Deep-Dive Strategic Audit Memo */}
                {vipSubTab === "strategic-audit" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-lg border border-[#d6a775]/20 bg-[#0a0502]/90 space-y-4"
                  >
                    <div className="border-b border-[#d6a775]/10 pb-2 flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-[#e5c199]" />
                        <span className="text-xs font-sans font-bold text-[#e5c199] tracking-wider uppercase">Strategic Advisory Room</span>
                      </div>
                      <span className="text-[10px] text-[#a39485] font-light">Industry competitive ratio indices</span>
                    </div>

                    <p className="text-xs text-[#a39485] leading-relaxed font-light">
                      Our advanced models will cross-reference your business metrics with industry benchmarks to generate a clear advisory memo.
                    </p>

                    <button
                      onClick={handleGenerateStrategicMemo}
                      disabled={isGeneratingMemo}
                      className="w-full py-2.5 bg-[#e5c199] hover:bg-[#d6a775] disabled:bg-[#d6a775]/20 disabled:text-[#c7b39b]/30 text-black font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isGeneratingMemo ? (
                        <>
                          <Loader2 className="w-4 h-4 text-black animate-spin shrink-0" />
                          <span>Calculating margins, ratios & sector rules...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-black" />
                          <span>Generate Strategic Advisory Memo</span>
                        </>
                      )}
                    </button>

                    {memoError && (
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
                        {memoError}
                      </div>
                    )}

                    {strategicMemo && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-lg bg-[#070301] border border-[#d6a775]/15 space-y-3 max-h-[450px] overflow-y-auto scrollbar-thin"
                      >
                        <div className="flex justify-between items-center border-b border-[#d6a775]/10 pb-2 mb-2">
                          <span className="text-[10px] font-mono text-[#e5c199] uppercase tracking-wider">STRATEGIC ADVISORY REPORT</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(strategicMemo);
                              alert("Memo body copied to clipboard.");
                            }}
                            className="text-[9.5px] font-mono text-[#e5c199] underline cursor-pointer shrink-0"
                          >
                            Copy Brief
                          </button>
                        </div>
                        <div className="text-xs text-[#a39485] leading-relaxed font-light whitespace-pre-wrap font-sans space-y-3 select-text memo-body">
                          {strategicMemo}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Sub-Tab 4: Sliders & Calculators - Conditional Wrap */}
                {vipSubTab === "sliders" && (
                  <div className="space-y-6">
                    {/* Part A: Custom Private Sandbox Simulator Room */}
                    {(() => {
                  let expenseAdj = simExtraExpenses;
                  let salesAdj = simExtraSales;
                  let detectedMsg = "";

                  const text = simText.toLowerCase();
                  if (text) {
                    if (text.includes("rent") || text.includes("office") || text.includes("lease")) {
                      expenseAdj += 1500;
                      detectedMsg = "Rent increase detected: adding standard simulated office lease fees (+1,500/mo)";
                    } else if (text.includes("hire") || text.includes("staff") || text.includes("employee") || text.includes("salary") || text.includes("assistant") || text.includes("engineer")) {
                      expenseAdj += 4000;
                      detectedMsg = "New headcount detected: adding simulated salary burden (+4,000/mo)";
                    } else if (text.includes("raise price") || text.includes("increase price") || text.includes("double price") || text.includes("pricing")) {
                      salesAdj += Math.round(inputs.monthlyRevenue * 0.20);
                      detectedMsg = "Pricing increase detected: simulating +20% sales markup power boost";
                    } else if (text.includes("lose client") || text.includes("customer exit") || text.includes("churn") || text.includes("lost")) {
                      salesAdj -= Math.round(inputs.monthlyRevenue * 0.15);
                      detectedMsg = "Customer attrition detected: simulating -15% overall capacity drop";
                    } else {
                      const numberMatches = text.match(/\d+[\d,.]*/g);
                      if (numberMatches && numberMatches.length > 0) {
                        const parsedNum = parseInt(numberMatches[0].replace(/,/g, ""));
                        if (parsedNum > 0) {
                          if (text.includes("cut") || text.includes("save") || text.includes("cancel") || text.includes("reduce") || text.includes("trim")) {
                            expenseAdj -= parsedNum;
                            detectedMsg = `Bill reduction parsed: trimming monthly expenses by -${formatValue(parsedNum)}`;
                          } else {
                            expenseAdj += parsedNum;
                            detectedMsg = `Expense parsed: adding monthly overhead bill by +${formatValue(parsedNum)}`;
                          }
                        }
                      }
                    }
                  }

                  const simRev = Math.max(0, inputs.monthlyRevenue + salesAdj);
                  const simExp = Math.max(0, inputs.opex + inputs.cogs + inputs.debtRepayments + expenseAdj);
                  const simNet = simRev - simExp;
                  const simRunway = simNet >= 0 ? 99 : Math.max(0, inputs.cashBalance / Math.abs(simNet));
                  const originalNet = inputs.monthlyRevenue - (inputs.opex + inputs.cogs + inputs.debtRepayments);
                  const originalRunway = originalNet >= 0 ? 99 : Math.max(0, inputs.cashBalance / Math.abs(originalNet));

                  // Safe Bank Loan Formula
                  const safeLoanLimit = Math.round(inputs.monthlyRevenue * 12 * 0.18);

                  return (
                    <div className="space-y-6">
                      <div className="p-5 rounded border-2 border-[#d6a775]/20 bg-[#0c0604] space-y-4">
                        <div className="border-b border-[#d6a775]/10 pb-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#e5c199] animate-pulse" />
                            <span className="text-xs font-sans font-semibold uppercase text-[#e5c199] tracking-wider">What Happens If…</span>
                          </div>
                          {simText || expenseAdj !== 0 || salesAdj !== 0 ? (
                            <button
                              onClick={() => {
                                setSimText("");
                                setSimExtraExpenses(0);
                                setSimExtraSales(0);
                              }}
                              className="text-[9px] font-mono text-rose-400 hover:underline cursor-pointer"
                            >
                              Reset What-If
                            </button>
                          ) : null}
                        </div>

                        {/* Text explanation */}
                        <p className="text-xs text-[#a39485] leading-relaxed font-light">
                          Type any plain-English business scenario below (e.g., <span className="text-white italic">"Hired 2 new developers for 5,000"</span>, <span className="text-white italic">"Our office rent increases"</span>, <span className="text-white italic">"Cut general bills by 1,200"</span>), or tap a quick pre-defined situation card to immediately see the impact.
                        </p>

                        {/* Input Area */}
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Type any situation here (e.g. rent increases, raise prices, save 500)..."
                            value={simText}
                            onChange={(e) => setSimText(e.target.value)}
                            className="w-full bg-[#140a06] border border-[#d6a775]/25 hover:border-[#d6a775]/50 focus:border-[#d6a775] rounded p-3 text-xs text-white outline-none"
                          />
                          {detectedMsg && (
                            <div className="text-[10px] text-[#e5c199] font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#e5c199]" />
                              <span>{detectedMsg}</span>
                            </div>
                          )}
                        </div>

                        {/* Predefined Instant Situation Cards */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Salary raise requested", text: "Key staff requested team salary raises", exp: 2500, sale: 0 },
                            { label: "Upgrade raw suppliers", text: "Raw materials and direct supplier costs rise", exp: 1200, sale: 0 },
                            { label: "Raise service prices +15%", text: "Negotiate +15% price expansion across active accounts", exp: 0, sale: Math.round(inputs.monthlyRevenue * 0.15) },
                            { label: "Trim unused software", text: "Cut monthly background software tool fees by 800", exp: -800, sale: 0 }
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSimText(item.text);
                                setSimExtraExpenses(item.exp);
                                setSimExtraSales(item.sale);
                              }}
                              className="p-2.5 text-left bg-[#140804] border border-[#d6a775]/10 hover:border-[#d6a775]/30 rounded text-[11px] text-[#c7b39b] hover:text-white transition-all cursor-pointer block"
                            >
                              <div className="font-semibold text-[#f7f2ea]">{item.label}</div>
                              <p className="text-[9px] text-[#a39485]/70 mt-0.5 font-light">Test impact instantly</p>
                            </button>
                          ))}
                        </div>

                        {/* Comparison Dashboard results */}
                        <div className="grid grid-cols-2 gap-3 p-3.5 rounded bg-[#1c0e07] border border-[#d6a775]/15">
                          <div className="text-center md:text-left space-y-1">
                            <span className="text-[9px] font-sans uppercase text-[#c7b39b] font-medium tracking-wider">Before Situation</span>
                            <div className="text-lg font-sans font-bold text-[#a39485]">
                              {originalRunway === 99 ? "Guarded" : `${originalRunway.toFixed(1)} Months`}
                            </div>
                            <span className="text-[9px] text-[#a39485]/50 block">Monthly runway countdown</span>
                          </div>

                          <div className="text-center md:text-left space-y-1 border-l border-[#d6a775]/15 pl-3">
                            <span className="text-[9px] font-sans uppercase text-[#e5c199] font-bold tracking-wider">With Situation Applied</span>
                            <div className={`text-xl font-sans font-extrabold ${simRunway < originalRunway ? "text-rose-400" : simRunway > originalRunway ? "text-emerald-400" : "text-[#e5c199]"}`}>
                              {simRunway === 99 ? "Self-Sustaining" : `${simRunway.toFixed(1)} Months`}
                            </div>
                            <span className="text-[9px] text-[#a39485]/50 block">New simulated runway</span>
                          </div>
                        </div>
                      </div>

                      {/* Part B: Premium VIP Safe Loan & Bank Debt Limit Estimator */}
                      <div className="p-5 rounded border border-[#d6a775]/15 bg-gradient-to-br from-[#100603] to-[#1c0a04] space-y-3.5">
                        <div className="flex gap-2 items-center border-b border-[#d6a775]/10 pb-2">
                          <Crown className="w-4 h-4 text-[#e5c199]" />
                          <span className="text-xs font-sans font-semibold text-white uppercase tracking-wider">Safe Loan Advisor</span>
                        </div>

                        <p className="text-xs text-[#a39485] leading-relaxed font-light">
                          Thinking about applying for a credit line or a business bank loan? Below is your safe, calculated limit and advisory guidance based directly on your incoming baseline sales ledger.
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded bg-[#090301] border border-[#d6a775]/10 text-center sm:text-left">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-[#c7b39b] tracking-wider uppercase font-medium">Recommended Safe Loan Limit</span>
                            <div className="text-2xl font-sans font-extrabold text-[#f7f2ea]">
                              {formatValue(safeLoanLimit)}
                            </div>
                            <span className="text-[9px] text-[#a39485] font-light block">Calculated at a healthy 18% of annualized sales</span>
                          </div>

                          <div className="py-1 px-3 rounded text-[10px] font-sans bg-[#e5c199]/10 border border-[#e5c199]/20 text-[#e5c199] text-center max-w-[150px] mx-auto sm:mx-0">
                            {inputs.cashBalance > simExp * 3 ? "Highly Approved" : "High Risk Watch"}
                          </div>
                        </div>

                        <div className="p-3.5 bg-[#090301] rounded border border-l-4 border-l-[#d6a775] border-y-[#d6a775]/10 border-r-[#d6a775]/10">
                          <span className="text-[9px] font-mono uppercase text-[#e5c199] block tracking-widest mb-1">Axora Guidance:</span>
                          <p className="text-xs text-[#a39485] font-light leading-relaxed">
                            {inputs.cashBalance > simExp * 4 ? (
                              `Your cash flow ledger is incredibly strong! Banks will comfortably lend you up to ${formatValue(safeLoanLimit)} without risk. You can deploy this capital confidently to expand operations or invest in equipment.`
                            ) : (
                              `Caution: Your cash reserves are too thin. Do not take on business bank loans right now. Focus strictly on collecting outstanding invoices from Clients to organic boost cash first!`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Part B: Personal Owner Drawer & Salary Health Advisor */}
                {report.ownerSalaryAnalysis && (
                  <div className="p-5 rounded border border-[#d6a775]/20 bg-gradient-to-tr from-[#1b0d06] to-[#0c0604] space-y-4">
                    <div className="flex justify-between items-center border-b border-[#d6a775]/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#e5c199]" />
                        <span className="text-xs font-mono uppercase text-[#e5c199]">Safe Founder Pay</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider ${
                        report.ownerSalaryAnalysis.grade === "Healthy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        report.ownerSalaryAnalysis.grade === "Concern" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        Draw Status: {report.ownerSalaryAnalysis.grade}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 rounded bg-[#100603] border border-[#d6a775]/10">
                      <div className="space-y-1 shrink-0 md:border-r md:border-[#d6a775]/10 md:pr-6 text-center md:text-left">
                        <span className="text-[10px] font-mono uppercase text-[#c7b39b]">Maximum Safe Monthly Draw</span>
                        <div className="text-3xl font-display font-light text-[#f7f2ea]">
                          {formatValue(report.ownerSalaryAnalysis.maxSafeDraw)}
                        </div>
                        <span className="text-[9px] text-[#a39485] font-light block">Without shrinking your emergency runway buffer</span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#c7b39b] block">Personal Advisory Note</span>
                        <p className="text-xs text-[#a39485] font-light leading-relaxed">
                          {report.ownerSalaryAnalysis.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono uppercase text-[#c7b39b]/60 block tracking-wider">Recommended Safety Action Guidelines:</span>
                      <ul className="space-y-2">
                        {report.ownerSalaryAnalysis.actionSteps.map((step, i) => (
                          <li key={i} className="flex gap-2.5 items-start text-xs text-[#a39485]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d6a775] mt-1.5 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Part C: Interactive Tomorrow Morning Checklist */}
                {report.tomorrowMorningActionChecklist && (
                  <div className="p-5 rounded border border-[#d6a775]/15 bg-[#140a06] space-y-4">
                    <div className="border-b border-[#d6a775]/10 pb-2">
                      <span className="text-xs font-mono uppercase text-[#e5c199] block">Your "Tomorrow Morning" 4-Step Checklist</span>
                      <p className="text-[10px] text-[#a39485] font-light">Interactive no-nonsense checklist. Check items off as you finish them!</p>
                    </div>

                    <div className="space-y-3">
                      {report.tomorrowMorningActionChecklist.map((item) => {
                        const isChecked = !!checkedActions[item.id];
                        return (
                          <div 
                            key={item.id}
                            onClick={() => setCheckedActions({ ...checkedActions, [item.id]: !isChecked })}
                            className={`p-4 rounded border cursor-pointer transition-all ${
                              isChecked 
                                ? "bg-[#18231c]/40 border-emerald-500/25 opacity-70" 
                                : "bg-[#0b0503] border-[#d6a775]/10 hover:border-[#d6a775]/30"
                            }`}
                          >
                            <div className="flex gap-3 items-start">
                              <button 
                                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  isChecked 
                                    ? "bg-emerald-500 border-emerald-500 text-black" 
                                    : "border-[#d6a775]/30 hover:border-[#d6a775]/60"
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              
                              <div className="space-y-1 flex-1">
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs font-medium ${isChecked ? "text-[#a39485] line-through" : "text-[#f7f2ea]"}`}>
                                    {item.title}
                                  </span>
                                  <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded tracking-wider ${
                                    item.urgency === "Immediate" ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" :
                                    item.urgency === "High" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                                    "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                                  }`}>
                                    {item.urgency}
                                  </span>
                                </div>
                                <p className={`text-[11px] leading-relaxed ${isChecked ? "text-[#a39485]/55" : "text-[#a39485] font-light"}`}>
                                  {item.laymanStep}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Part D: Active Warnings & Danger Logs */}
                <div className="p-5 rounded border border-[#d6a775]/20 bg-gradient-to-r from-[#170a04] to-[#0d0603] space-y-3">
                  <span className="text-[10px] font-mono text-[#e5c199] uppercase tracking-widest block">
                    Cash Leak Warnings
                  </span>

                  <ul className="space-y-2.5">
                    {report.pressurePoints.map((point, index) => (
                      <li key={index} className="flex gap-2.5 items-start text-xs text-[#a39485] leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                 {/* Part E: Private Stress Simulation Workspace - Super simple and highly intuitive */}
                <div id="business-what-if-panel" className="p-5 rounded border border-[#d6a775]/15 bg-[#140a06] space-y-4">
                  <div className="flex justify-between items-center border-b border-[#d6a775]/5 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-sans font-bold text-[#e5c199] block uppercase tracking-wider" id="simulate-tag">
                        Stress Simulator & Event Forecaster
                      </span>
                      <p className="text-[10px] text-[#a39485] font-light">Drag the sliders below to see how heavy business storms affect your survival countdown clock.</p>
                    </div>
                    <button
                      onClick={() => {
                        setWhatIfSalesDrop(0);
                        setWhatIfCOGSIncrease(0);
                        setWhatIfClientLoss(0);
                        setWhatIfSalaryHike(0);
                      }}
                      className="text-[10px] font-sans text-[#c7b39b]/60 hover:text-white underline cursor-pointer"
                    >
                      Reset Swells
                    </button>
                  </div>

                  {/* Slider 1: Sales shock */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#a39485] font-light">What if customer sales drop or slow down?</span>
                      <span className="font-sans font-bold text-rose-400">-{whatIfSalesDrop}% Sales drop</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      step="5"
                      value={whatIfSalesDrop}
                      onChange={(e) => setWhatIfSalesDrop(Number(e.target.value))}
                      className="w-full accent-[#d6a775] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-[#a39485]/40 font-mono">
                      <span>Normal</span>
                      <span>Heavy (45%)</span>
                    </div>
                  </div>

                  {/* Slider 2: Supply or third-party cost swelling */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#a39485] font-light">What if material cost or supplier bills rise?</span>
                      <span className="font-sans font-bold text-rose-400">+{whatIfCOGSIncrease}% Cost Spike</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="5"
                      value={whatIfCOGSIncrease}
                      onChange={(e) => setWhatIfCOGSIncrease(Number(e.target.value))}
                      className="w-full accent-[#d6a775] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-[#a39485]/40 font-mono">
                      <span>No increase</span>
                      <span>Severe (40%)</span>
                    </div>
                  </div>

                  {/* Slider 3: Client churn */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#a39485] font-light">What if key clients cancel their account?</span>
                      <span className="font-sans font-bold text-rose-400">-{whatIfClientLoss}% Departure</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="10"
                      value={whatIfClientLoss}
                      onChange={(e) => setWhatIfClientLoss(Number(e.target.value))}
                      className="w-full accent-[#d6a775] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-[#a39485]/40 font-mono">
                      <span>Full Loyalty</span>
                      <span>Extreme (50%)</span>
                    </div>
                  </div>

                  {/* Slider 4: Wage inflation limit */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#a39485] font-light">What if employees or rents require price raises?</span>
                      <span className="font-sans font-bold text-rose-400">+{whatIfSalaryHike}% Wage Burden</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="5"
                      value={whatIfSalaryHike}
                      onChange={(e) => setWhatIfSalaryHike(Number(e.target.value))}
                      className="w-full accent-[#d6a775] cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-[#a39485]/40 font-mono">
                      <span>Standard Wages</span>
                      <span>Spiked (30%)</span>
                    </div>
                  </div>
                </div>

                {/* Part F: Visual Recharts Cashflow Forecast */}
                <div id="chart-panel" className="p-5 rounded border border-[#d6a775]/10 bg-[#0c0604] space-y-4">
                  <span className="text-[10px] font-mono uppercase text-[#c7b39b] block">6-Month Cash Reserve Trajectory Projection</span>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={report.cashflowForecast}
                        margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d6a775" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#d6a775" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a140b/10" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          stroke="#c7b39b/40" 
                          fontSize={9} 
                          tickLine={false} 
                        />
                        <YAxis 
                          stroke="#c7b39b/40" 
                          fontSize={9} 
                          tickLine={false} 
                          tickFormatter={(v) => `${curSymbol}${Math.round(v/1000)}k`} 
                        />
                        <Tooltip
                          contentStyle={{ background: "#170b06", borderColor: "#d6a775/30", color: "#f7f2ea" }}
                          itemStyle={{ color: "#e5c199", fontSize: 11 }}
                          labelStyle={{ color: "#a39485", fontSize: 10 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="projectedCash" 
                          stroke="#d6a775" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorCash)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-[9.5px] text-[#a39485] font-light text-center">
                    Visual plot charts change in bank reserves based on simulated client shock factor constraints.
                  </p>
                </div>

                {/* Part G: Client Negotiation Campaign Templates */}
                {report.vipLettersToClients && (
                  <div className="p-5 rounded border-2 border-[#d6a775]/20 bg-gradient-to-b from-[#140a05] to-[#0c0603] space-y-4">
                    <div className="border-b border-[#d6a775]/10 pb-2">
                      <span className="text-xs font-mono uppercase text-[#e5c199] block">Ready-to-Use Client Communications Portal</span>
                      <p className="text-[10px] text-[#a39485] leading-normal font-light">Copy and paste these professional templates to directly influence your cash flow.</p>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {report.vipLettersToClients.map((letter, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedEmailIndex(index);
                            setCopiedState(false);
                          }}
                          className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase cursor-pointer transition-colors ${
                            selectedEmailIndex === index 
                              ? "bg-[#e5c199] text-black font-semibold" 
                              : "bg-[#180c07] text-[#c7b39b] border border-[#d6a775]/10 hover:text-white"
                          }`}
                        >
                          Scenario {index + 1}
                        </button>
                      ))}
                    </div>

                    {/* Email Editor Sandbox */}
                    <div className="p-4 rounded bg-[#070301] border border-[#d6a775]/15 space-y-3">
                      <div>
                        <span className="text-[9px] font-mono text-[#c7b39b]/60 uppercase block">Live Situation Case:</span>
                        <p className="text-xs text-[#e5c199] font-medium">{report.vipLettersToClients[selectedEmailIndex].scenario}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] bg-[#140a05]/60 p-2.5 rounded border border-[#d6a775]/5">
                        <div>
                          <span className="text-[#c7b39b]/60 uppercase block font-mono">Suggested Recipient</span>
                          <span className="text-[#f7f2ea]">{report.vipLettersToClients[selectedEmailIndex].recipient}</span>
                        </div>
                        <div>
                          <span className="text-[#c7b39b]/60 uppercase block font-mono">Target Objective</span>
                          <span className="text-[#f7f2ea]">{report.vipLettersToClients[selectedEmailIndex].objective}</span>
                        </div>
                      </div>

                      {/* Web-Inbox Frame */}
                      <div className="space-y-2 border border-[#d6a775]/10 rounded bg-[#0d0603] p-3 text-xs flex flex-col">
                        <div className="border-b border-[#d6a775]/5 pb-2 text-[11px]">
                          <span className="text-[#a39485] font-mono">Subject: </span>
                          <span className="text-[#f7f2ea] font-medium">{report.vipLettersToClients[selectedEmailIndex].subjectLine}</span>
                        </div>
                        <textarea
                          readOnly
                          value={report.vipLettersToClients[selectedEmailIndex].emailBody}
                          className="w-full h-44 bg-transparent resize-none text-[#a39485] font-light leading-relaxed scrollbar-thin outline-none"
                        />
                      </div>

                      <div className="flex justify-between items-center bg-[#100603] p-1 rounded-md border border-[#d6a775]/5">
                        <span className="text-[9px] text-[#a39485] pl-1">Press Copy to copy the formatted text.</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(report.vipLettersToClients[selectedEmailIndex].emailBody);
                            setCopiedState(true);
                            setTimeout(() => {
                              setCopiedState(false);
                            }, 2000);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d6a775] hover:bg-[#e5c199] text-black text-[10px] font-mono uppercase tracking-wider rounded font-medium cursor-pointer transition-colors"
                        >
                          {copiedState ? (
                            <>
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy Template
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Part H: CFO Tactical Advice steps */}
                <div className="p-5 rounded border border-[#d6a775]/25 bg-gradient-to-tr from-[#1b0a04] to-[#0c0604] space-y-4">
                  <span className="text-[10px] font-mono text-[#e5c199] tracking-widest uppercase block">
                    Suggested Next Moves
                  </span>

                  <div className="space-y-1.5 pb-2 border-b border-[#d6a775]/5">
                    <span className="text-[9.5px] text-[#a39485] uppercase block">Primary Roadmap Focus Action:</span>
                    <p className="text-xs text-[#f7f2ea] font-medium leading-relaxed">{report.strategicCFOAdvice.priorityAction}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9.5px] text-[#c7b39b] uppercase block">Operations Tactics Summary:</span>
                    <ul className="space-y-2">
                      {report.strategicCFOAdvice.tactics.map((tactic, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-xs text-[#a39485] leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{tactic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                </div>
                )}
              </motion.div>
            )}

            {/* Clear workflow actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#d6a775]/15">
              <button
                onClick={downloadReportHTML}
                className="flex-1 py-3 bg-[#e5c199] hover:bg-[#ebd2b5] text-xs font-mono uppercase text-black font-semibold rounded cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Standalone Lab
              </button>
              <button
                onClick={() => setIsReportReady(false)}
                className="flex-1 py-3 bg-[#1e0f09] hover:bg-[#2b150c] text-xs font-mono uppercase text-[#e5c199] rounded border border-[#d6a775]/25 cursor-pointer text-center"
              >
                Change numbers
              </button>
              <button
                onClick={handleBack}
                className="flex-1 py-3 bg-[#633821] hover:bg-[#78442a] text-xs font-mono uppercase text-[#f7f2ea] rounded cursor-pointer text-center"
              >
                Analyze Another Business
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
