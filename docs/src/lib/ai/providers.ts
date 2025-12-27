import { ChatGroq } from '@langchain/groq'
import { OpenAIEmbeddings } from '@langchain/openai'

// Use placeholder API key during build time if not provided
const groqApiKey = process.env.GROQ_API_KEY || 'placeholder-key-for-build'
const openaiApiKey = process.env.OPENAI_API_KEY || 'placeholder-key-for-build'

export const chatModel = new ChatGroq({
  model: 'llama-3.3-70b-versatile',
  temperature: 0,
  apiKey: groqApiKey,
})

export const embeddingModel = new OpenAIEmbeddings({
  model: 'text-embedding-3-small',
  apiKey: openaiApiKey,
})
