"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Exercise } from "@/types";
import ImageUploader from "@/components/ui/ImageUploader";
import VideoUploader from "@/components/ui/VideoUploader";
import { v4 as uuidv4 } from "uuid";

interface DayFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DayFormData) => Promise<void>;
    initialData?: DayFormData;
    mode: "add" | "edit";
}

export interface DayFormData {
    title: string;
    description: string;
    thumbnailUrl: string;
    duration?: number;
    exercises: Exercise[];
}

export default function DayFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
}: DayFormModalProps) {
    const [formData, setFormData] = useState<DayFormData>(
        initialData || {
            title: "",
            description: "",
            thumbnailUrl: "",
            duration: 30,
            exercises: [],
        }
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            setFormData(
                initialData || {
                    title: "",
                    description: "",
                    thumbnailUrl: "",
                    duration: 30,
                    exercises: [],
                }
            );
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addExercise = () => {
        setFormData({
            ...formData,
            exercises: [
                ...formData.exercises,
                {
                    id: uuidv4(),
                    name: "",
                    sets: undefined,
                    reps: undefined,
                    videoUrl: "",
                    thumbnailUrl: "",
                },
            ],
        });
    };

    const removeExercise = (index: number) => {
        setFormData({
            ...formData,
            exercises: formData.exercises.filter((_, i) => i !== index),
        });
    };

    const updateExercise = (index: number, field: keyof Exercise, value: any) => {
        const updatedExercises = [...formData.exercises];
        updatedExercises[index] = { ...updatedExercises[index], [field]: value };
        setFormData({ ...formData, exercises: updatedExercises });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mode === "add" ? "Add New Day" : "Edit Day"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Day Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={formData.duration || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        duration: e.target.value ? parseInt(e.target.value) : undefined,
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Thumbnail Image
                            </label>
                            <ImageUploader
                                folder="days"
                                currentImage={formData.thumbnailUrl}
                                onUploadComplete={(url) =>
                                    setFormData({ ...formData, thumbnailUrl: url })
                                }
                            />
                        </div>

                        {/* Exercises */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Exercises
                                </h3>
                                <button
                                    type="button"
                                    onClick={addExercise}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Exercise
                                </button>
                            </div>

                            {formData.exercises.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500">
                                    No exercises yet. Click "Add Exercise" to get started.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.exercises.map((exercise, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className="font-mono text-sm text-gray-500 mt-2">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={exercise.name}
                                                            onChange={(e) =>
                                                                updateExercise(index, "name", e.target.value)
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Sets (optional)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={exercise.sets ?? ""}
                                                            onChange={(e) =>
                                                                updateExercise(
                                                                    index,
                                                                    "sets",
                                                                    e.target.value ? parseInt(e.target.value) : undefined
                                                                )
                                                            }
                                                            placeholder="e.g., 3"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Reps (optional)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={exercise.reps ?? ""}
                                                            onChange={(e) =>
                                                                updateExercise(
                                                                    index,
                                                                    "reps",
                                                                    e.target.value ? parseInt(e.target.value) : undefined
                                                                )
                                                            }
                                                            placeholder="e.g., 10"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Time (seconds, optional)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={exercise.time ?? ""}
                                                            onChange={(e) =>
                                                                updateExercise(
                                                                    index,
                                                                    "time",
                                                                    e.target.value ? parseInt(e.target.value) : undefined
                                                                )
                                                            }
                                                            placeholder="e.g., 3600 (1 hour)"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Distance (meters, optional)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={exercise.distance ?? ""}
                                                            onChange={(e) =>
                                                                updateExercise(
                                                                    index,
                                                                    "distance",
                                                                    e.target.value ? parseInt(e.target.value) : undefined
                                                                )
                                                            }
                                                            placeholder="e.g., 8047 (5 miles)"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Exercise Video
                                                        </label>
                                                        <VideoUploader
                                                            currentVideo={exercise.videoUrl}
                                                            onUploadComplete={(url) =>
                                                                updateExercise(index, "videoUrl", url)
                                                            }
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Exercise Thumbnail
                                                        </label>
                                                        <ImageUploader
                                                            folder="exercises"
                                                            currentImage={exercise.thumbnailUrl}
                                                            onUploadComplete={(url) =>
                                                                updateExercise(index, "thumbnailUrl", url)
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExercise(index)}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addExercise}
                                        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Another Exercise
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : mode === "add" ? "Add Day" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
