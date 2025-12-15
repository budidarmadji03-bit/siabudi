import { GoogleGenAI, Type } from "@google/genai";
import { FormData, AnalysisResult, ClaimStatus } from "../types";
import { FICS_SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini with the API Key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeClaim = async (data: FormData): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY in your environment.");
  }

  // Define the expected JSON schema for the output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      diagnosis: {
        type: Type.OBJECT,
        properties: {
          riskAnalysis: { type: Type.STRING, description: "Analysis of financial risk (Delayed Revenue/Uncollectible)" },
          correctiveActions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of specific corrective steps based on SPI" 
          },
          responsibleUnit: { type: Type.STRING, description: "Unit responsible (e.g., Casemix, Finance, Admisi)" }
        },
        required: ["riskAnalysis", "correctiveActions", "responsibleUnit"]
      },
      journalEntries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            debit: { type: Type.STRING },
            credit: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ["debit", "credit", "amount", "description"]
        },
        description: "The primary accrual journal entries."
      },
      uncollectibleEntry: {
        type: Type.OBJECT,
        properties: {
            debit: { type: Type.STRING },
            credit: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING }
        },
        description: "Optional entry for allowance for doubtful accounts if status is Denied/Gagal Bayar",
        nullable: true
      },
      financialImpact: {
        type: Type.OBJECT,
        properties: {
          balanceSheet: { type: Type.ARRAY, items: { type: Type.STRING } },
          operationalReport: { type: Type.ARRAY, items: { type: Type.STRING } },
          note: { type: Type.STRING }
        },
        required: ["balanceSheet", "operationalReport", "note"]
      }
    },
    required: ["diagnosis", "journalEntries", "financialImpact"]
  };

  const prompt = `
    Analyze the following Hospital Claim Transaction:
    
    Transaction ID: ${data.transactionId}
    Total Amount: IDR ${data.amount}
    Status: ${data.status}
    Issue Category: ${data.status === ClaimStatus.APPROVED ? 'N/A' : data.issueCategory}
    Deadline/Aging: ${data.deadlineDays} days

    Perform the FICS Analysis generating 3 cards of data:
    1. SPI Diagnosis & Recommendation.
    2. Accrual Basis Journal Entry Simulation (PSAP 13).
    3. Financial Statement Impact (Neraca & LO).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using the requested advanced model for reasoning
      contents: prompt,
      config: {
        systemInstruction: FICS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for factual/analytical output
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};