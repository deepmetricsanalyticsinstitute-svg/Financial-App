import { GoogleGenAI } from "@google/genai";
import { AllocationResult } from "../types";

const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateFinancialInsight = async (
  allocation: AllocationResult,
  totalPrincipal: number
): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) return "API Key not configured. Unable to generate insights.";

  const prompt = `
    Act as a financial loan officer for a retention fund. 
    Analyze the following repayment scenario based on our strict rule: Interest is always paid first before Principal.

    Loan Context:
    - Total Original Principal: $${totalPrincipal.toFixed(2)}
    - Expected Monthly Interest Quota: $${allocation.expectedMonthlyInterest.toFixed(2)}

    Current Payment Event:
    - Reimbursement Amount: $${allocation.paymentAmount.toFixed(2)}
    - Calculated Interest Component: $${allocation.allocatedInterest.toFixed(2)}
    - Calculated Principal Component: $${allocation.allocatedPrincipal.toFixed(2)}

    Please provide a brief, professional 2-3 sentence explanation of how this payment was split and why. 
    If there was a shortfall (Payment < Expected Interest), clearly explain that the principal balance remains untouched.
    Do not use markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insight at this time.";
  }
};
