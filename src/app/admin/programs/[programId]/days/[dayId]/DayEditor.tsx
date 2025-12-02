"use client";

import { useState } from "react";
import { Day, Exercise } from "@/types";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";

export default function DayEditor({
    programId,
    day,
    allExercises,
}: {
    programId: string;
    day: Day;
    allExercises: Exercise[];
}) {
    const router = useRouter();
    const [title, setTitle] = useState(day.title);
    const [thumbnailUrl, setThumbnailUrl] = useState(day.thumbnailUrl);
    const [duration, setDuration] = useState<number>(day.duration || 30);
    const [exerciseIds, setExerciseIds] = useState<string[]>(day.exerciseIds || []);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Helper to get full exercise objects for display
    const selectedExercises = exerciseIds
        .map((id) => allExercises.find((e) => e.id === id))
        .filter((e): e is Exercise => !!e);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/programs/${programId}/days/${day.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    thumbnailUrl,
                    exerciseIds,
                    duration,
                }),
            });

            if (res.ok) {
                alert("Day updated");
                router.refresh();
            } else {
                alert("Failed to update day");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating day");
        } finally {
            setLoading(false);
        }
    };

    const addExercise = (id: string) => {
        setExerciseIds([...exerciseIds, id]);
        setIsAdding(false);
    };

    const removeExercise = (index: number) => {
        const newIds = [...exerciseIds];
        newIds.splice(index, 1);
        setExerciseIds(newIds);
    };

    const moveExercise = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === exerciseIds.length - 1)
        ) {
            return;
        }

        const newIds = [...exerciseIds];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
        setExerciseIds(newIds);
    };

    return (
        <div className="space-y-8">
            {/* Day Details Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Day Details</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (min)
                    </label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        min={1}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Thumbnail
                    </label>
                    <ImageUploader
                        folder={`programs/${programId}/days`}
                        currentImage={thumbnailUrl}
                        onUploadComplete={setThumbnailUrl}
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exercises</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Exercise
                    </button>
                </div>

                {selectedExercises.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                        No exercises added to this day yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {selectedExercises.map((exercise, index) => (
                            <div
                                key={`${exercise.id}-${index}`}
                                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4"
                            >
                                <span className="font-mono text-gray-400 w-6 text-center">{index + 1}</span>
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                    {exercise.thumbnailUrl && (
                                        <img
                                            src={exercise.thumbnailUrl}
                                            alt={exercise.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{exercise.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {exercise.sets} sets x {exercise.reps} reps
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => moveExercise(index, "up")}
                                        disabled={index === 0}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => moveExercise(index, "down")}
                                        disabled={index === exerciseIds.length - 1}
                                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => removeExercise(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Exercise Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Exercise</h3>
                            <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-700">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allExercises.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    onClick={() => addExercise(exercise.id)}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-colors"
                                >
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                        {exercise.thumbnailUrl && (
                                            <img
                                                src={exercise.thumbnailUrl}
                                                alt={exercise.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{exercise.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {exercise.sets}x{exercise.reps}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
