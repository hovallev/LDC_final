// src/lib/queryDocuments.ts

import OpenAI from 'openai'
import { Pinecone } from '@pinecone-database/pinecone'

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY must be set in environment variables')
}

// Initialize OpenAI with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Pinecone with validated environment variables
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
})

interface QueryResult {
  text: string;
  filename: string;
  score: number;
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

export async function queryDocuments(query: string, topK: number = 5): Promise<QueryResult[]> {
  try {
    // Create embedding for the query
    const embedding = await createEmbeddings(query)
    
    // Query Pinecone
    const index = pinecone.index('bank-documents')
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true
    })
    
    // Process and return results
    return queryResponse.matches?.map(match => ({
      text: match.metadata?.text as string || '',
      filename: match.metadata?.filename as string || '',
      score: match.score || 0
    })) || []
  } catch (error) {
    console.error('Error querying documents:', error)
    throw error
  }
}

// Allow this to be run directly
if (require.main === module) {
  const question = process.argv[2]
  if (!question) {
    console.error('Please provide a question as an argument')
    process.exit(1)
  }

  queryDocuments(question)
    .then(results => {
      console.log('Query results:', results)
      process.exit(0)
    })
    .catch(err => {
      console.error('Query failed:', err)
      process.exit(1)
    })
}