import { Configuration, OpenAIApi } from "openai-edge";
import { createEmbedding } from "./embeddings";
import { getPineconeClient } from "./pinecone";

export type Metadata = {
  url: string;
  text: string;
  chunk: string;
};

export async function getContext(
  message: string,
  topK: number,
  namespace?: string,
  minScore?: number
): Promise<Metadata[]> {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);
  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index("kitchen-stories-recipes");
  const vector = await createEmbedding(message, openai);

  const queryResponse = await pineconeIndex.query({
    queryRequest: {
      vector,
      topK,
      namespace,
      includeMetadata: true,
    },
  });

  if (queryResponse.matches != null) {
    return queryResponse.matches
      .filter((sv) => (sv.score ?? 0) > (minScore ?? 0.7))
      .map((sv) => sv.metadata as Metadata);
  }

  return [];
}
