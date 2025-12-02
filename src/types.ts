export interface Program {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    createdAt: string;
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export interface Exercise {
    id: string;
    name: string;
    sets?: number;
    reps?: number;
    time?: number;
    distance?: number;
    videoUrl: string;
    thumbnailUrl: string;
}

export interface Day {
    id: string;
    dayNumber: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    duration?: number; // in minutes
    exercises: Exercise[]; // Embedded exercises, not IDs
    exerciseIds?: string[]; // IDs of exercises
}
