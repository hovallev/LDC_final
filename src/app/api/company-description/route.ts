// src/app/api/company-description/route.ts

import { NextResponse } from 'next/server'
// Import Google Generative AI
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Check for Google API Key
if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set');
}

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const modelId = "gemini-2.5-flash-preview-04-17"; // Use the specified model ID
const model = genAI.getGenerativeModel({ model: modelId });

// Cached description to avoid generating it on every request
let cachedDescription: string | null = null

export async function GET() {
  try {
    // Return cached description if available
    if (cachedDescription) {
      console.log("Returning cached company description.");
      return NextResponse.json({ description: cachedDescription })
    }

    console.log("Generating new company description with Gemini...");

    // Define the prompt for Gemini
    const prompt = "Provide a brief description of Banco BICE, a Chilean bank. The description should be 2-3 sentences long and highlight the bank's focus and main services.";

    // Define safety settings (adjust as needed)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // Generate description using Gemini
    const result = await model.generateContent(
      prompt,
      // Uncomment and adjust generationConfig if needed
      /* {
        safetySettings,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150, // Adjust token limit if needed
        },
      } */
    );

    const response = result.response;
    const generatedText = response.text();

    console.log("Gemini Raw Response:", JSON.stringify(response, null, 2)); // Log raw response

    const description = generatedText ||
      "Banco BICE is a Chilean financial institution offering a wide range of banking services for individuals and businesses. Founded in 1979, it specializes in investment banking, asset management, and corporate finance solutions."; // Fallback

    // Cache the description
    cachedDescription = description;
    console.log("Successfully generated and cached description:", description);

    return NextResponse.json({ description })
  } catch (error: any) {
    console.error('Error generating company description with Gemini:', error);
    
    // Log specific Gemini errors if available
    if (error.response) {
      console.error("Gemini Error Details:", JSON.stringify(error.response, null, 2));
    }

    // Return a fallback description to prevent UI issues
    const fallbackDescription = "Banco BICE is a Chilean financial institution offering a wide range of banking services for individuals and businesses. Founded in 1979, it specializes in investment banking, asset management, and corporate finance solutions.";
    console.log("Returning fallback description due to error.");
    return NextResponse.json(
      { description: fallbackDescription },
      { status: 200 } // Return 200 with fallback to avoid breaking UI
    )
  }
}

