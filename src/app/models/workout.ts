import { WorkoutData } from '../models/workoutData'

export class Workout {
    _id: string;
    name: string;
    category: string;
    description: string;
    goals: string;
    duration: number;
    tss: number;
    data: WorkoutData[];
}

