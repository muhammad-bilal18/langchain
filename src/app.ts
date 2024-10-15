import express from 'express';
import { config } from "dotenv";
import generate_mcq from './routes/generate-mcq';
import cors from 'cors';
import { chatWithDocsLocally } from './usecases/chatWithDocsLocally';

config();

const app = express();
app.use(express.json())
app.use(cors());
const PORT = process.env.PORT;

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
})

app.use('/generate-mcq', generate_mcq);

async function main() {
  const response = await chatWithDocsLocally('Give a small introduction of Muhammad Bilal?', 'docx', 'src/documents/intro.docx');
  console.log(response);
}

app.listen(PORT, async () => {
  console.log('server listening on port', PORT);
  await main();
})