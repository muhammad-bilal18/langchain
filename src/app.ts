import express from 'express';
import { config } from "dotenv";
import generate_mcq from './routes/generate-mcq';
import fetch_data from './routes/fetch-data';
import chat_with_docs from './routes/chat-with-docs';
import cors from 'cors';

config();

const app = express();
app.use(express.json())
app.use(cors({ origin: '*' }));
const PORT = process.env.PORT!;

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
})

app.use('/generate-mcq', generate_mcq);

app.use('/fetch-data', fetch_data);

app.use('/chat-with-docs', chat_with_docs);

app.listen(PORT, async () => {
  console.log('server listening on port', PORT);
})