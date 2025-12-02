
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";

export interface ProgramFormData {
    name: string;
    description: string;
    thumbnailUrl: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface ProgramEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProgramFormData) => Promise<void>; // Kept as Promise<void> to match original behavior
    initialData: ProgramFormData;
}

export default function ProgramEditModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: ProgramEditModalProps) {
    const [name, setName] = useState(initialData.name);
    const [description, setDescription] = useState(initialData.description);
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData.thumbnailUrl);
    const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
        initialData.difficulty || "Intermediate"
    );
    const [loading, setLoading] = useState(false);

    // Reset form when initialData changes or modal opens
    useEffect(() => {
        setName(initialData.name);
        setDescription(initialData.description);
        setThumbnailUrl(initialData.thumbnailUrl);
        setDifficulty(initialData.difficulty || "Intermediate");
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ name, description, thumbnailUrl, difficulty });
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Program</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Program Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Difficulty
                        </label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
                            className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Thumbnail Image
                        </label>
                        <ImageUploader
                            folder="programs"
                            currentImage={thumbnailUrl}
                            onUploadComplete={setThumbnailUrl}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
