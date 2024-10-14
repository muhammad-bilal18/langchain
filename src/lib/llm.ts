import { ChatOpenAI } from "@langchain/openai";
import { config } from 'dotenv';
config();

export const ChatGPT = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.9
});