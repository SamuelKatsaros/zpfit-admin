"use client";

import { useState } from "react";
import { Day } from "@/types";
import { Plus, GripVertical } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";
import { useRouter } from "next/navigation";

export default function DayList({
    programId,
    initialDays,
}: {
    programId: string;
    initialDays: Day[];
}) {
    const router = useRouter();
    const [days, setDays] = useState(initialDays);
    const [isAdding, setIsAdding] = useState(false);
    const [newDayTitle, setNewDayTitle] = useState("");
    const [newDayThumbnail, setNewDayThumbnail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddDay = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDayThumbnail) {
            alert("Please upload a thumbnail for the day");
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`/api/programs/${programId}/days`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newDayTitle,
                    thumbnailUrl: newDayThumbnail,
                    dayNumber: days.length + 1,
                }),
            });

            if (res.ok) {
                const newDay = await res.json();
                setDays([...days, newDay]);
                setIsAdding(false);
                setNewDayTitle("");
                setNewDayThumbnail("");
                router.refresh();
            } else {
                alert("Failed to add day");
            }
        } catch (error) {
            console.error(error);
            alert("Error adding day");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {days.map((day) => (
                <div
                    key={day.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4"
                >
                    <div className="text-gray-400 cursor-move">
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        {day.thumbnailUrl && (
                            <img
                                src={day.thumbnailUrl}
                                alt={day.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Day {day.dayNumber}: {day.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {day.exerciseIds?.length || 0} Exercises
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/admin/programs/${programId}/days/${day.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Edit
                    </button>
                </div>
            ))}

            {isAdding ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-2 border-blue-500">
                    <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Add New Day</h3>
                    <form onSubmit={handleAddDay} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                value={newDayTitle}
                                onChange={(e) => setNewDayTitle(e.target.value)}
                                className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Thumbnail</label>
                            <ImageUploader
                                folder={`programs/${programId}/days`}
                                onUploadComplete={setNewDayThumbnail}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                                {loading ? "Adding..." : "Add Day"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Day
                </button>
            )}
        </div>
    );
}
