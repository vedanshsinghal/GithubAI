import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import type { Document } from "@langchain/core/documents"
import { generateEmbedding, summariseCode } from "./gemini"
import { db } from "~/server/db"
export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || "",
        branch: "main",
        ignoreFiles: ["package-lock.json", "yarn-lock", "pnpm-lock.yaml", "bun.lockb"],
        recursive: true,
        unknown: "warn",
        maxConcurrency: 5
    })
    const docs = await loader.load()
    return docs
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`processing ${index} of ${allEmbeddings.length}`)
        if (!embedding) return

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                projectId,
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,

            }
        })
        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET  "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE id = ${sourceCodeEmbedding.id}`
    }))
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const generateEmbeddings = async (docs: Document[]) => {
    const results = []
    for (const doc of docs) {
        const summary = await summariseCode(doc) //first get the summary of docs
        if (!summary) continue // skip if summary failed to prevent empty string embedding crash

        const embedding = await generateEmbedding(summary) //then get the embedding of summary

        results.push({
            summary,
            embedding,

            // Deep clones and sanitizes the string to remove hidden metadata/encodings before saving to DB
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source
        })

        // Wait 4 seconds between requests to avoid hitting the 15 RPM rate limit
        await delay(4000)
    }
    return results
}