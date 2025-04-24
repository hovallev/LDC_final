// src/app/api/document-reader/route.ts
// Text files implementation

import { NextResponse } from 'next/server';
// Import Google Generative AI
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Check for Google API Key
if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set');
}

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const modelId = "gemini-2.5-flash-preview-04-17"; // Use the specified model ID
const model = genAI.getGenerativeModel({ model: modelId });


// In-memory cache for document text
const documentCache: Record<string, string> = {};

// Simple function to read text from a file
function readFileAsText(filePath: string): string {
  try {
    // Check cache first
    if (documentCache[filePath]) {
      // console.log(`Using cached text for: ${filePath}`); // Reduce noise
      return documentCache[filePath];
    }

    console.log(`Reading text from ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Cache the content
    documentCache[filePath] = content;
    console.log(`Successfully read ${content.length} characters from text file`);
    return content;
  } catch (error) {
    console.error(`Error reading file:`, error);
    return "";
  }
}

// Find all text files in the documents directory
function findAllTextDocuments(): string[] {
  try {
    // console.log("Looking for text documents..."); // Reduce noise
    const documentsDir = path.join(process.cwd(), 'documents');
    const files = fs.readdirSync(documentsDir);

    // Filter for text files
    const textFiles = files.filter(file =>
      file.toLowerCase().endsWith('.txt')
    );

    // console.log(`Found ${textFiles.length} text documents`); // Reduce noise

    // Return full paths
    return textFiles.map(file => path.join(documentsDir, file));
  } catch (error) {
    console.error("Error finding text documents:", error);
    return [];
  }
}

// Find relevant documents based on keyword matching
function findRelevantDocuments(query: string, allDocuments: string[]): Array<{ filePath: string, content: string, score: number }> {
  // console.log(`Finding relevant documents for query: "${query}"`); // Reduce noise

  // Extract keywords (words longer than 3 chars)
  const keywords = query.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3);

  // console.log(`Keywords: ${keywords.join(', ')}`); // Reduce noise

  if (keywords.length === 0) {
    console.log("No significant keywords found, returning all documents");
    // If no keywords, return all documents with neutral score
    return allDocuments.map(filePath => ({
      filePath,
      content: readFileAsText(filePath),
      score: 1
    }));
  }

  // Score each document
  const scoredDocs = allDocuments.map(filePath => {
    const content = readFileAsText(filePath);
    const lowerContent = content.toLowerCase();

    // Calculate score based on keyword frequency
    let score = 0;
    for (const keyword of keywords) {
      // Use word boundaries for better matching
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi'); 
      const matches = lowerContent.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    return { filePath, content, score };
  });

  // Sort by score (descending) and return top 3
  const sortedDocs = scoredDocs
    .filter(doc => doc.score > 0) // Only include docs with matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // console.log(`Found ${sortedDocs.length} relevant documents`); // Reduce noise
  return sortedDocs;
}

// GET handler (health check)
export async function GET() {
  const documents = findAllTextDocuments();

  return NextResponse.json({
    message: 'Document Reader API is working (using Gemini)',
    documentCount: documents.length,
    documents: documents.map(file => path.basename(file)),
    info: 'Please use POST method to send messages and query documents.'
  }, { status: 200 });
}

// POST handler
export async function POST(request: Request) {
  console.log("--- Document Reader API POST handler (Gemini) ---");

  try {
    // 1. Parse request and log size
    // console.log("Parsing request..."); // Reduce noise
    const body = await request.json();
    const { messages } = body;
    // const requestSize = JSON.stringify(body).length;
    // console.log(`Request size: ${requestSize} characters`);
    // console.log(`Number of messages: ${messages.length}`);

    if (!messages || messages.length === 0) {
       return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Log the last message (user query)
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;
    console.log(`User query: "${userQuery}"`);

    // 2. Find relevant documents based on the query
    const allDocuments = findAllTextDocuments();
    if (allDocuments.length === 0) {
      console.warn("No text documents found in the documents directory. Proceeding without context.");
      // Don't throw error, proceed without context
    }

    const relevantDocs = allDocuments.length > 0 ? findRelevantDocuments(userQuery, allDocuments) : [];

    // 3. Prepare context from relevant documents (limit characters)
    const MAX_CHARS_PER_DOC = 2000; // Increased limit slightly for Gemini
    const context = relevantDocs.map(doc => {
      const fileName = path.basename(doc.filePath);
      const snippet = doc.content.length > MAX_CHARS_PER_DOC
        ? doc.content.substring(0, MAX_CHARS_PER_DOC) + "... (truncated)"
        : doc.content;

      return `--- Start of Content from ${fileName} ---\n${snippet}\n--- End of Content from ${fileName} ---`;
    }).join('\n\n');

    // 4. Construct the prompt for Gemini
    const instructionPrompt = `You are an AI assistant that answers questions based ONLY on the provided document contents. If the documents don't contain the answer, state that clearly. Do not use prior knowledge.

RESPONSE GUIDELINES:
*   ALWAYS respond in English, even if the documents are in Spanish or another language.
*   If the documents are in Spanish or another language, translate the relevant information to English in your response.
*   Use proper Markdown formatting for better readability (bold, headings, lists).
*   Keep responses concise and well-structured, directly addressing the user's query.
*   If the documents don't contain relevant information, acknowledge this and state that the answer cannot be found in the provided text.

PROVIDED DOCUMENT EXCERPTS:
${context || "No specific document content was found or provided for this query."}

USER QUERY:
${userQuery}`;    
    
    // Log size information
    // console.log(`Context size: ${context.length} characters`);
    console.log(`Combined Prompt length: ${instructionPrompt.length} characters`);

    // Define safety settings (adjust as needed)
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // 5. Call Gemini with the combined prompt
    console.log("Calling Gemini...");
    const result = await model.generateContent(
      instructionPrompt,
      // Uncomment and adjust generationConfig if needed
      /* {
        safetySettings,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800, // Adjust token limit if needed
        },
      } */
    );

    const response = result.response;
    const generatedText = response.text();
    
    console.log("Gemini Raw Response:", JSON.stringify(response, null, 2)); // Log raw response
    
    // 6. Return response
    console.log("Sending response...");
    const formattedResponse = formatResponseText(generatedText); // Use existing formatter

    return NextResponse.json({
      response: formattedResponse,
    });

  } catch (error: any) {
    console.error("Error in POST handler (Gemini):", error);
    
     // Log specific Gemini errors if available
    if (error.response) {
      console.error("Gemini Error Details:", JSON.stringify(error.response, null, 2));
    }
    
    return NextResponse.json(
      { error: `Failed to generate response: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Format the response text for better readability (Keep existing function)
function formatResponseText(text: string | null): string {
  if (!text) return '';

  // Make sure headings have proper spacing and formatting
  let formatted = text
    // Fix heading formatting (ensure # has space after it)
    .replace(/^(#+)([^\s])/gm, '$1 $2')
    // Make sure there's space before and after headings
    .replace(/\n(#+\s.*)\n/g, '\n\n$1\n\n')
    // Bold keywords (** **) properly spaced
    .replace(/\*\*([^*]+)\*\*/g, '**$1**')
    // Proper list spacing
    .replace(/^(\s*[-*+])/gm, '\n$1');

  // Fix newlines to ensure proper paragraph breaks
  formatted = formatted
    // Collapse multiple newlines into two
    .replace(/\n{3,}/g, '\n\n')
    // Add proper spacing at the beginning if needed
    .replace(/^\s*\n/, '');

  return formatted;
} 