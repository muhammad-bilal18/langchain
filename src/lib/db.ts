import { ChromaClient } from "chromadb";

export async function connectToDatabase(): Promise<void> {
    const client = new ChromaClient({
        path: 'src/chroma_db',
    });
}