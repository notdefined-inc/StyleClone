import { GoogleGenAI, Type } from "@google/genai";
import { WritingSample, StyleProfile, ComparisonResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeWritingStyle = async (samples: WritingSample[], autoProofread: boolean): Promise<StyleProfile> => {
  const combinedText = samples.map(s => `CONTEXT: ${s.prompt}\nSAMPLE: ${s.text}`).join('\n\n---\n\n');

  // Dynamically adjust the prompt based on user preference
  const proofreadInstruction = autoProofread
    ? "IMPORTANT: The user wants their style polished. You MUST explicitly instruct the AI to fix all grammar, spelling, and punctuation errors while maintaining the user's sentence structure, vocabulary choice, and tone. The final output should be a professional/clean version of their natural voice."
    : "IMPORTANT: The user wants to mimic their writing EXACTLY. If the samples have typos, run-on sentences, or specific casing quirks (e.g. all lowercase), the system instruction MUST instruct the AI to replicate these 'flaws' to maintain authenticity.";

  const prompt = `
    You are an expert linguist and literary analyst. 
    Analyze the following writing samples to construct a highly detailed 'Style Persona' or 'System Instruction'.
    
    Your goal is to create a prompt that, when fed to another AI, will force it to write like this user.

    ${proofreadInstruction}
    
    Focus on:
    1. Sentence structure (length, complexity, rhythm).
    2. Vocabulary (simple vs complex, jargon, emotional words).
    3. Tone (formal, casual, witty, sarcastic, empathetic).
    4. formatting quirks (usage of lists, bolding, emojis, capitalization).
    5. rhetorical devices used.
    
    Output JSON with:
    - name: A creative name for this style (e.g., "The Witty Professional", "Casual Techie").
    - summary: A short description of the style.
    - systemInstruction: The exact prompt/instruction block that can be pasted into an AI to mimic this style. It should be written in the second person addressed to the AI (e.g., "You are a helpful assistant who writes with...").
    - traits: An array of 3-5 key adjectives describing the style.
  `;

  // Using Thinking Mode for deep analysis
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `SAMPLES TO ANALYZE:\n${combinedText}\n\n${prompt}`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          summary: { type: Type.STRING },
          systemInstruction: { type: Type.STRING },
          traits: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['name', 'summary', 'systemInstruction', 'traits']
      }
    }
  });

  const text = response.text || "{}";
  try {
    return JSON.parse(text) as StyleProfile;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Could not analyze style.");
  }
};

export const refineSystemInstruction = async (currentInstruction: string, refinementRequest: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      You are an expert prompt engineer.
      
      CURRENT SYSTEM INSTRUCTION (defining a specific writing style):
      "${currentInstruction}"

      USER REFINEMENT REQUEST:
      "${refinementRequest}"

      TASK:
      Rewrite the system instruction to incorporate the user's refinement request WITHOUT losing the unique core identity of the original style.
      
      Examples:
      - Request: "Fix typos" -> Instruction update: "Maintain the casual sentence structure but ensure all spelling and grammar is correct."
      - Request: "Make it for a novel" -> Instruction update: "Apply this voice to narrative descriptions and dialogue, focusing on immersion."
      - Request: "Make it professional" -> Instruction update: "Keep the concise sentence structure but remove slang and emojis."

      Output ONLY the new raw system instruction text. Do not include markdown formatting or explanations.
    `,
  });
  return response.text || currentInstruction;
};

export const rewriteTextInStyle = async (text: string, styleInstruction: string): Promise<string> => {
  // Using Flash for faster turn-around on the rewrite test
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Original Text: "${text}"\n\nRewrite the above text strictly adhering to the following style guide:\n${styleInstruction}`,
  });
  return response.text || "";
};

// Feature: Use Search Grounding to compare style to famous authors
export const compareToFamousAuthors = async (styleSummary: string): Promise<ComparisonResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find a famous author or public figure whose writing style matches this description: "${styleSummary}". 
    Use Google Search to verify their writing characteristics. 
    Return the name, similarity score (High/Medium/Low), and a brief explanation of why.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          author: { type: Type.STRING },
          similarity: { type: Type.STRING },
          details: { type: Type.STRING }
        }
      }
    }
  });

  const text = response.text || "{}";
  try {
    return JSON.parse(text) as ComparisonResult;
  } catch (e) {
    // Fallback if search fails or parsing fails
    return {
      author: "Unknown",
      similarity: "N/A",
      details: "Could not perform comparison."
    };
  }
};
