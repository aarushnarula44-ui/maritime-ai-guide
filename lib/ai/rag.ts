import type { KnowledgeChunk } from './knowledgeCache'

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

export function retrieveRelevantChunks(
  queryEmbedding: number[],
  chunks: KnowledgeChunk[],
  topK = 3,
): KnowledgeChunk[] {
  const THRESHOLD = 0.3
  return chunks
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .filter(({ score }) => score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ chunk }) => chunk)
}

export function formatChunksAsContext(chunks: KnowledgeChunk[]): string {
  return chunks
    .map((c) => `[Source: ${c.sourceDocument}, ${c.sourceSection}]\n${c.content}`)
    .join('\n\n---\n\n')
}
