import { utils } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import * as embeddings from "./embeddings";
import * as files from "./files";
import { getPineconeClient } from "./pinecone";
import * as splitter from "./splitter";
import { Configuration, OpenAIApi } from "openai-edge";

async function populatePinecone() {

  dotenv.config({ path: ".env.local" });
  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index("kitchen-stories-recipes");

  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  const recipes = await files.readFilesInDirectory("recipesData");
  console.log(`Number of recipes: ${recipes.length}`);
  const docs = flatten(
    await Promise.all(recipes.map((recipe) => splitter.splitMarkdown(recipe)))
  );
  console.log(`Number of documents after split: ${docs.length}`);
  const vectors = await Promise.all(
    docs.map((doc) => embeddings.embedDocument(doc, openai))
  );
  console.log(`Finished embedding documents into vectors: ${vectors.length}`);
  utils.chunkedUpsert(pineconeIndex!, vectors, "kitchen-stories-3", 100);
}

function flatten<T>(arr: T[][]): T[] {
  return ([] as T[]).concat(...arr);
}

populatePinecone();
