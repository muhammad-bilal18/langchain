import { Router, Request, Response } from 'express';
import { generateMCQ } from '../usecases/generate-mcq';
import { QuizQuestion } from '../lib/types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {

        const { subject, classLevel, numMCQs } = req.body;
        if (!subject || !classLevel) {
            res.status(400).send({message: 'Subject and class are required!'});
            return;
        }
        const response: QuizQuestion[] = await generateMCQ(subject, classLevel, numMCQs);
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(500).send({message: 'Something went wrong, try again later'})
        }
    
    } catch (error) {
        console.log('INTERNAL SERVER ERROR:');
        console.log(error);
        res.status(500).send({message: 'Something went wrong, try again later'})
    }
});


export default router;