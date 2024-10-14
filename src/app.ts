import express from 'express';
import { config } from "dotenv";
import generate_mcq from './routes/generate-mcq';
import cors from 'cors';

config();

const app = express();
app.use(express.json())
app.use(cors());
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('server listening on port', PORT);
})

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
})

app.use('/generate-mcq', generate_mcq);