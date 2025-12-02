"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/ui/ImageUploader";
import VideoUploader from "@/components/ui/VideoUploader";
import { Exercise, Day } from "@/types";
import { v4 as uuidv4 } from "uuid";

export default function NewProgramPage() {
    const router = useRouter();

    // Step 1: Program Details
    const [programName, setProgramName] = useState("");
    const [programDescription, setProgramDescription] = useState("");
    const [programThumbnail, setProgramThumbnail] = useState("");
    const [programDifficulty, setProgramDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");

    // Step 2: Days and Exercises
    const [days, setDays] = useState<Omit<Day, "id">[]>([]);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);

    // Add a new day
    const addDay = () => {
        const newDay: Omit<Day, "id"> = {
            dayNumber: days.length + 1,
            title: "",
            description: "",
            thumbnailUrl: "",
            duration: 30,
            exercises: [],
        };
        setDays([...days, newDay]);
        setExpandedDay(days.length); // Auto-expand the new day
    };

    // Update day field
    const updateDay = (index: number, field: keyof Omit<Day, "id" | "exercises">, value: string | number) => {
        const updated = [...days];
        updated[index] = { ...updated[index], [field]: value };
        setDays(updated);
    };

    // Add exercise to a day
    const addExerciseToDay = (dayIndex: number, exercise: Exercise) => {
        const updated = [...days];
        updated[dayIndex].exercises.push(exercise);
        setDays(updated);
    };

    // Remove exercise from day
    const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
        const updated = [...days];
        updated[dayIndex].exercises.splice(exerciseIndex, 1);
        setDays(updated);
    };

    // Remove day
    const removeDay = (index: number) => {
        const updated = days.filter((_, i) => i !== index);
        // Renumber days
        updated.forEach((day, i) => {
            day.dayNumber = i + 1;
        });
        setDays(updated);
        setExpandedDay(null);
    };

    // Submit entire program
    const handleSubmit = async () => {
        if (!programName || !programDescription || !programThumbnail) {
            alert("Please fill in all program details");
            return;
        }

        if (days.length === 0) {
            alert("Please add at least one day to the program");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: programName,
                    description: programDescription,
                    thumbnailUrl: programThumbnail,
                    difficulty: programDifficulty,
                    days,
                }),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                alert("Failed to create program");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating program");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/admin"
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Programs
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Create New Program
            </h1>

            {/* Step 1: Program Details */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Program Details</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Program Name
                        </label>
                        <input
                            type="text"
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., 8-Week Strength Builder"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={programDescription}
                            onChange={(e) => setProgramDescription(e.target.value)}
                            rows={3}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Describe the program..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Difficulty
                        </label>
                        <select
                            value={programDifficulty}
                            onChange={(e) => setProgramDifficulty(e.target.value as any)}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Thumbnail
                        </label>
                        <ImageUploader
                            folder="programs"
                            onUploadComplete={setProgramThumbnail}
                        />
                    </div>
                </div>
            </div>

            {/* Step 2: Days */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Days</h2>
                    <button
                        onClick={addDay}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Day
                    </button>
                </div>

                {days.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        No days added yet. Click "Add Day" to start building your program.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {days.map((day, dayIndex) => (
                            <DayAccordion
                                key={dayIndex}
                                day={day}
                                dayIndex={dayIndex}
                                isExpanded={expandedDay === dayIndex}
                                onToggle={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                                onUpdate={updateDay}
                                onAddExercise={addExerciseToDay}
                                onRemoveExercise={removeExerciseFromDay}
                                onRemoveDay={removeDay}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                        Create Program ({days.length} {days.length === 1 ? "day" : "days"})
                    </button>
                </div>
            </div>
        </div>
    );
}

// Day Accordion Component
function DayAccordion({
    day,
    dayIndex,
    isExpanded,
    onToggle,
    onUpdate,
    onAddExercise,
    onRemoveExercise,
    onRemoveDay,
}: {
    day: Omit<Day, "id">;
    dayIndex: number;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (index: number, field: keyof Omit<Day, "id" | "exercises">, value: string | number) => void;
    onAddExercise: (dayIndex: number, exercise: Exercise) => void;
    onRemoveExercise: (dayIndex: number, exerciseIndex: number) => void;
    onRemoveDay: (index: number) => void;
}) {
    const [showExerciseForm, setShowExerciseForm] = useState(false);

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            {/* Day Header */}
            <div
                className="bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 dark:text-white">
                        Day {day.dayNumber}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        {day.title || "Untitled"}
                    </span>
                    <span className="text-sm text-gray-500">
                        ({day.exercises.length} {day.exercises.length === 1 ? "exercise" : "exercises"})
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveDay(dayIndex);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>

            {/* Day Content */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Day Title
                        </label>
                        <input
                            type="text"
                            value={day.title}
                            onChange={(e) => onUpdate(dayIndex, "title", e.target.value)}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., Upper Body Power"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration (min)
                        </label>
                        <input
                            type="number"
                            value={day.duration || 30}
                            onChange={(e) => onUpdate(dayIndex, "duration", Number(e.target.value))}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            min={1}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={day.description}
                            onChange={(e) => onUpdate(dayIndex, "description", e.target.value)}
                            rows={2}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Describe this day's workout..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Thumbnail
                        </label>
                        <ImageUploader
                            folder={`programs/day-${day.dayNumber}`}
                            currentImage={day.thumbnailUrl}
                            onUploadComplete={(url) => onUpdate(dayIndex, "thumbnailUrl", url)}
                        />
                    </div>

                    {/* Exercises */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Exercises
                            </label>
                            <button
                                onClick={() => setShowExerciseForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Exercise
                            </button>
                        </div>

                        {day.exercises.length === 0 ? (
                            <div className="text-sm text-gray-500 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-center">
                                No exercises added yet
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {day.exercises.map((exercise, exIndex) => (
                                    <div
                                        key={exIndex}
                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                                    >
                                        <span className="font-mono text-sm text-gray-500">{exIndex + 1}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 dark:text-white">{exercise.name}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {exercise.sets} sets × {exercise.reps} reps
                                                {exercise.time && ` • ${exercise.time}s`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveExercise(dayIndex, exIndex)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Exercise Form Modal */}
                    {showExerciseForm && (
                        <ExerciseForm
                            onSave={(exercise) => {
                                onAddExercise(dayIndex, exercise);
                                setShowExerciseForm(false);
                            }}
                            onCancel={() => setShowExerciseForm(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// Exercise Form Component
function ExerciseForm({
    onSave,
    onCancel,
}: {
    onSave: (exercise: Exercise) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState("");
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);
    const [time, setTime] = useState(0);
    const [distance, setDistance] = useState(0);
    const [videoUrl, setVideoUrl] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");



    // ... existing imports

    // ... inside ExerciseForm component

    const handleSave = () => {
        if (!name || !videoUrl || !thumbnailUrl) {
            alert("Please fill in exercise name, video, and thumbnail");
            return;
        }

        onSave({
            id: uuidv4(),
            name,
            sets,
            reps,
            time: time || undefined,
            distance: distance || undefined,
            videoUrl,
            thumbnailUrl,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Exercise</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Exercise Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., Barbell Bench Press"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sets
                            </label>
                            <input
                                type="number"
                                value={sets}
                                onChange={(e) => setSets(Number(e.target.value))}
                                className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Reps
                            </label>
                            <input
                                type="number"
                                value={reps}
                                onChange={(e) => setReps(Number(e.target.value))}
                                className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Time (seconds, optional)
                            </label>
                            <input
                                type="number"
                                value={time}
                                onChange={(e) => setTime(Number(e.target.value))}
                                className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Distance (meters, optional)
                            </label>
                            <input
                                type="number"
                                value={distance}
                                onChange={(e) => setDistance(Number(e.target.value))}
                                className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Video
                        </label>
                        <VideoUploader onUploadComplete={setVideoUrl} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Thumbnail
                        </label>
                        <ImageUploader folder="exercises" onUploadComplete={setThumbnailUrl} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                        >
                            Add Exercise
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
