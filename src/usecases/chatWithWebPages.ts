import { ChatGPT } from "../lib/llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";

const DEFAULT_URL = 'https://js.langchain.com/docs/how_to/#langchain-expression-language-lcel';

const PROMPT_TEMPLATE = `
    Answer the question based on the context below.
    Context: {context}
    Question: {question}
`;

const createChatChain = () => {
    const prompt = ChatPromptTemplate.fromTemplate(PROMPT_TEMPLATE);
    return prompt.pipe(ChatGPT).pipe(new StringOutputParser());
};

const loadWebPage = async (url: string): Promise<Document[]> => {
    const loader = new CheerioWebBaseLoader(url);
    return loader.load();
};

const extractTextContent = (docs: Document[]): string => {
    return docs.map(doc => doc.pageContent).join('\n');
};

export const chatWithWebPages = async (question: string, url: string = DEFAULT_URL): Promise<string> => {
    try {
        const docs = await loadWebPage(url);
        const context = extractTextContent(docs);
        const chain = createChatChain();
        
        const response = await chain.invoke({
            question,
            context,
        });
        
        return response;
    } catch (error) {
        console.error('Error in chatWithWebPages:', error);
        throw new Error('Failed to process web page or generate response');
    }
};