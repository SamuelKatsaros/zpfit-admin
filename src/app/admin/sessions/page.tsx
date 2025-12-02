"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Loader2 } from "lucide-react";
import VideoUploader from "@/components/ui/VideoUploader";
import ImageUploader from "@/components/ui/ImageUploader";
import { Session } from "@/types";

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        duration: 0,
        videoUrl: "",
        thumbnailUrl: "",
        order: 0
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const res = await fetch("/api/sessions");
            const data = await res.json();
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.videoUrl || !formData.thumbnailUrl) {
            alert("Please fill in all required fields");
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({
                    title: "",
                    duration: 0,
                    videoUrl: "",
                    thumbnailUrl: "",
                    order: 0
                });
                setShowForm(false);
                loadSessions();
            } else {
                alert("Failed to create session");
            }
        } catch (error) {
            console.error("Error creating session:", error);
            alert("Failed to create session");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this session?")) return;

        try {
            const res = await fetch(`/api/sessions/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                loadSessions();
            } else {
                alert("Failed to delete session");
            }
        } catch (error) {
            console.error("Error deleting session:", error);
            alert("Failed to delete session");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sessions</h1>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? "Cancel" : "New Session"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Create Session
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., 10 Min Core Blaster"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., 10"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Order (optional)
                            </label>
                            <input
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="0"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Lower numbers appear first. Defaults to creation date order.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Thumbnail Image *
                            </label>
                            <ImageUploader
                                folder="sessions"
                                currentImage={formData.thumbnailUrl}
                                onUploadComplete={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Session Video *
                            </label>
                            <VideoUploader
                                currentVideo={formData.videoUrl}
                                onUploadComplete={(url) => setFormData({ ...formData, videoUrl: url })}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center transition-colors"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Session"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                            {session.thumbnailUrl ? (
                                <img
                                    src={session.thumbnailUrl}
                                    alt={session.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <Clock className="w-8 h-8" />
                                </div>
                            )}
                            <button
                                onClick={() => handleDelete(session.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                title="Delete session"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {session.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4 mr-1" />
                                {session.duration} min
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {sessions.length === 0 && !showForm && (
                <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No sessions yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Get started by creating your first workout session
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Session
                    </button>
                </div>
            )}
        </div>
    );
}
