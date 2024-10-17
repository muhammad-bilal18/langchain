import { Router, Request, Response } from 'express';
import { chatWithDocsLocally } from '../usecases/chatWithLocalDocuments';
// import { chatWithCloudDocuments } from '../usecases/chatWithCloudDocuments';
// import { File } from '../models/doc';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { _id, question } = req.body;
        if (!question) {
            res.status(400).send({ message: 'Question is required!' });
            return;
        }
        const file = true // req.file;
        if (file) {
            const stream = await chatWithDocsLocally(question, 'docx', 'src/documents/my-qa.docx');            
            const [logStream, responseStream] = stream.tee();
            const logReader = logStream.getReader();
            console.log('\n');
            while (true) {
                const { done, value } = await logReader.read();
                if (done) {
                    break;
                }
                if (value.answer) process.stdout.write(value.answer);
            }
            res
                .header('Content-Type', 'text/event-stream')
                .header('Cache-Control', 'no-cache')
                .header('Connection', 'keep-alive')
                .send(responseStream);
            return;
        }
        // else {
        //     if (!_id) {
        //         res.status(400).send({ message: 'Document ID is required for cloud chatting!' });
        //         return;
        //     }

        //     const fileDocument = await File.findById(_id); // spicific document to chat from db
        //     if (!fileDocument) {
        //         res.status(404).send({ message: 'Document not found!' });
        //         return;
        //     }

        //     const response = await chatWithCloudDocuments(question); // can initiate chat with any cloud document
        //     res.status(200).send({ answer: response });

        // }

    } catch (error) {
        console.error('Error in chat with documents:', error);
        res.status(500).send({ message: 'Something went wrong, try again later' });
    }
});

export default router;