"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Loader2, Pencil, GripVertical } from "lucide-react";
import VideoUploader from "@/components/ui/VideoUploader";
import ImageUploader from "@/components/ui/ImageUploader";
import { Session } from "@/types";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable session card component
function SortableSessionCard({
    session,
    onEdit,
    onDelete,
}: {
    session: Session;
    onEdit: (session: Session) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: session.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
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
                <div className="absolute top-2 right-2 flex gap-2">
                    <button
                        onClick={() => onEdit(session)}
                        className="bg-blue-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-600 transition-all"
                        title="Edit session"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(session.id)}
                        className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                        title="Delete session"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white p-2 rounded cursor-move hover:bg-opacity-90 transition-all"
                    title="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {session.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="mr-3 font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        #{session.order !== undefined ? session.order + 1 : "-"}
                    </span>
                    <Clock className="w-4 h-4 mr-1" />
                    {session.duration} min
                </div>
            </div>
        </div>
    );
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        duration: "" as string | number,
        videoUrl: "",
        thumbnailUrl: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const res = await fetch("/api/sessions");
            const data = await res.json();
            // API now handles sorting by order field
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (session: Session) => {
        setEditingSession(session);
        setFormData({
            title: session.title,
            duration: session.duration,
            videoUrl: session.videoUrl,
            thumbnailUrl: session.thumbnailUrl,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const duration = typeof formData.duration === "string"
            ? parseInt(formData.duration) || 0
            : formData.duration;

        if (!formData.title || !formData.videoUrl || !formData.thumbnailUrl || duration === 0) {
            alert("Please fill in all required fields");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                title: formData.title,
                duration,
                videoUrl: formData.videoUrl,
                thumbnailUrl: formData.thumbnailUrl,
            };

            const url = editingSession
                ? `/api/sessions/${editingSession.id}`
                : "/api/sessions";
            const method = editingSession ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setFormData({
                    title: "",
                    duration: "",
                    videoUrl: "",
                    thumbnailUrl: "",
                });
                setShowForm(false);
                setEditingSession(null);
                loadSessions();
            } else {
                alert(`Failed to ${editingSession ? "update" : "create"} session`);
            }
        } catch (error) {
            console.error(`Error ${editingSession ? "updating" : "creating"} session:`, error);
            alert(`Failed to ${editingSession ? "update" : "create"} session`);
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = sessions.findIndex((s) => s.id === active.id);
        const newIndex = sessions.findIndex((s) => s.id === over.id);

        // Reorder the sessions array
        const reorderedSessions = arrayMove(sessions, oldIndex, newIndex);

        // Update the order property for each session to match their new index
        const updatedSessions = reorderedSessions.map((session, index) => ({
            ...session,
            order: index,
        }));

        // Update local state immediately for better UX
        setSessions(updatedSessions);

        // Update order in database
        try {
            const updates = updatedSessions.map((session) => {
                return fetch(`/api/sessions/${session.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order: session.order }),
                });
            });

            await Promise.all(updates);
        } catch (error) {
            console.error("Error updating session order:", error);
            // Reload sessions to get the correct order from the server
            loadSessions();
        }
    };

    const handleCancelEdit = () => {
        setShowForm(false);
        setEditingSession(null);
        setFormData({
            title: "",
            duration: "",
            videoUrl: "",
            thumbnailUrl: "",
        });
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
                    onClick={() => {
                        if (showForm && !editingSession) {
                            setShowForm(false);
                        } else {
                            setEditingSession(null);
                            setFormData({
                                title: "",
                                duration: "",
                                videoUrl: "",
                                thumbnailUrl: "",
                            });
                            setShowForm(!showForm);
                        }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {showForm ? "Cancel" : "New Session"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {editingSession ? "Edit Session" : "Create Session"}
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
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g., 10"
                                min="1"
                                required
                            />
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
                                        {editingSession ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    editingSession ? "Update Session" : "Create Session"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sessions.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sessions.map((session) => (
                            <SortableSessionCard
                                key={session.id}
                                session={session}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

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
