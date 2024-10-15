import { ChatGPT, ollama } from "../lib/llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { Document } from "@langchain/core/documents";

import "pdf-parse";
import "mammoth";

const CHUNK_SIZE = 300;
const CHUNK_OVERLAP = 30;
const RETRIEVER_K = 3;
// const DOCUMENT_DIR = 'src/documents';

const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the question based on the context below.
    Context: {context}
    Question: {input}
`);

const createVectorStore = async (docs: Document[]) => {
  const embeddings = new OpenAIEmbeddings();
  return Chroma.fromDocuments(docs, embeddings, {
    collectionName: 'docs',
    url: 'http://0.0.0.0:8000',
  })
};

const createRetrievalChainFromDocs = async (docs: Document[]) => {
  const baseChain = prompt.pipe(ollama).pipe(new StringOutputParser());
  const vectorStore = await createVectorStore(docs);
  const retriever = vectorStore.asRetriever({ k: RETRIEVER_K });
  return createRetrievalChain({
    combineDocsChain: baseChain,
    retriever,
  });
};

const getLoader = (fileType: string, path: string) => {
  switch (fileType) {
    case 'pdf':
      return new PDFLoader(path);
    case 'docx':
      return new DocxLoader(path);
    default:
      throw new Error('Unsupported file type');
  }
};

const loadAndProcessDocument = async (fileType: string, path: string) => {
  const loader = getLoader(fileType, path);
  const docs = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  return textSplitter.splitDocuments(docs);
};

export const chatWithDocsLocally = async (
  question: string,
  fileType: string = 'pdf',
  path: string = 'src/documents/js.pdf'
): Promise<string> => {
  try {
    const docs = await loadAndProcessDocument(fileType, path);
    const retrievalChain = await createRetrievalChainFromDocs(docs);
    const response = await retrievalChain.invoke({ input: question });
    return response.answer;
  } catch (error) {
    console.error("Error in chatWithDocsLocally:", error);
    throw new Error("Failed to process the document or answer the question");
  }
};