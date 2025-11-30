"use client";

import { useState } from "react";
import { Program } from "@/types";
import ImageUploader from "@/components/ui/ImageUploader";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditProgramForm({ program }: { program: Program }) {
    const router = useRouter();
    const [name, setName] = useState(program.name);
    const [description, setDescription] = useState(program.description);
    const [thumbnailUrl, setThumbnailUrl] = useState(program.thumbnailUrl);
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/programs/${program.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, thumbnailUrl }),
            });

            if (res.ok) {
                router.refresh();
                alert("Program updated");
            } else {
                alert("Failed to update program");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating program");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this program?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/programs/${program.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                alert("Failed to delete program");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting program");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
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
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Thumbnail
                </label>
                <ImageUploader
                    folder="programs"
                    currentImage={thumbnailUrl}
                    onUploadComplete={setThumbnailUrl}
                />
            </div>
            <div className="flex flex-col gap-2 pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Delete Program
                </button>
            </div>
        </form>
    );
}
