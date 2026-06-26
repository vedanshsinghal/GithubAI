import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Document } from "@langchain/core/documents"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" })

export const aiSummariseCommit = async (diff: string) => {
  // https://github.com/project/owner/commit/commitHash.diff
  const response = await model.generateContent([
    `You are an expert programmer summarizing a git diff for a code review.

Git diff format reminders:
- Lines starting with \`+\` were added
- Lines starting with \`-\` were deleted
- All other lines are context only, not part of the change
- Metadata lines (e.g. \`diff --git a/file b/file\`) indicate which file was modified

Your task:
- Write a concise bullet-point summary of what changed and why (inferred from context)
- Reference file names in brackets like \`[src/index.ts]\` — but only if 1-2 files are relevant
- If more than 2 files are involved in a single logical change, omit individual file references for that point
- Do not reproduce or reference the example format below in your output

Example output format:
\`\`\`
* Raised the amount of returned recordings from 10 to 100 [packages/server/recordings_api.ts]
* Fixed a typo in the GitHub Actions workflow name [.github/workflows/gpt-commit-summarizer.yml]
* Moved octokit initialization to a separate file [src/octokit.ts], [src/index.ts]
* Lowered numeric tolerance across test files
\`\`\`

Now summarize the following diff:

\`\`\`
${diff}
\`\`\``,
  ]);

  return response.response.text();
}

export async function summariseCode(doc: Document) {
  console.log("getting summary for", doc.metadata.source)
  const code = doc.pageContent.slice(0, 20000) // first 20k characters he consider honge

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await model.generateContent([
        `You are a technical onboarding assistant helping a junior developer understand an unfamiliar codebase.

Explain the purpose of the file \`${doc.metadata.source}\` based on the code below.

Rules:
- Maximum 100 words
- Focus on: what the file does, why it exists, and any key functions or exports worth knowing
- Use plain language — avoid jargon where possible

Code:
\`\`\`
${code}
\`\`\``,
      ]);

      return response.response.text()

    } catch (error) {
      console.error(`Attempt ${attempt} failed to summarize ${doc.metadata.source}:`, error)
      if (attempt === 3) {
        return "" // Give up after 3 tries
      }
      // Wait 1 minute before retrying so the rate limit fully resets
      //To force JavaScript to actually stop and wait, we have to wrap setTimeout in a Promise
      await new Promise(resolve => setTimeout(resolve, 60000))
    }
  }
  return ""
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" })
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text: summary }] },
    // @ts-expect-error - outputDimensionality is supported by the API but not in the SDK types
    outputDimensionality: 768
  })
  const embedding = result.embedding
  return embedding.values
}

