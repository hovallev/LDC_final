// src/lib/processDocuments.ts

import fs from 'fs/promises'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { Pinecone, type Index } from '@pinecone-database/pinecone'
import pdfParse from 'pdf-parse'

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
  throw new Error('PINECONE_API_KEY and PINECONE_ENVIRONMENT must be set in environment variables')
}

// Initialize OpenAI with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Pinecone with validated environment variables
const pinecone = new Pinecone()

interface PdfData {
  text: string;
  [key: string]: any;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer) as PdfData
    if (!data.text) {
      throw new Error('PDF parsing resulted in empty text')
    }
    return data.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw error
  }
}

async function createEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating embeddings:', error)
    throw error
  }
}

// Function to split text into chunks
function splitIntoChunks(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

async function waitForIndexToBeReady(indexName: string, maxWaitTimeMs: number = 120000): Promise<void> {
  const startTime = Date.now()
  while (Date.now() - startTime < maxWaitTimeMs) {
    try {
      const index = pinecone.index(indexName)
      const stats = await index.describeIndexStats()
      if (stats.totalRecordCount !== undefined) {
        return // Index is ready
      }
    } catch (error) {
      // If error, wait and retry
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
  throw new Error(`Index ${indexName} not ready after ${maxWaitTimeMs}ms`)
}

export async function processDocuments() {
  const documentsDir = path.join(process.cwd(), 'documents')
  
  // Check if documents directory exists
  if (!existsSync(documentsDir)) {
    throw new Error(`Documents directory not found at ${documentsDir}`)
  }

  try {
    // Create index if it doesn't exist
    const indexName = 'bank-documents'
    const indexList = await pinecone.listIndexes()
    
    if (!indexList.indexes?.find(idx => idx.name === indexName)) {
      console.log(`Creating index ${indexName}...`)
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // dimension of text-embedding-ada-002 model
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-west-2'
          }
        }
      })
      // Wait for index to be ready with proper timeout handling
      await waitForIndexToBeReady(indexName)
    }
    
    const index = pinecone.index(indexName)

    // Read all PDF files from the documents directory
    const files = await fs.readdir(documentsDir)
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in documents directory')
      return
    }

    console.log(`Found ${pdfFiles.length} PDF files`)

    for (const file of pdfFiles) {
      console.log(`Processing ${file}...`)
      const filePath = path.join(documentsDir, file)
      const buffer = await fs.readFile(filePath)
      
      // Extract text
      const text = await extractTextFromPDF(buffer)
      
      if (!text.trim()) {
        console.warn(`Warning: No text content extracted from ${file}`)
        continue
      }
      
      // Split text into chunks to stay within token limits
      const chunks = splitIntoChunks(text)
      
      console.log(`Split ${file} into ${chunks.length} chunks`)
      
      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i].trim()
        
        if (!chunk) {
          continue // Skip empty chunks
        }
        
        // Create embeddings
        const embedding = await createEmbeddings(chunk)
        
        // Store in Pinecone
        await index.upsert([{
          id: `${file}-chunk-${i}`,
          values: embedding,
          metadata: {
            text: chunk,
            filename: file,
            chunkIndex: i,
            processedAt: new Date().toISOString(),
          },
        }])
        
        console.log(`Processed chunk ${i+1}/${chunks.length} of ${file}`)
      }

      console.log(`Completed processing ${file}`)
    }

    console.log('All documents processed successfully')
  } catch (error) {
    console.error('Error processing documents:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

// Allow this to be run directly
if (require.main === module) {
  processDocuments()
    .then(() => {
      console.log('Document processing complete')
      process.exit(0)
    })
    .catch(err => {
      console.error('Document processing failed:', err)
      process.exit(1)
    })
}