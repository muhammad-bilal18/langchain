import express from 'express';
import { config } from "dotenv";
import generate_mcq from './routes/generate-mcq';
import fetch_data from './routes/fetch-data';
import cors from 'cors';
import { connectToDatabase } from './lib/db';

config();

const app = express();
app.use(express.json())
app.use(cors());
const PORT = process.env.PORT;

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
})

app.use('/generate-mcq', generate_mcq);

app.use('/fetch-data', fetch_data);

app.listen(PORT, async () => {
  console.log('server listening on port', PORT);
})