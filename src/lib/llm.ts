import { ChatOpenAI } from "@langchain/openai";
import { Ollama } from "@langchain/ollama";

import { config } from 'dotenv';
config();

export const ChatGPT = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.9
});

export const ollama = new Ollama({
  model: "llama3.2",
  temperature: 1,
});