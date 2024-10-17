export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}
export interface IPatient extends Document {
    petName?: string;
    petType?: string;
    ownerName?: string;
    ownerAddress?: string;
    ownerPhone?: string;
}
export interface IAppointment extends Document {
    patient?: IPatient;
    appointmentStartTime?: Date;
    appointmentEndTime?: Date;
    description?: string;
    feeAmount?: number;
    feeStatus?: string;
}