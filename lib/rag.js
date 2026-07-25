import { searchKnowledgeDataset } from "./datasetTaxonomy";

// Cosine similarity calculator for vector embeddings
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Recommend resources — now delegates to dataset API server-side
// Client-side fallback for backward compatibility
export function getRecommendedResources(weakTopic, track = "") {
  try {
    return searchKnowledgeDataset(weakTopic || track);
  } catch {
    return [];
  }
}
