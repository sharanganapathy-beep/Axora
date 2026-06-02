import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

/**
 * Retrieves the client-side GoogleGenAI instance.
 * It reads VITE_GEMINI_API_KEY (or GEMINI_API_KEY) from the Vite environment.
 */
export function getAIClient() {
  if (aiInstance) return aiInstance;

  const meta = import.meta as any;
  const apiKey = (meta.env?.VITE_GEMINI_API_KEY || meta.env?.GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error(
      "Strategic Access Restrained. Ensure VITE_GEMINI_API_KEY is registered in your Vercel Environment Variables and redeployed."
    );
  }

  aiInstance = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  return aiInstance;
}

/**
 * CFO Chatbot client-side generator.
 */
export async function generateCfoChat(message: string, history: any[], context: any) {
  const client = getAIClient();

  const businessContextPrompt = `
You are an elite, highly-experienced Fractional Chief Financial Officer (CFO) and business survival strategist.
You are talking to a business owner who uses the Axora Premium CFO Suite.
Here are the owner's actual financial metrics for their company:
- Monthly Revenue: $${context.monthlyRevenue}
- Cost of Goods Sold (COGS): $${context.cogs}
- Operating Expenses (OPEX): $${context.opex}
- Physical Cash in Bank: $${context.cashBalance}
- Unpaid Invoices / Accounts Receivable: $${context.receivables}
- Outstanding Bills / Accounts Payable: $${context.payables}
- Monthly Loan/Debt Repayments: $${context.debtRepayments}
- Industry/Business Sector: ${context.businessSector}

Use these precise metrics in your answers. Always use realistic, numbers-based math instead of generic "consultant fluff". 
Be professional, analytical, direct, supportive, and action-oriented. Keep the tone human with absolute plain-English explanations.

Structure your responses using Markdown. Bold key metrics or actions. Add bulleted list step recommendations.
If they ask a "What-If" question (e.g. "Should I rent an office for $3,000?" or "What if I hire an engineer for $5,000?"), run the numbers:
1. Compute the new monthly profit/deficit.
2. Note how it shortens or lengthens their survival countdown runway.
3. Give an approved, caution, or withhold executive recommendation.
`;

  // Format history to match content parts
  const contents = [];
  for (const h of history) {
    contents.push({
      role: h.role === "assistant" || h.role === "model" ? "model" : "user",
      parts: [{ text: h.text }],
    });
  }
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: contents,
    config: {
      systemInstruction: businessContextPrompt,
      temperature: 0.7,
    },
  });

  return response.text || "";
}

/**
 * Email/Letter Negotiator Generator.
 */
export async function generateCfoEmail(
  scenario: string,
  recipient: string,
  objective: string,
  tone: string,
  context: any,
  extraContext: string = ""
) {
  const client = getAIClient();

  const prompt = `
Generate a highly persuasive, premium and professional business email/letter.
The user is a business manager with these stats:
- Company Sector: ${context.businessSector}
- Monthly Revenue: $${context.monthlyRevenue}
- Cash Balance: $${context.cashBalance}
- Receivables: $${context.receivables}
- Payables: $${context.payables}

Here is the situation:
- Scenario: ${scenario}
- Target Recipient: ${recipient}
- Core Objective: ${objective}
- Required Professional Tone: ${tone} (e.g. "Gentle Reminder", "Direct Executive", "Firm & Legal", "Aesthetic Partner Proposal")
- Extra situation context: ${extraContext}

Your goal is to optimize cash flow immediately without completely burning long-term business partnerships. Ensure the letter is structured beautifully with clear headers and has placeholder values like [Client-Name], [Invoice-Date], [Invoice-Number] where necessary. Always provide a Subject line and Email Body text.
Return the output in clean JSON format matching this schema:
{
  "subject": "The email subject line",
  "body": "The email body, using clean line breaks \\n, formatted beautifully and professionally."
}
`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT" as any,
        properties: {
          subject: { type: "STRING" as any },
          body: { type: "STRING" as any },
        },
        required: ["subject", "body"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

/**
 * Strategic Audit Memo Generator.
 */
export async function generateCfoStrategicAudit(context: any) {
  const client = getAIClient();

  const prompt = `
Run a highly sophisticated, multi-angle financial health audit of this small-to-medium enterprise (SME).
Metrics:
- Sector: ${context.businessSector}
- Monthly Sales: $${context.monthlyRevenue}
- Cost of Goods Sold (COGS): $${context.cogs}
- Operating Expenses (OPEX): $${context.opex}
- Bank Cash Balance: $${context.cashBalance}
- Receivables (Outstanding Clients Owed): $${context.receivables}
- Payables (Outstanding Bills To Pay): $${context.payables}
- Monthly Bank Debt/Loans Repayments: $${context.debtRepayments}

Please generate an elite "FRACTIONAL CFO EXECUTIVE STRATEGIC BRIEFING" memo.
Keep the layout beautiful and split into clear sections:
1. **Executive Scorecard Diagnosis**: Grade the general capital structure out of 100 based on their actual numbers.
2. **Hidden Growth Squeeze Vectors**: Point out where cash is leaking invisibly (e.g., poor gross margins, bloated OPEX, heavy debt burden, high receivable threat, etc.).
3. **Sector Competitive Benchmark**: Benchmark their financial ratios against top performers in the "${context.businessSector}" industry. Be detailed!
4. **Immediate 30-Day Cash-Infusing Action Protocol**: Provide 3-4 specific operational commands that will let them instantly unlock $5,000 - $25,000 of locked business liquidity over the next few weeks (such as invoice financing, net-terms negotiation, dynamic pre-payments, pricing models change).

Use high-quality business terminology, but write with absolute clarity. Be blunt, direct, and supportive. Use Markdown.
`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      temperature: 0.8,
    },
  });

  return response.text || "";
}

/**
 * Property Advisor Chat client-side helper.
 */
export async function generatePropertyChat(
  message: string,
  history: any[],
  context: any,
  subType: string
) {
  const client = getAIClient();

  let detailsPrompt = "";
  if (subType === "residential") {
    detailsPrompt = `
- Purchase Price: $${context.purchasePrice}
- Down Payment: $${context.downPayment}
- Interest Rate: ${context.interestRate}%
- Loan Tenure: ${context.tenureYears} years
- Monthly Personal Income: $${context.monthlyIncome}
- Existing Personal Debts: $${context.existingDebts}
- Monthly Maintenance / HOA Cost: $${context.monthlyMaintenance}
- Estimated Annual Appreciation Rate: ${context.estimatedAppreciation}%
    `;
  } else if (subType === "land") {
    detailsPrompt = `
- Purchase Price: $${context.purchasePrice}
- Stamp Duties & Taxes/Fees: $${context.taxesFees}
- Projected Holding Tenure: ${context.holdingPeriodYears} years
- Projected Annual Appreciation: ${context.projectedAnnualGrowth}%
- Regional Corridor Class: ${context.growthCorridor}
- Road Access: ${context.roadAccess ? "Yes" : "No"}
- Water & Power Infrastructure Available: ${context.waterPowerGrid ? "Yes" : "No"}
- Planned Strategic Highways/Metro: ${context.metroHighwayPlanned ? "Yes" : "No"}
- Clear Legal Title Checked: ${context.clearTitleChecked ? "Yes" : "No"}
- Liquidity class: ${context.liquidityTier}
    `;
  } else if (subType === "commercial") {
    detailsPrompt = `
- Purchase Price: $${context.purchasePrice}
- Down Payment: $${context.downPayment}
- Interest Rate: ${context.interestRate}%
- Loan Tenure: ${context.tenureYears} years
- Annual Rent Income: $${context.annualRentIncome}
- Vacancy Rate Buffer: ${context.vacancyRate}%
- Annual Outgoings & Maintenance: $${context.annualMaintenance}
- Target Tenant Profile Style: ${context.tenantProfile}
    `;
  }

  const propertyContextPrompt = `
You are an expert, world-class Wealth Advisor, Real Estate Contract Analyst, and Property Investment strategist.
You are talking to an investor using the Axora Premium Property Analytics Suite.
The asset type of this decision group is "${subType ? subType.toUpperCase() : "RESIDENTIAL"}".
Here are the user's specific asset dimensions:
${detailsPrompt}

Use these precise metrics in your answers. Always use realistic, numbers-based real estate finance formulas (e.g. debt-to-income ratios, cap yields, Net operating incomes, holding costs, net cashflows, leverage ratios) instead of generic advice.
Be highly professional, legally prudent, strategic, and direct. Explain things perfectly in plain English.

Structure your responses using Markdown. Bold key metrics, metrics risks, or actions. Add list-item step recommendations.
If they ask a "What-If" question, run the math calculations:
1. Compute the new monthly carrying costs vs. net profits.
2. Note how it increases or decreases their cash shield or holding buffer.
3. Suggest a clear Approved, Caution, or Withhold tactical recommendation.
`;

  const contents = [];
  for (const h of history) {
    contents.push({
      role: h.role === "assistant" || h.role === "model" ? "model" : "user",
      parts: [{ text: h.text }],
    });
  }
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: contents,
    config: {
      systemInstruction: propertyContextPrompt,
      temperature: 0.7,
    },
  });

  return response.text || "";
}

/**
 * Property Letter Copilot client-side generator.
 */
export async function generatePropertyLetter(
  scenario: string,
  recipient: string,
  objective: string,
  tone: string,
  context: any,
  subType: string,
  extraContext: string = ""
) {
  const client = getAIClient();

  const prompt = `
Generate a highly strategic, legally prudent, and professional real estate related letter, formal communication, or notice.
The user is a property buyer, owner, or tenant with subtype "${subType ? subType.toUpperCase() : "RESIDENTIAL"}".
Here is the situation:
- Objective Category: ${scenario}
- Recipient Class: ${recipient}
- Core Resolution/Objective Wanted: ${objective}
- Required Professional Tone: ${tone} (e.g. "Firm Legal Safeguard", "Collaborative Negotiation Offer", "Urgent Rectification Notice", "Polite Extension Inquiry")
- Extra situation context parameters: ${extraContext}
- Asset Cost/Price parameter: $${context.purchasePrice || 0}

Ensure the letter structure is top-tier: clean subject line, formal greeting, clear legal-contractual contingencies if relevant (e.g. subject to structural inspection, title sanitization, financing clauses, appraisal caps), logical win-win business rationale to secure agreement, and formal legal sign-off. Use placeholders like [Recipient-Name], [Property-Address], [Offer-Expiration-Date] where appropriate.
Return the output in clean JSON format matching this schema:
{
  "subject": "The letter subject line",
  "body": "The letter body, using clean line breaks \\n, formatted beautifully and professionally."
}
`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT" as any,
        properties: {
          subject: { type: "STRING" as any },
          body: { type: "STRING" as any },
        },
        required: ["subject", "body"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

/**
 * Property Strategic Memo client-side generator.
 */
export async function generatePropertyMemo(context: any, subType: string) {
  const client = getAIClient();

  let detailsPrompt = "";
  if (subType === "residential") {
    detailsPrompt = `
- Purchase Price: $${context.purchasePrice}
- Down Payment: $${context.downPayment}
- Interest Rate: ${context.interestRate}%
- Loan Tenure: ${context.tenureYears} years
- Monthly Personal Income: $${context.monthlyIncome}
- Existing Personal Debts: $${context.existingDebts}
- Monthly Maintenance: $${context.monthlyMaintenance}
- Expected Appreciation: ${context.estimatedAppreciation}%
    `;
  } else if (subType === "land") {
    detailsPrompt = `
- Purchase Price: $${context.purchasePrice}
- Stamp Duties & Taxes/Fees: $${context.taxesFees}
- Holding tenure: ${context.holdingPeriodYears} years
- Projected Annual appreciation: ${context.projectedAnnualGrowth}%
- Regional Corridor Class: ${context.growthCorridor}
- Road Access: ${context.roadAccess ? "Yes" : "No"}
- Water & Power Infrastructure Available: ${context.waterPowerGrid ? "Yes" : "No"}
- Planned Strategic Highways/Metro: ${context.metroHighwayPlanned ? "Yes" : "No"}
- Clear Legal Title Checked: ${context.clearTitleChecked ? "Yes" : "No"}
- Liquidity class: ${context.liquidityTier}
    `;
  } else if (subType === "commercial") {
    detailsPrompt = `
- Purchase Price: $${context.purchasePrice}
- Down Payment: $${context.downPayment}
- Interest Rate: ${context.interestRate}%
- Loan Tenure: ${context.tenureYears} years
- Annual Rent Income: $${context.annualRentIncome}
- Vacancy Rate Buffer: ${context.vacancyRate}%
- Annual Outgoings & Maintenance: $${context.annualMaintenance}
- Target Tenant Profile Style: ${context.tenantProfile}
    `;
  }

  const prompt = `
Run a highly sophisticated, multi-angle financial risk and potential yield analysis of this "${subType ? subType.toUpperCase() : "RESIDENTIAL"}" physical property investment option.
Asset Dimensions:
${detailsPrompt}

Please generate an elite "AXORA PREMIUM WEALTH STRATEGY GROUP METRIC EXECUTIVE BRIEFING" memo.
Keep the layout beautiful and split into clear sections:
1. **Investment Suitability Grade & Diagnostic**: Rate the general feasibility, safety profile, and capital efficiency allocation out of 100 based on their actual numbers.
2. **Hidden Squeeze and Liability Hazards**: Point out where cash flows or holding costs might leak or shock their personal or corporate ledger (e.g., mortgage interest rate cycles, localized developer default, municipal zone adjustments, high tenant turnover overheads, land taxation, clear title preservation risk, etc.).
3. **Macro Economic Stress Test Scenario**: Run a rigorous, blunt evaluation of what happens if local inflation spikes or local lending rates rise by 2.0% within the next 24 months, or if a severe 12-month vacancy block occurs.
4. **Immediate Equity & Yield Optimization Protocol (Action Steps)**: Suggest 3-4 specific financial and legal actions to optimize safe leverage, buy down interest rate margins, negotiate buyer protections (like conditional options, inspection clauses), or structure tenant triple-net covenants to insulate cash reserves.

Use top-tier wealth advisory and financial terminology, but write with absolute clarity. Be blunt, direct, and supportive. Use Markdown.
`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      temperature: 0.8,
    },
  });

  return response.text || "";
}
