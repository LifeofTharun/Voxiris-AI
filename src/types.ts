/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  color: string;
  style: string;
  fabric: string;
  price: number;
  imageUrl: string;
  tags: string[];
  embeddings: number[]; // Simulated feature vector for Cosine Similarity display
  buyUrl?: string;
}

export interface VisionMetrics {
  detectedCategory: string;
  detectedColor: string;
  detectedStyle: string;
  confidenceScore: number;
  extractedVector: number[]; // Feature vector of the uploaded image
}

export interface NLUAnalysis {
  transcribedQuery: string;
  intent: string;
  targetCategory: string;
  priceLimit: number | null;
  extractedKeywords: string[];
}

export interface MatchDetail {
  product: Product;
  cosineSimilarity: number;
  dotProduct: number;
  normA: number;
  normB: number;
  isEligible: boolean;
  rejectReason?: string;
}

export interface RecommendationResponse {
  success: boolean;
  vision?: VisionMetrics;
  nlu?: NLUAnalysis;
  recommendations: MatchDetail[];
  audioVoiceBase64?: string; // TTS voice audio encoded as base64 WAV
  audioMimeType?: string;
  voiceText: string;
}
