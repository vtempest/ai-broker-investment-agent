import Anthropic from "@anthropic-ai/sdk"

interface MarketData {
  question: string
  description?: string
  currentYesPrice: number
  currentNoPrice: number
  volume24hr?: number
  volumeTotal?: number
  tags?: string[]
}

interface DebateAnalysis {
  yesArguments: string[]
  noArguments: string[]
  yesSummary: string
  noSummary: string
  keyFactors: string[]
  uncertainties: string[]
}

export async function generateDebateAnalysis(
  marketData: MarketData,
  apiKey?: string
): Promise<DebateAnalysis> {
  const client = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  })

  const prompt = `You are an expert analyst tasked with providing a balanced debate analysis for a prediction market question.

Market Question: ${marketData.question}
${marketData.description ? `Description: ${marketData.description}` : ''}

Current Market Odds:
- YES: ${(marketData.currentYesPrice * 100).toFixed(1)}%
- NO: ${(marketData.currentNoPrice * 100).toFixed(1)}%

${marketData.volume24hr ? `24h Volume: $${marketData.volume24hr.toLocaleString()}` : ''}
${marketData.volumeTotal ? `Total Volume: $${marketData.volumeTotal.toLocaleString()}` : ''}
${marketData.tags && marketData.tags.length > 0 ? `Categories: ${marketData.tags.join(', ')}` : ''}

Please provide a comprehensive debate analysis with arguments for BOTH sides. Respond ONLY with valid JSON in this exact format:

{
  "yesArguments": [
    "First strong argument for YES",
    "Second strong argument for YES",
    "Third strong argument for YES"
  ],
  "noArguments": [
    "First strong argument for NO",
    "Second strong argument for NO",
    "Third strong argument for NO"
  ],
  "yesSummary": "A concise 2-3 sentence summary of the strongest case for YES",
  "noSummary": "A concise 2-3 sentence summary of the strongest case for NO",
  "keyFactors": [
    "Key factor 1 that could determine the outcome",
    "Key factor 2 that could determine the outcome",
    "Key factor 3 that could determine the outcome"
  ],
  "uncertainties": [
    "Major uncertainty or unknown factor 1",
    "Major uncertainty or unknown factor 2"
  ]
}

Guidelines:
1. Be intellectually honest and balanced - present the strongest arguments for BOTH sides
2. Base arguments on facts, data, historical precedent, and logical reasoning
3. Consider expert opinions, statistical trends, and real-world constraints
4. Identify genuine uncertainties rather than taking a definitive stance
5. Each argument should be specific and substantive (2-3 sentences)
6. Key factors should be concrete, measurable events or conditions
7. Focus on factors that are actually relevant to the prediction timeframe
8. Avoid bias toward the current market price

Return ONLY the JSON object, with no additional text or explanation.`

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude")
  }

  // Extract JSON from response
  let jsonText = content.text.trim()

  // Remove markdown code blocks if present
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```\n?$/g, "")
  }

  try {
    const analysis = JSON.parse(jsonText)

    // Validate required fields
    if (!analysis.yesArguments || !analysis.noArguments ||
        !analysis.yesSummary || !analysis.noSummary ||
        !analysis.keyFactors || !analysis.uncertainties) {
      throw new Error("Missing required fields in analysis")
    }

    return analysis as DebateAnalysis
  } catch (error) {
    console.error("Failed to parse debate analysis:", error)
    console.error("Raw response:", jsonText)
    throw new Error(`Failed to parse LLM response: ${error}`)
  }
}

export async function generateDebateAnalysisWithOpenAI(
  marketData: MarketData,
  apiKey?: string
): Promise<DebateAnalysis> {
  const prompt = `You are an expert analyst tasked with providing a balanced debate analysis for a prediction market question.

Market Question: ${marketData.question}
${marketData.description ? `Description: ${marketData.description}` : ''}

Current Market Odds:
- YES: ${(marketData.currentYesPrice * 100).toFixed(1)}%
- NO: ${(marketData.currentNoPrice * 100).toFixed(1)}%

${marketData.volume24hr ? `24h Volume: $${marketData.volume24hr.toLocaleString()}` : ''}
${marketData.volumeTotal ? `Total Volume: $${marketData.volumeTotal.toLocaleString()}` : ''}
${marketData.tags && marketData.tags.length > 0 ? `Categories: ${marketData.tags.join(', ')}` : ''}

Please provide a comprehensive debate analysis with arguments for BOTH sides. Respond with valid JSON in this format:

{
  "yesArguments": ["argument 1", "argument 2", "argument 3"],
  "noArguments": ["argument 1", "argument 2", "argument 3"],
  "yesSummary": "2-3 sentence summary",
  "noSummary": "2-3 sentence summary",
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "uncertainties": ["uncertainty 1", "uncertainty 2"]
}

Be intellectually honest, balanced, and provide strong arguments for both sides.`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey || process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert analyst who provides balanced, fact-based debate analysis. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  try {
    const analysis = JSON.parse(content)
    return analysis as DebateAnalysis
  } catch (error) {
    console.error("Failed to parse OpenAI response:", error)
    throw new Error(`Failed to parse LLM response: ${error}`)
  }
}
