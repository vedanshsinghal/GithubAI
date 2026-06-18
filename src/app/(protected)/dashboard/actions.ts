"use server"

import { streamText } from "ai"
import { createStreamableValue } from "@ai-sdk/rsc"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateEmbedding } from "~/lib/gemini"
import { db } from "~/server/db"

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
})

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue()
    const queryVector = await generateEmbedding(question)
    const vectorQuery = `[${queryVector.join(",")}]`

    const result = await db.$queryRaw` SELECT "fileName","sourceCode","summary",
    1-("summaryEmbedding"<=>${vectorQuery}::vector) AS similarity FROM "SourceCodeEmbedding"
    WHERE 1-("summaryEmbedding"<=>${vectorQuery}::vector)>0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC 
    LIMIT 10 ` as { fileName: string; sourceCode: string; summary: string }[]

    let context = ""
    for (const doc of result) {
        context += `source:${doc.fileName}\ncode content:${doc.sourceCode}\nsummary of file:${doc.summary}\n\n`
    }

    (async () => {
        const { textStream } = await streamText({
            model: google("gemini-3.1-flash-lite"),
            prompt: ` You are a code assistant for an intern working on this codebase.
Answer questions using ONLY the context provided below. If the context doesn't contain enough information to answer, say so clearly — do not invent or infer beyond what's given.
When answering:
- Explain the "why", not just the "what"
- Include relevant code snippets with comments
- Keep explanations intern-friendly (assume solid basics, not expert knowledge)
- Structure your answer: explanation → code → walkthrough
CONTEXT:
${context}
QUESTION:
${question}
}`

        })
        for await (const delta of textStream) {
            stream.update(delta)
        }
        stream.done()
    })()
    return {
        output: stream.value,
        filesReferences: result
    }
}
