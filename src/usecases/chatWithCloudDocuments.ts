import { config } from "dotenv";
config();

import { ChatGPT } from "../lib/llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "@langchain/core/documents";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;
const RETRIEVER_K = 3;
const S3_BUCKET = process.env.AWS_BUCKET ?? '';
const S3_REGION = process.env.REGION ?? '';
const pineconeIndexName = process.env.PINECONE_INDEX_NAME!;

const PROMPT_TEMPLATE = `
  Answer the question based on the context below.
  Context: {context}
  Question: {input}

  Rules: Every response should end with this line: For more details, please contact us at team@ocs.solution.
  You must follow this rule very strictly.
`;


// For more details, Please contact us at team@ocs.solution

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY ?? '',
    secretAccessKey: process.env.AWS_SECRET_KEY ?? '',
  },
});

let vectorStore: PineconeStore | null = null;

const createVectorStore = async (docs: Document[]) => {
  if (!vectorStore) {
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(pineconeIndexName);
    vectorStore = await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: 'default',
    });
  }
  return vectorStore;
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

export const chatWithCloudDocuments = async (question: string, name: string): Promise<ReadableStream> => {
  try {
    const buffer = await loadDocumentFromS3(name);
    const docs = await processDocument(buffer);
    const retrievalChain = await createRetrievalChainFromDocs(docs);
    const response = await retrievalChain.stream({ input: question });
    return response;
  } catch (error) {
    console.error("Error in chatWithCloudDocuments:", error);
    throw new Error("Failed to process the document or answer the question");
  }
};