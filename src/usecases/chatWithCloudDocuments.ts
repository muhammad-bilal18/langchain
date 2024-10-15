import { config } from "dotenv";
config();

import { ChatGPT } from "../lib/llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "@langchain/core/documents";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;
const RETRIEVER_K = 3;
const S3_BUCKET = process.env.AWS_BUCKET ?? '';
const S3_REGION = process.env.AWS_REGION ?? '';

const PROMPT_TEMPLATE = `
  Answer the question based on the context below.
  Context: {context}
  Question: {input}
`;

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY ?? '',
    secretAccessKey: process.env.AWS_SECRET_KEY ?? '',
  },
});

const createVectorStore = async (docs: Document[]): Promise<MemoryVectorStore> => {
  const embeddings = new OpenAIEmbeddings();
  return MemoryVectorStore.fromDocuments(docs, embeddings);
};

const createRetrievalChainFromDocs = async (docs: Document[]) => {
  const prompt = ChatPromptTemplate.fromTemplate(PROMPT_TEMPLATE);
  const baseChain = prompt.pipe(ChatGPT).pipe(new StringOutputParser());
  const vectorStore = await createVectorStore(docs);
  const retriever = vectorStore.asRetriever({ k: RETRIEVER_K });
  return createRetrievalChain({
    combineDocsChain: baseChain,
    retriever,
  });
};

const loadDocumentFromS3 = async (document_name: string): Promise<Uint8Array> => {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: document_name,
  });

  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error("No body in S3 response");
  }
  return response.Body.transformToByteArray();
};

const processDocument = async (buffer: Uint8Array): Promise<Document[]> => {
  const loader = new DocxLoader(new Blob([buffer]));
  const docs = await loader.load();
  
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  return textSplitter.splitDocuments(docs);
};

export const chatWithCloudDocuments = async (question: string): Promise<string> => {
  try {
    const buffer = await loadDocumentFromS3('intro.docx');
    const docs = await processDocument(buffer);
    const retrievalChain = await createRetrievalChainFromDocs(docs);
    const response = await retrievalChain.invoke({ input: question });
    return response.answer;
  } catch (error) {
    console.error("Error in chatWithCloudDocuments:", error);
    throw new Error("Failed to process the document or answer the question");
  }
};