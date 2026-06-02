/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ResidentialInputs,
  ResidentialReport,
  LandInputs,
  LandReport,
  CommercialInputs,
  CommercialReport,
  BusinessInputs,
  BusinessReport,
} from "../types";

/**
 * Calculates monthly EMI for a standard reducing interest loan
 */
export function calculateEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / (tenureYears * 12);
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Number.isNaN(emi) ? 0 : emi;
}

/**
 * Property Decision Intel Engine
 */
export function computeResidentialReport(
  inputs: ResidentialInputs,
  whatIfRate?: number,
  whatIfIncomeRatio?: number,
  whatIfPriceReduction?: number
): ResidentialReport {
  // Apply What-If overrides if provided
  const overriddenPrice = inputs.purchasePrice - (whatIfPriceReduction || 0);
  const overriddenRate = whatIfRate !== undefined ? whatIfRate : inputs.interestRate;
  const overriddenIncome = inputs.monthlyIncome * (whatIfIncomeRatio !== undefined ? whatIfIncomeRatio : 1);

  const loanAmount = Math.max(0, overriddenPrice - inputs.downPayment);
  const emi = calculateEMI(loanAmount, overriddenRate, inputs.tenureYears);

  const totalMonthlyCommitments = emi + inputs.existingDebts;
  const debtToIncomeRatio = overriddenIncome > 0 ? (totalMonthlyCommitments / overriddenIncome) * 100 : 0;
  
  const breathingRoom = overriddenIncome - emi - inputs.existingDebts - inputs.monthlyMaintenance;

  // Compute Cash Confidence Score
  let score = 100;
  
  // DTI impact
  if (debtToIncomeRatio > 45) {
    score -= 35;
  } else if (debtToIncomeRatio > 35) {
    score -= 20;
  } else if (debtToIncomeRatio > 25) {
    score -= 10;
  }

  // Downpayment cushion impact
  const downPaymentPercent = overriddenPrice > 0 ? (inputs.downPayment / overriddenPrice) * 100 : 0;
  if (downPaymentPercent < 10) {
    score -= 20;
  } else if (downPaymentPercent < 20) {
    score -= 10;
  } else if (downPaymentPercent >= 35) {
    score += 5; // reward strong equity
  }

  // Breathing room threshold
  if (breathingRoom < 500) {
    score -= 25;
  } else if (breathingRoom < 1500) {
    score -= 10;
  } else if (breathingRoom > 3000) {
    score += 5;
  }

  score = Math.max(5, Math.min(100, score));

  // Human Safety Criteria
  let safetyStatus: "safe" | "caution" | "danger" = "safe";
  let safetyTitle = "Green Sky Zone";
  let safetyDesc = "This decision fits within your wealth comfort lane. It exhibits low cash stress and preserves a thick buffer.";
  let safetyImpact = "Your household can comfortably absorb standard economic shifts, rate increases, or a minor career hiatus.";

  if (debtToIncomeRatio > 45 || breathingRoom < 800) {
    safetyStatus = "danger";
    safetyTitle = "High Squeeze Zone";
    safetyDesc = "Critical pressure. Mortgage and current commitments consume too much of your monthly capital.";
    safetyImpact = "A temporary job transition or surprise home repairs would trigger high distress. Postpone or renegotiate.";
  } else if (debtToIncomeRatio > 33 || breathingRoom < 1800) {
    safetyStatus = "caution";
    safetyTitle = "High Stress Corridor";
    safetyDesc = "Sustainable but tight. Your budget is sensitive to discretionary surges.";
    safetyImpact = "Requires strict discipline. Discretionary spending (vacations, luxury tech) will be heavily curbed.";
  }

  // Future scenarios
  const rFuture = (inputs.estimatedAppreciation || 5) / 100;
  const fv5 = overriddenPrice * Math.pow(1 + rFuture, 5);
  const fv10 = overriddenPrice * Math.pow(1 + rFuture, 10);
  const fv20 = overriddenPrice * Math.pow(1 + rFuture, 20);

  // Rental Strength
  const estimatedMarketRent = overriddenPrice * 0.0035; // e.g. 0.35% monthly rent ratio
  const rentCoveragePercent = emi > 0 ? (estimatedMarketRent / emi) * 100 : 100;
  let rentRating: "Weak" | "Moderate" | "Exceptional" = "Moderate";
  let rentDesc = "The rent from similar properties supports about half of the loan commitment, representing basic safety.";
  if (rentCoveragePercent < 45) {
    rentRating = "Weak";
    rentDesc = "Extremely weak asset-backed backup. If forced to rent this out, you must inject heavy monthly capital to bridge the gap.";
  } else if (rentCoveragePercent > 70) {
    rentRating = "Exceptional";
    rentDesc = "Exceptional hedge. Rent from this property can cover nearly the full liability, giving you outstanding survival options.";
  }

  // Negotiation Script
  const recommendedOffer = Math.round(overriddenPrice * 0.93 / 1000) * 1000;
  const openingLine = `We are highly interested in moving forward, but based on a clinical structural cachement analysis of the local supply and current rate environment, we are prepared to establish a firm contract at $${recommendedOffer.toLocaleString()}.`;
  const leveragePoints = [
    `Current interest rates are placing extreme downward price pressure; our $${inputs.downPayment.toLocaleString()} downpayment means rapid approval with no delay contingency.`,
    `The property maintenance overhead of $${inputs.monthlyMaintenance.toLocaleString()}/mo reduces cash efficiency compared to newer building footprints in the subzone.`,
    `Local comparables have seen an average shelf-life extension of 14 days, reflecting a cooling localized buying premium.`
  ];

  // Verdict
  let verdictStatus: "approved" | "conditional" | "withhold" = "approved";
  let verdictTitle = "This Home Looks Financially Comfortable";
  let rationale = "Based on your income, savings, and monthly commitments, this home currently looks financially safe and manageable.";

  if (score < 40) {
    verdictStatus = "withhold";
    verdictTitle = "This Decision May Create High Financial Stress";
    rationale = "The monthly pressure of this purchase exceeds safe limits. It risks consuming too much of your daily lifestyle and savings buffer.";
  } else if (score < 68) {
    verdictStatus = "conditional";
    verdictTitle = "This Home Might Feel Tight Under Pressure";
    rationale = "It is achievable, but you might feel the monthly squeeze. To make it comfortable, we suggest increasing your down payment, negotiating a discount, or securing a lower interest rate.";
  }

  return {
    cashConfidenceScore: Math.round(score),
    emi: Math.round(emi),
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
    breathingRoom: Math.round(breathingRoom),
    humanSafetyReport: {
      status: safetyStatus,
      title: safetyTitle,
      description: safetyDesc,
      lifestyleImpact: safetyImpact,
    },
    futureValueScenarios: {
      years5: Math.round(fv5),
      years10: Math.round(fv10),
      years20: Math.round(fv20),
    },
    rentalStrength: {
      score: Math.min(100, Math.round(rentCoveragePercent)),
      rating: rentRating,
      description: rentDesc,
    },
    negotiationScript: {
      recommendedOffer,
      openingLine,
      leveragePoints,
    },
    verifiedVerdict: {
      status: verdictStatus,
      title: verdictTitle,
      rationale,
    },
  };
}

/**
 * Land Intelligence Analyzer
 */
export function computeLandReport(
  inputs: LandInputs,
  whatIfDelayInfra = false,
  whatIfSlowGrowth = false
): LandReport {
  let baseRate = 8;
  const corridorStr = inputs.growthCorridor;
  
  if (corridorStr === "strong" || corridorStr === "metro" || corridorStr === "highway" || corridorStr === "airport" || corridorStr === "it") {
    baseRate = 14;
  } else if (corridorStr === "danger" || corridorStr === "rural") {
    baseRate = 2;
  } else {
    baseRate = 8;
  }

  // Apply What-If parameters
  const finalGrowthRate = whatIfSlowGrowth ? Math.max(-2, baseRate - 5) : baseRate;
  
  const totalPrice = inputs.purchasePrice + inputs.taxesFees;
  const holdingExp = inputs.holdingPeriodYears;

  // Appreciation lines
  const conservativeGrowth = finalGrowthRate - 3;
  let expectedGrowth = finalGrowthRate;
  const aggressiveGrowth = finalGrowthRate + 4;

  const cautiousVal = totalPrice * Math.pow(1 + conservativeGrowth / 100, holdingExp);
  const expectedVal = totalPrice * Math.pow(1 + expectedGrowth / 100, holdingExp);
  const aggressiveVal = totalPrice * Math.pow(1 + aggressiveGrowth / 100, holdingExp);

  // Grade
  let grade: "A" | "B" | "C" = "B";
  let gradeTitle = "Investment Grade B (Appreciation Core)";
  let growthPotential = "Growth is solid but relies heavily on localized infrastructure development.";

  const isStrongCorridor = corridorStr === "strong" || corridorStr === "metro" || corridorStr === "highway" || corridorStr === "airport" || corridorStr === "it";
  const isWeakCorridor = corridorStr === "danger" || corridorStr === "rural";

  if (isStrongCorridor && inputs.clearTitleChecked && inputs.roadAccess) {
    grade = "A";
    gradeTitle = "Premium Alpha Grade (Corridor Hub)";
    growthPotential = "Exceptional. High-density rezoning potential and immediate infrastructure corridors guarantee strong exit optionality.";
  } else if (isWeakCorridor || !inputs.clearTitleChecked) {
    grade = "C";
    gradeTitle = "Speculative Grade C (Risk Corridor)";
    growthPotential = "Unpredictable growth. Vulnerable to static demand, title friction, or severe lock-in risk.";
  }

  if (corridorStr === "metro") {
    gradeTitle = "Premium Alpha A+ (Metro Expansion Hub)";
  } else if (corridorStr === "highway") {
    gradeTitle = "Premium Alpha A- (Highway Growth Corridor)";
  } else if (corridorStr === "airport") {
    gradeTitle = "Premium Alpha A+ (Airport Logistics Belt)";
  } else if (corridorStr === "it") {
    gradeTitle = "Premium Alpha Grade A (IT Growth Cluster Hub)";
  } else if (corridorStr === "rural") {
    gradeTitle = "Speculative Grade C (Rural Slow-Growth Zone)";
  }

  // Liquidity Analysis
  let liquidityScore = 50;
  if (inputs.roadAccess) liquidityScore += 15;
  if (inputs.waterPowerGrid) liquidityScore += 10;
  if (inputs.metroHighwayPlanned) liquidityScore += 15;
  if (inputs.clearTitleChecked) liquidityScore += 10;
  if (inputs.liquidityTier === "high") liquidityScore += 10;
  if (inputs.liquidityTier === "low") liquidityScore -= 15;

  // Emotional goals adjustments
  if (inputs.landGoal === "flip") {
    liquidityScore -= 5;
  }

  if (inputs.floodZoneRisk) {
    liquidityScore -= 15;
  }
  if (inputs.agriConversionPending) {
    liquidityScore -= 10;
  }

  if (whatIfDelayInfra) {
    liquidityScore = Math.max(5, liquidityScore - 30);
  }

  let liquidityRating: "Liquid" | "Illiquid" | "Severe Holding Costs" = "Illiquid";
  if (liquidityScore > 75) {
    liquidityRating = "Liquid";
  } else if (liquidityScore < 35) {
    liquidityRating = "Severe Holding Costs";
  }

  // Warnings
  const warnings: string[] = [];
  if (!inputs.clearTitleChecked) warnings.push("Title search is unverified. Absolute core roadblock.");
  if (!inputs.roadAccess) warnings.push("No multi-lane road connectivity. Re-sale audience is heavily constrained.");
  if (isWeakCorridor) warnings.push("Localized demographic migration shows static or downward trend.");
  if (inputs.floodZoneRisk) warnings.push("Flood zone status is unknown or risky. Dangerous long-term buildability exposure.");
  if (inputs.agriConversionPending) warnings.push("Agricultural conversion status is pending clearance; holding timeline may double.");
  if (whatIfDelayInfra) warnings.push("Simulated 3-year local highway delay pushes real buyer exit down by several years.");

  if (warnings.length === 0) {
    warnings.push("No structural roadblocks detected. Maintain standard tax registry updates.");
  }

  // Verdict
  let verifiedStatus: "approved" | "conditional" | "withhold" = "conditional";
  let rationale = "Land is high yield but locks your cash completely. Safe under a holding constraint of 7+ years.";

  if (grade === "A" && liquidityScore > 65) {
    verifiedStatus = "approved";
    rationale = "Axora clinical check passed. This plot lies directly in the high-density migration corridor with crystal clear title integrity.";
  } else if (grade === "C") {
    verifiedStatus = "withhold";
    rationale = "High wealth extraction risk. Title insecurities or absolute infrastructure dark zones threaten to turn this asset sterile.";
  }

  // Emotional goal rationale mapping
  let goalRationale = "Monitor neighborhood infrastructure expansion actively.";
  if (inputs.landGoal === "legacy") {
    goalRationale = "Axora says: This land has long-term family wealth preservation potential.";
  } else if (inputs.landGoal === "flip") {
    goalRationale = "Axora says: Short-term appreciation catalysts exist, but timing risk is elevated.";
  } else if (inputs.landGoal === "home") {
    goalRationale = "Axora says: Emotional home site found. Building is achievable, but emphasize road connectivity and safety limits first.";
  } else if (inputs.landGoal === "appreciation") {
    goalRationale = "Axora says: Strong alignment with capital growth parameters. Positioning as an exceptional wealth compounding vessel.";
  } else if (inputs.landGoal === "commercial") {
    goalRationale = "Axora says: Dynamic retail or business development potential. Emphasizing high yield cap rate corridors.";
  } else if (inputs.landGoal === "retreat") {
    goalRationale = "Axora says: Peaceful escape site with zero daily upkeep fees, quietly compounding values beneath expanding city limits.";
  }

  // Risk appetite rationale mapping
  let riskRationale = "Balanced profile selected. Safety checkpoints match standard return lines.";
  if (inputs.riskAppetite === "safe") {
    riskRationale = "Conservatism prioritized. Axora restricts speculative assets. Emphasizing legal title safety and immediate infrastructure.";
  } else if (inputs.riskAppetite === "aggressive") {
    riskRationale = "Aggressive horizon. Emphasizes explosive growth corridors, ignoring short-term lock-in delays for maximum alpha.";
  }

  return {
    investmentGrade: grade,
    gradeTitle,
    growthPotential,
    liquidityScore,
    liquidityRating,
    appreciationScenarios: {
      cautious: Math.round(cautiousVal),
      expected: Math.round(expectedVal),
      aggressive: Math.round(aggressiveVal),
    },
    exitRisk: {
      level: liquidityScore > 70 ? "Low" : liquidityScore < 40 ? "High" : "Medium",
      warnings,
    },
    verifiedVerdict: {
      status: verifiedStatus,
      title: `Axora Investment Clearance: ${grade}`,
      rationale,
    },
    landGoal: inputs.landGoal,
    riskAppetite: inputs.riskAppetite,
    goalRationale,
    riskRationale,
    isCustomReport: true,
  };
}

/**
 * Commercial Property Intelligence
 */
export function computeCommercialReport(inputs: CommercialInputs): CommercialReport {
  const loanAmount = Math.max(0, inputs.purchasePrice - inputs.downPayment);
  const emi = calculateEMI(loanAmount, inputs.interestRate, inputs.tenureYears);

  const annualRentGross = inputs.annualRentIncome;
  const vacancyLoss = annualRentGross * (inputs.vacancyRate / 100);
  const netOperatingIncome = annualRentGross - vacancyLoss - inputs.annualMaintenance;

  const grossYield = inputs.purchasePrice > 0 ? (annualRentGross / inputs.purchasePrice) * 100 : 0;
  const netYield = inputs.purchasePrice > 0 ? (netOperatingIncome / inputs.purchasePrice) * 100 : 0;
  const capRate = netYield; // Simple caprate

  const monthlyNOI = netOperatingIncome / 12;
  const breathingRoom = monthlyNOI - emi;

  // Confidence
  let score = 50 + (netYield * 4); // higher yield is good
  if (breathingRoom < 0) score -= 25; // cash flow negative is penalty
  if (inputs.tenantProfile === "high") score += 15;
  if (inputs.tenantProfile === "speculative") score -= 15;

  score = Math.max(5, Math.min(100, score));

  let verifiedStatus: "approved" | "conditional" | "withhold" = "conditional";
  let rationale = "Commercial yields are healthy but vacancy risk requires a solid cash buffer.";
  if (score > 75) {
    verifiedStatus = "approved";
    rationale = "Excellent yield ratio with low tenant default indicators. Highly recommended for family structure or corporate holdings.";
  } else if (score < 40) {
    verifiedStatus = "withhold";
    rationale = "Unreasonable purchase price relative to current rental realities. Rent fails to service debt safely.";
  }

  return {
    cashConfidenceScore: Math.round(score),
    grossYield: Math.round(grossYield * 10) / 10,
    netYield: Math.round(netYield * 10) / 10,
    emi: Math.round(emi),
    breathingRoom: Math.round(breathingRoom),
    capRate: Math.round(capRate * 10) / 10,
    tenantRiskRating: inputs.tenantProfile === "high" ? "Low" : inputs.tenantProfile === "standard" ? "Moderate" : "Speculative",
    futureValue: Math.round(inputs.purchasePrice * 1.5), // conserv. future
    verifiedVerdict: {
      status: verifiedStatus,
      title: "Commercial Asset Grading Verdict",
      rationale,
    },
  };
}

/**
 * CFO Business Intelligence Engine
 */
export function computeBusinessReport(
  inputs: BusinessInputs,
  whatIfSalesDropPercent = 0,
  whatIfCOGSIncreasePercent = 0,
  whatIfClientLeavesPercent = 0,
  whatIfSalaryIncrease = 0
): BusinessReport {
  // Apply What-If parameters to baseline variables
  const adjustmentMultiplier = ((100 - whatIfSalesDropPercent) / 100) * ((100 - whatIfClientLeavesPercent) / 100);
  
  const revenue = inputs.monthlyRevenue * adjustmentMultiplier;
  const adjustedExpensesCOGS = inputs.cogs * (1 + whatIfCOGSIncreasePercent / 100);
  const adjustedExpensesOPEX = inputs.opex + whatIfSalaryIncrease;

  const grossProfit = revenue - adjustedExpensesCOGS;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const operatingProfit = grossProfit - adjustedExpensesOPEX;
  const operatingMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;

  // Cash Burn & Runway
  const totalMonthlyFriction = adjustedExpensesCOGS + adjustedExpensesOPEX + inputs.debtRepayments;
  const monthlyOperatingDeficit = totalMonthlyFriction - revenue;
  
  let runwayMonths = 99; // infinite as base
  if (monthlyOperatingDeficit > 0) {
    runwayMonths = inputs.cashBalance / monthlyOperatingDeficit;
    runwayMonths = Math.max(0, Math.round(runwayMonths * 10) / 10);
  }

  // Receivables risk
  const arToRevenueRatio = revenue > 0 ? inputs.receivables / revenue : 0;
  const arRisk: "Low" | "Medium" | "High" = arToRevenueRatio > 1.5 ? "High" : arToRevenueRatio > 0.8 ? "Medium" : "Low";

  // Layman Explainer Map
  const laymanExplainer = {
    cashReservesLabel: "Rainy-Day Fund in Bank Vault",
    cashReservesAnalogy: "This is the physical fuel sitting inside your business vault. Think of it as oxygen in an underwater tank. If you didn't receive a single dollar from anyone starting today, this is the total pool of spendable cache you have to survive on.",
    revenueLabel: "Bathtub Water Inflow Stream",
    revenueAnalogy: "The total stream of earnings entering your register before costs. Think of it as tap water pouring into a bathtub. If the water enters slowly but leaks out of the drain quickly, the tub empties immediately.",
    grossMarginLabel: "Raw Product Markup Power",
    grossMarginAnalogy: "This measures how much profit is baked directly into your core product or service before paying for salaries and office rent. For example, if you sell a burger for £10 and the ingredients cost £4, your markup power is 60%. High markup means you can survive and cover overhead easily.",
    runwayLabel: "Survival Countdown Clock",
    runwayAnalogy: "The exact number of months your business can stay alive on its current savings if your customers suddenly stopped paying. If this clock is under 6 months, every step requires strict caution.",
    unpaidIOUsLabel: "I.O.Us Floating in the Clouds",
    unpaidIOUsAnalogy: "Outstanding customer invoices. They look like 'revenue' on paper, but you can't buy groceries or pay wages with promises on a screen. You must grab these and pull them into your physical vault as fast as humanly possible."
  };

  // Owner Salary Viability Calculator
  const netMonthlyProfit = operatingProfit - inputs.debtRepayments;
  let salaryGrade: "Healthy" | "Concern" | "Dangerous" = "Healthy";
  let maxSafeDraw = 0;
  let salaryExplanation = "";
  let salaryActionSteps: string[] = [];

  if (runwayMonths < 4 && monthlyOperatingDeficit > 0) {
    salaryGrade = "Dangerous";
    maxSafeDraw = 0;
    salaryExplanation = "Currently, expenses are running slightly ahead of incoming sales, making things tight. Taking a salary draw right now can shorten your financial breathing room. Let's focus on securing more revenue first to create a safe buffer.";
    salaryActionSteps = [
      "Temporarily freeze your personal salary draw to $0 for the next 45 days.",
      "Redirect every leftover cent into your Rainy-Day vault to rebuild 3 months of survival buffer.",
      "Convert outstanding client IOUs into spendable cash immediately using pre-written reminder letters."
    ];
  } else if (netMonthlyProfit <= 1500) {
    salaryGrade = "Concern";
    maxSafeDraw = Math.max(0, Math.round(inputs.cashBalance * 0.05 + netMonthlyProfit * 0.3));
    salaryExplanation = "Your margin is currently in a light squeeze. Keeping dynamic controls on your personal draw for now will protect your bank balance and ensure any client shifts don't cause stress.";
    salaryActionSteps = [
      "Limit your monthly personal salary to a strict maximum of " + maxSafeDraw + ".",
      "Do not raise your personal draw until you successfully trim at least 10% of background operational overhead.",
      "Increase prices on speculative client tiers to widen your product markup power."
    ];
  } else {
    salaryGrade = "Healthy";
    maxSafeDraw = Math.round(netMonthlyProfit * 0.45 + (inputs.cashBalance * 0.02));
    salaryExplanation = "Excellent news! Your business is showing great underlying stability and is cash-flow positive. You can comfortably reward yourself with a premium founder draw while maintaining plenty of breathing room.";
    salaryActionSteps = [
      "A personal draw of up to " + maxSafeDraw + " per month is 100% safe and sustainable.",
      "Consider setting aside 15% of your leftover operating cash flows for automated wealth distributions.",
      "Ensure you keep at least 6 months of absolute operational overhead untouched in your reserve account."
    ];
  }

  const ownerSalaryAnalysis = {
    grade: salaryGrade,
    maxSafeDraw,
    explanation: salaryExplanation,
    actionSteps: salaryActionSteps,
  };

  // Tomorrow Morning Action Checklist (No-Nonsense Layman Tasks)
  const tomorrowMorningActionChecklist = [
    {
      id: "action-1",
      title: "Send Friendly Client Nudges",
      category: "Secure Incoming Cash",
      urgency: "Immediate" as const,
      laymanStep: "Go through your unpaid customer invoices. Spot anyone who hasn't paid their invoice and copy-paste the pre-written Gentle Reminder email template. Do not feel guilty—this is your earned cash."
    },
    {
      id: "action-2",
      title: "Request Supplier Payment Breathing Room",
      category: "Preserve Vault Cash",
      urgency: "High" as const,
      laymanStep: "Contact your primary supplier or tool platform. Ask them to push your payment term from 'immediate' to 30 days. This keeps money in your bank account longer, protecting you from sudden sales drops."
    },
    {
      id: "action-3",
      title: "Clean Out Ghost Software Triggers",
      category: "Plug Spending Leaks",
      urgency: "Strategic" as const,
      laymanStep: "Review your company card statement. Cancel any monthly SaaS software subscription, automated developer tool, or trial service that hasn't actively served you or made you money in the last 30 days."
    },
    {
      id: "action-4",
      title: "Separate the Emergency Reserve Vault",
      category: "Build Core Buffer",
      urgency: "High" as const,
      laymanStep: "Open a separate, zero-fee backup savings account. Move 25% of your cash balance there immediately. Treat this account as non-existent so you never spend it on daily payroll, using it only as a literal survival shield."
    }
  ];

  // Pre-written copy-paste letter templates tailored to their context
  const vipLettersToClients = [
    {
      scenario: "Your Clients Aren't Paying On Time",
      recipient: "Overdue Client / Customer Accounts Department",
      objective: "Get paid outstanding balances within 48 hours without burning the relationship.",
      subjectLine: "Fast update on invoice reconciliation",
      emailBody: "Hi [Client Name],\n\nI hope your week is off to a great start!\n\nJust a quick note that our system is closing out the month's accounting cycle today, and I noticed invoice #[Invoice-Number] is currently still outstanding.\n\nCould you do me a quick favor and check with your finance department to see if this payment can be prioritized code-green today? You can complete this instantly via card or bank transfer here: [Insert Link].\n\nReally appreciate your help closing this out so we can keep our full attention focused on delivering exceptional results for you!\n\nWarmly,\n[Your Name]"
    },
    {
      scenario: "Negotiating Time with Suppliers (When Cash is Squeezed)",
      recipient: "Primary Supplier, Vendor, or Platform Account Manager",
      objective: "Push due dates back by 15-30 days to protect your immediate bank balance.",
      subjectLine: "Partnership update / invoice terms adjustment",
      emailBody: "Hi [Supplier Name],\n\nWe have absolutely loved partnering with you guys over the past few years—your services are a crucial part of our operation.\n\nTo help streamline our internal accounts payable cycle for the remainder of this quarter, we are updating our standard vendor settlement schedule to Net-30 payment frames.\n\nCould you please apply this net-30 terms update to our active account starting with our next incoming invoice? Let me know if you need any updated company registration details to reflect this change.\n\nThank you for working with us as we optimize our corporate cash flows together!\n\nBest regards,\n[Your Name]"
    },
    {
      scenario: "Securing High-Urgency Cash from Favorite Customer",
      recipient: "Highly Satisfied Main Enterprise Client",
      objective: "Offer a small, attractive discount in exchange for direct upfront cash payment for the upcoming 3-6 months.",
      subjectLine: "Strategic Client Appreciation Offer",
      emailBody: "Hi [Client Name],\n\nWe extremely value having you as a VIP client partners, and we're looking at mapping out our design goals and resource commitments for the upcoming six months.\n\nTo lock in your priority queue status and ensure our senior staff is 100% dedicated to your roadmap, we're testing a special pilot program this week: if you elect to pre-pay your upcoming 3-month cycle in advance, we will reward you with a flat 12% loyalty discount off the total package.\n\nThis locks in your pricing tier and helps our team allocate key assets directly to your goals immediately.\n\nLet me know if you would like me to adjust your next invoice to reflect this upfront loyalty rate!\n\nWarmly,\n[Your Name]"
    }
  ];

  // Pressure points
  const pressurePoints: string[] = [];
  if (runwayMonths < 6 && monthlyOperatingDeficit > 0) {
    pressurePoints.push(`🚨 Critical Survival Squeeze: Your daily costs are bigger than what you make. Your savings will disappear completely in ${runwayMonths} months if we don't act now.`);
  }
  if (grossMargin < 35) {
    pressurePoints.push(`⚠️ Weak Markup Power: You only keep ${Math.round(grossMargin)}% of your sales after raw material or direct software delivery cost. This leaves almost no room to cover employee salaries, phone bills, or website fees.`);
  }
  if (inputs.payables > inputs.cashBalance) {
    pressurePoints.push("⚠️ Instant Debt Overload: The bills on your desk right now are larger than all the liquid cash sitting in your bank. If everyone demanded payment tonight, your business would collapse.");
  }
  if (arRisk === "High") {
    pressurePoints.push("⚠️ 'Paper-Only' Revenue Trap: Your clients owe you massive sums, and these unpaid promises are piling up. You look wealthy on paper, but your physical register is empty.");
  }
  if (inputs.debtRepayments / (revenue + 0.1) > 0.2) {
    pressurePoints.push("⚠️ Heavy Loan Burden: Monthly bank debts or owner loans eat up a critical percentage of your sales. It feels like you're running on a treadmill just to service the bank.");
  }

  if (pressurePoints.length === 0) {
    pressurePoints.push("✅ All major safety channels clear! Your product margins look healthy, your rainy-day cash reserves are thick, and clients are paying invoices on time.");
  }

  // CFO confidence score
  let score = 100;
  if (operatingMargin < 12) score -= 20;
  else if (operatingMargin > 25) score += 5;

  if (runwayMonths < 3) score -= 35;
  else if (runwayMonths < 6) score -= 20;
  else if (runwayMonths >= 12) score += 10;

  if (arRisk === "High") score -= 15;
  if (inputs.payables > inputs.cashBalance) score -= 15;

  score = Math.max(5, Math.min(100, score));

  // 6 month cash projection
  const cashflowForecast = [];
  let currentSimCash = inputs.cashBalance;
  for (let i = 1; i <= 6; i++) {
    const netChange = operatingProfit - inputs.debtRepayments;
    currentSimCash = Math.max(0, currentSimCash + netChange);
    cashflowForecast.push({
      month: `Month +${i}`,
      projectedCash: Math.round(currentSimCash),
      monthlyProfit: Math.round(operatingProfit - inputs.debtRepayments),
    });
  }

  // CFO Action points in HUMAN language
  let priorityAction = "Accelerate cash collections from clients immediately to replenish the core safety vaults.";
  const tactics = [
    "Send the 'Gentle Reminder' template letter today to every client holding an unpaid invoice past 7 days.",
    "Ask key suppliers to update your accounts to net-30 terms so you hold onto cash longer.",
    "Cancel unused tech subscriptions, server trials, and non-performing marketing campaigns tonight."
  ];
  const warnings = [
    "Do not hire anyone, purchase expensive machines, or sign raw contracts until your rainy day vaults have 6 full months of backup cash.",
    "Rethink low-margin client contracts that drain massive employee support hours."
  ];

  if (score > 75) {
    priorityAction = "Safeguard and deploy surplus savings securely to compound your corporate wealth.";
    tactics[0] = "Keep at least 70% of cash reserves untouched in a premium, high-yield business savings account.";
    tactics[2] = "Consider introducing a performance bonus incentive to your rockstar team members to lock in long-term loyalty.";
  }

  // Executive verdict (completely human and supportive)
  let statusColor: "green" | "amber" | "red" = "green";
  let verdictTitle = "Your business currently looks financially healthy.";
  let rationale = "Your business currently has healthy profit margins and a strong cash buffer. At the current pace, your business looks financially stable and safe. Continue operating carefully while protecting this breathing room.";

  if (score < 40) {
    statusColor = "red";
    verdictTitle = "We detect heavy cash flow pressure";
    rationale = "Expenses are currently running slightly ahead of incoming sales, and your cash backup is small. We recommend taking a gentle step back: pause any extra spending, watch personal drawings, and collect on unpaid invoices to keep your balance comfortable and secure.";
  } else if (score < 70) {
    statusColor = "amber";
    verdictTitle = "Your business is in a transition zone";
    rationale = "While your day-to-day sales look steady, a surprise invoice or temporary dip could place tight friction on your reserve. Let's focus on securing collections and protecting your cash runway over the next 90 days to keep things comfortable.";
  }

  return {
    cashConfidenceScore: Math.round(score),
    revenue: Math.round(revenue),
    grossProfit: Math.round(grossProfit),
    grossMargin: Math.round(grossMargin * 10) / 10,
    operatingProfit: Math.round(operatingProfit),
    operatingMargin: Math.round(operatingMargin * 10) / 10,
    runwayMonths,
    accountsReceivableTurnoverRisk: arRisk,
    pressurePoints,
    cashflowForecast,
    strategicCFOAdvice: {
      priorityAction,
      warnings,
      tactics,
    },
    executiveVerdict: {
      status: statusColor,
      title: verdictTitle,
      rationale,
    },
    laymanExplainer,
    ownerSalaryAnalysis,
    tomorrowMorningActionChecklist,
    vipLettersToClients,
  };
}
