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

export interface Session {
    id: string;
    title: string;
    duration: number; // in minutes
    videoUrl: string;
    thumbnailUrl: string;
    createdAt: string;
    order?: number;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string; // Firestore timestamp converted to ISO string
    heightFeet: number;
    heightInches: number;
    weightPounds: number;
    experienceLevel: "Beginner" | "Intermediate" | "Advanced";
    goals: string[];
    currentProgramId: string;
    currentDayNumber: number;
    joinedDate: string; // Firestore timestamp converted to ISO string
    lastCompletionDate?: string; // Firestore timestamp converted to ISO string
    updatedAt?: string; // Firestore timestamp converted to ISO string
}
