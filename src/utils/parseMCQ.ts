import { QuizQuestion } from "../lib/types";


export function parseMCQ(input: string): QuizQuestion {
    const [questionPart, optionsPart, correctAnswerPart, explanationPart] = input.split(/\n\n+/);
  
    const question = questionPart.replace('Question: ', '');
  
    const options = optionsPart.split('\n').map(option => option.trim());
  
    const correctAnswer = correctAnswerPart.replace('Correct Answer: ', '');
  
    const explanation = explanationPart.replace('Explanation: ', '');
  
    const quiz: QuizQuestion = {
      question,
      options,
      correctAnswer,
      explanation
    };
  
    return quiz;
}