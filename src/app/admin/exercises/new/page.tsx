"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ui/ImageUploader";
import VideoUploader from "@/components/ui/VideoUploader";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewExercisePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [sets, setSets] = useState(0);
    const [reps, setReps] = useState(0);
    const [time, setTime] = useState(0);
    const [distance, setDistance] = useState(0);
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoUrl) {
            alert("Please upload a video");
            return;
        }
        if (!thumbnailUrl) {
            alert("Please upload a thumbnail");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/exercises", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    sets,
                    reps,
                    time,
                    distance,
                    thumbnailUrl,
                    videoUrl,
                }),
            });

            if (res.ok) {
                router.push("/admin/exercises");
            } else {
                alert("Failed to create exercise");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating exercise");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link
                href="/admin/exercises"
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exercises
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Create New Exercise
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Exercise Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
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
                            Time (seconds)
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
                            Distance (meters)
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
                    <VideoUploader
                        onUploadComplete={setVideoUrl}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Thumbnail
                    </label>
                    <ImageUploader
                        folder="exercises"
                        onUploadComplete={setThumbnailUrl}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        ) : null}
                        Create Exercise
                    </button>
                </div>
            </form>
        </div>
    );
}
