import { Pinecone } from '@pinecone-database/pinecone';
import { config } from 'dotenv'; config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const indexName = 'quickstart';

export const createPineIndex = async () => {
    return await pc.createIndex({
        name: indexName,
        dimension: 2,
        metric: 'cosine',
        spec: { 
          serverless: { 
            cloud: 'aws', 
            region: 'us-east-1' 
          }
        } 
    });
}