import { ChatGPT } from '../lib/llm';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { mcqPrompt } from '../lib/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { QuizQuestion } from '../lib/types';
import { z } from 'zod';

const STRUCTURED_PROMPT_TEMPLATE = `
    Extract information from the following context:
    Context: {context}
    Formatting instructions: {format_instructions}    
`;

const quizQuestionSchema = z.array(
    z.object({
        question: z.string().describe('Question to be asked, should start with "Question [number]: "'),
        options: z.array(z.string().describe('Each option must start with an option label e.g. A)')).describe('Options for the question'),
        correctAnswer: z.string().describe('Answer to the question, should start with "Correct Answer: "'),
        explanation: z.string().describe('Explanation for the answer, should start with "Explanation: "'),
    })
)

const createMCQChain = () => {
    const prompt = ChatPromptTemplate.fromTemplate(mcqPrompt);
    return prompt.pipe(ChatGPT).pipe(new StringOutputParser());
};

const createStructuredChain = () => {
    const promptStructured = ChatPromptTemplate.fromTemplate(STRUCTURED_PROMPT_TEMPLATE);
    const structuredParser = StructuredOutputParser.fromZodSchema(quizQuestionSchema);
    return promptStructured.pipe(ChatGPT).pipe(structuredParser);
};

export const generateMCQ = async (subject: string, classLevel: string, numMCQs: number): Promise<QuizQuestion[]> => {
    const mcqChain = createMCQChain();
    const structuredChain = createStructuredChain();

    const response = await mcqChain.invoke({ subject, class: classLevel, count: numMCQs });

    const structuredResponse = await structuredChain.invoke({
        context: response,
        format_instructions: StructuredOutputParser.fromZodSchema(quizQuestionSchema).getFormatInstructions(),
    });

    return structuredResponse;
};