import {
  MarkdownTextSplitter,
  Document,
} from "@pinecone-database/doc-splitter";
import md5 from "md5";

const splitter = new MarkdownTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 100,
});

export async function splitMarkdown(markdown: string): Promise<Document[]> {
  const docs = await splitter.createDocuments([markdown]);

  return docs.map((doc: Document) => ({
    ...doc,
    metadata: { hash: md5(doc.pageContent), text: markdown },
  }));
}

export function splitTitleAndIngredients(markdown: string): Document {
  return {
    pageContent: markdown.split("## Steps")[0],
    metadata: { hash: md5(markdown), text: markdown },
  };
}
