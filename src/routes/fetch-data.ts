import { Router, Request, Response } from 'express';
import { generateQuery } from '../usecases/schemaBasedLLM';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {

        const { expression } = req.body;
        if (!expression) {
            res.status(400).send({message: 'Expression is required!'});
            return;
        }
        const response: string = await generateQuery(expression);
        if (!response) {
            res.status(500).send({message: 'Something went wrong, try again later'})
        }
        if (response === 'undefined') {
            res.status(400).send({message: 'Invalid expression!'});        
        }
        else {
            res.status(200).send(response)
        }
    
    } catch (error) {
        console.log('INTERNAL SERVER ERROR:');
        console.log(error);
        res.status(500).send({message: 'Something went wrong, try again later'})
    }
});


export default router;