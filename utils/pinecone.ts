import { PineconeClient } from "@pinecone-database/pinecone";

export const getPineconeClient = async () => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });

  return pinecone;
};
