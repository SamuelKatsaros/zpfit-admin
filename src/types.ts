export interface Program {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string;
    createdAt: string;
}

export interface Day {
    id: string;
    dayNumber: number;
    title: string;
    thumbnailUrl: string;
    exerciseIds: string[];
}

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    time?: number;
    distance?: number;
    videoUrl: string;
    thumbnailUrl: string;
}
