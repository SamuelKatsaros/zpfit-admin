import Link from "next/link";
import { Plus, Video } from "lucide-react";
import { getFirestore } from "@/lib/firebase-admin";
import { Exercise } from "@/types";

async function getExercises() {
    const db = await getFirestore();
    const snapshot = await db.collection("exercises").orderBy("name", "asc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
}

export default async function ExercisesPage() {
    const exercises = await getExercises();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exercises</h1>
                <Link
                    href="/admin/exercises/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Exercise
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((exercise) => (
                    <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                            {exercise.thumbnailUrl ? (
                                <img
                                    src={exercise.thumbnailUrl}
                                    alt={exercise.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <Video className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {exercise.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                                {exercise.sets != null && exercise.sets > 0 && <span>{exercise.sets} sets</span>}
                                {exercise.reps != null && exercise.reps > 0 && <span>{exercise.reps} reps</span>}
                                {exercise.time != null && exercise.time > 0 && <span>{exercise.time}s</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
