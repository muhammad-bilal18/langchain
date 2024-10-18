import { Router, Request, Response } from 'express';
import { chatWithDocsLocally } from '../usecases/chatWithLocalDocuments';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { question } = req.body;
        if (!question) {
            res.status(400).send({ message: 'Question is required!' });
            return;
        }

        const stream = await chatWithDocsLocally(question, 'docx', 'src/documents/my-qa.docx');            
        const [logStream, responseStream] = stream.tee();
        const logReader = logStream.getReader();
        let answer = '';
        while (true) {
            const { done, value } = await logReader.read();
            if (done) break;
            if (value.answer) {
                process.stdout.write(value.answer);
                answer += value.answer;
            }
        }
        res.status(200).send({ stream: logStream, plaintext: answer });

    } catch (error) {
        console.error('Error in chat with documents:', error);
        res.status(500).send({ message: 'Something went wrong, try again later' });
    }
});

export default router;