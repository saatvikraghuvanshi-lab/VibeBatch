/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Trait } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateIdentityTitle(traits: Trait[]): Promise<string> {
  const topTraits = [...traits]
    .sort((a, b) => b.votes - a.votes)
    .filter(t => t.votes > 0)
    .slice(0, 3)
    .map(t => t.name)
    .join(", ");

  if (!topTraits) return "The Emerging Soul";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Based on these personality traits: ${topTraits}, generate a 2-3 word poetic, punchy "Identity Title" that sounds like a mysterious archetype or legendary character. 
    Examples: "The Magnetic Storyteller", "Silent Architect", "Radiant Visionary", "The Witty Vanguard". 
    Only return the title string, no quotes or extra text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().replace(/^["']|["']$/g, '');
    
    return text || "The Magnetic Storyteller";
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "The Magnetic Storyteller"; // Fallback
  }
}
