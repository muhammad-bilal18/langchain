import mongoose from 'mongoose';
import { config } from "dotenv";
config();

import { ChromaClient } from "chromadb";

export async function connectToDatabase(): Promise<void> {
    const client = new ChromaClient({
        path: "http://localhost:8000",
    });
    await client.createCollection({
        name: "cloud_documents",
    });
    
    // const url: string =  process.env.MONGO_URL!;
    
    // mongoose.connect(url)
    //     .then(() => {
    //         console.log(`Connected to ${url}`);
    //     })
    //     .catch((error) => {
    //         console.log(`Failed to connect to the database. Error: ${error.message}`);
    //         process.exit(1);
    //     });
}