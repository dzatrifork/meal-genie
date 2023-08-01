import { Configuration, OpenAIApi } from "openai-edge";
import { Document } from "@pinecone-database/doc-splitter";
import { Vector } from "@pinecone-database/pinecone";
import { configDotenv } from "dotenv";

export async function createEmbedding(input: string, openai: OpenAIApi) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: input.replace(/\n/g, " "),
    });

    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (e) {
    console.log("Error calling OpenAI embedding API: ", e);
    throw new Error(`Error calling OpenAI embedding API: ${e}`);
  }
}

export async function embedDocument(doc: Document, openai: OpenAIApi): Promise<Vector> {
  try {
    // Generate OpenAI embeddings for the document content
    const embedding = await createEmbedding(doc.pageContent, openai);

    // Return the vector embedding object
    return {
      id: doc.metadata.hash, // The ID of the vector is the hash of the document content
      values: embedding, // The vector values are the OpenAI embeddings
      metadata: { // The metadata includes details about the document
        chunk: doc.pageContent, // The chunk of text that the vector represents
        text: doc.metadata.text as string, // The text of the document
        url: doc.metadata.url as string, // The URL where the document was found
        hash: doc.metadata.hash as string // The hash of the document content
      }
    } as Vector;
  } catch (error) {
    console.log("Error embedding document: ", error)
    throw error
  }
}
