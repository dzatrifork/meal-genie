import {
  MarkdownTextSplitter,
  Document,
} from "@pinecone-database/doc-splitter";
import md5 from "md5";

const splitter = new MarkdownTextSplitter({ chunkSize: 512, chunkOverlap: 0 });

export async function splitMarkdown(markdown: string): Promise<Document[]> {
  const docs = await splitter.createDocuments([markdown.split('## Tags')[0]]);

  return docs.map((doc: Document) => ({
    ...doc,
    metadata: { hash: md5(doc.pageContent), text: markdown },
  }));
}
