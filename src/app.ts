import express from 'express';
import { config } from "dotenv";
import generate_mcq from './routes/generate-mcq';
// import upload_document from './routes/upload-document';
import cors from 'cors';
import { connectToDatabase } from './lib/db';
import { chatWithCloudDocuments } from './usecases/chatWithCloudDocuments';

config();

const app = express();
app.use(express.json())
app.use(cors());
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('server listening on port', PORT);
  // connectToDatabase();
})

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
})

app.use('/generate-mcq', generate_mcq);

// app.use('/upload-document', upload_document);
// async function main() {
//   const response = await chatWithCloudDocuments("Who is Bilal?");
//   console.log(response);
// }

// main();