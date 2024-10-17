import { ChatGPT } from '../lib/llm';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { appointmentDBPrompt, patientDBPrompt } from '../lib/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { connectToDatabase } from '../lib/db';

const collectionPrompt = ChatPromptTemplate.fromTemplate(`
  Based on the given expression, return the name of the collection. 
  The collection must be either "patients" or "appointments" (in plural form).
  
  Collection "patients" has fields: petName, petType, ownerName, ownerAddress, ownerPhone.
  Collection "appointments" has fields: patient.petName, patient.ownerPhoneNumber, appointmentStartTime, appointmentEndTime, description, feeAmount, feeStatus.
  
  Note: Always return either "patients" or "appointments" as the collection name, and ensure the name is plural.
  
  expression: {expression}
`)

const collectionChain = collectionPrompt.pipe(ChatGPT).pipe(new StringOutputParser());

const createQueryChain = (doc: string) => {
    const prompt = ChatPromptTemplate.fromTemplate(doc === 'patients' ? patientDBPrompt : appointmentDBPrompt);
    return prompt.pipe(ChatGPT).pipe(new StringOutputParser());
};

export const generateQuery = async (expression: string): Promise<string> => {
    const mongoose = await connectToDatabase();

    if (mongoose.connection.readyState !== 1) {
        throw new Error("Database connection is not ready");
    }

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("Database instance is undefined");
    }
    const collection = await collectionChain.invoke({ expression: expression });
    if (collection !== 'patients' && collection !== 'appointments') {
        return 'undefined';
    }
    const queryChain = createQueryChain(collection);
    const response = await queryChain.invoke({ expression: expression });
    try {
      const queryResponse = await eval(response);
      return queryResponse;
    } catch (error) {
      return response;
    }
};