/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DecisionType = "property" | "business";

export type PropertySubType = "residential" | "land" | "commercial";

export interface ResidentialInputs {
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  tenureYears: number;
  monthlyIncome: number;
  existingDebts: number;
  monthlyMaintenance: number;
  estimatedAppreciation: number; // e.g. 5%
}

export interface LandInputs {
  purchasePrice: number;
  taxesFees: number;
  holdingPeriodYears: number;
  projectedAnnualGrowth: number;
  growthCorridor: "danger" | "moderate" | "strong" | "metro" | "highway" | "airport" | "it" | "rural";
  roadAccess: boolean;
  waterPowerGrid: boolean;
  metroHighwayPlanned: boolean;
  clearTitleChecked: boolean;
  liquidityTier: "high" | "medium" | "low";
  floodZoneRisk?: boolean;
  agriConversionPending?: boolean;
  landGoal?: "home" | "appreciation" | "commercial" | "retreat" | "flip" | "legacy";
  riskAppetite?: "safe" | "balanced" | "aggressive";
}

export interface CommercialInputs {
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  tenureYears: number;
  annualRentIncome: number;
  vacancyRate: number;
  annualMaintenance: number;
  tenantProfile: "high" | "standard" | "speculative";
}

export interface BusinessInputs {
  monthlyRevenue: number;
  cogs: number;
  opex: number;
  cashBalance: number;
  receivables: number;
  payables: number;
  debtRepayments: number;
  businessSector: string;
}

// Result types
export interface ResidentialReport {
  cashConfidenceScore: number;
  emi: number;
  debtToIncomeRatio: number;
  breathingRoom: number;
  humanSafetyReport: {
    status: "safe" | "caution" | "danger";
    title: string;
    description: string;
    lifestyleImpact: string;
  };
  futureValueScenarios: {
    years5: number;
    years10: number;
    years20: number;
  };
  rentalStrength: {
    score: number;
    rating: "Weak" | "Moderate" | "Exceptional";
    description: string;
  };
  negotiationScript: {
    recommendedOffer: number;
    openingLine: string;
    leveragePoints: string[];
  };
  verifiedVerdict: {
    status: "approved" | "conditional" | "withhold";
    title: string;
    rationale: string;
  };
}

export interface LandReport {
  investmentGrade: "A" | "B" | "C";
  gradeTitle: string;
  growthPotential: string;
  liquidityScore: number;
  liquidityRating: "Liquid" | "Illiquid" | "Severe Holding Costs";
  appreciationScenarios: {
    cautious: number;
    expected: number;
    aggressive: number;
  };
  exitRisk: {
    level: "Low" | "Medium" | "High";
    warnings: string[];
  };
  verifiedVerdict: {
    status: "approved" | "conditional" | "withhold";
    title: string;
    rationale: string;
  };
  landGoal?: "home" | "appreciation" | "commercial" | "retreat" | "flip" | "legacy";
  riskAppetite?: "safe" | "balanced" | "aggressive";
  goalRationale?: string;
  riskRationale?: string;
  isCustomReport?: boolean;
}

export interface CommercialReport {
  cashConfidenceScore: number;
  grossYield: number;
  netYield: number;
  emi: number;
  breathingRoom: number;
  capRate: number;
  tenantRiskRating: "Low" | "Moderate" | "Speculative";
  futureValue: number;
  verifiedVerdict: {
    status: "approved" | "conditional" | "withhold";
    title: string;
    rationale: string;
  };
}

export interface BusinessReport {
  cashConfidenceScore: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
  operatingProfit: number;
  operatingMargin: number;
  runwayMonths: number;
  accountsReceivableTurnoverRisk: "Low" | "Medium" | "High";
  pressurePoints: string[];
  cashflowForecast: {
    month: string;
    projectedCash: number;
    monthlyProfit: number;
  }[];
  strategicCFOAdvice: {
    priorityAction: string;
    warnings: string[];
    tactics: string[];
  };
  executiveVerdict: {
    status: "green" | "amber" | "red";
    title: string;
    rationale: string;
  };
  laymanExplainer?: {
    cashReservesLabel: string;
    cashReservesAnalogy: string;
    revenueLabel: string;
    revenueAnalogy: string;
    grossMarginLabel: string;
    grossMarginAnalogy: string;
    runwayLabel: string;
    runwayAnalogy: string;
    unpaidIOUsLabel: string;
    unpaidIOUsAnalogy: string;
  };
  ownerSalaryAnalysis?: {
    grade: "Healthy" | "Concern" | "Dangerous";
    maxSafeDraw: number;
    explanation: string;
    actionSteps: string[];
  };
  tomorrowMorningActionChecklist?: {
    id: string;
    title: string;
    category: string;
    urgency: "Immediate" | "High" | "Strategic";
    laymanStep: string;
  }[];
  vipLettersToClients?: {
    scenario: string;
    recipient: string;
    objective: string;
    subjectLine: string;
    emailBody: string;
  }[];
}
