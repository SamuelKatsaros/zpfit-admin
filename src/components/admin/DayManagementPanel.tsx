"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { Day } from "@/types";
import DayFormModal, { DayFormData } from "./DayFormModal";

interface DayManagementPanelProps {
    programId: string;
    days: Day[];
    onDaysChange: () => void;
}

export default function DayManagementPanel({
    programId,
    days,
    onDaysChange,
}: DayManagementPanelProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [editingDay, setEditingDay] = useState<Day | null>(null);
    const [isAddingWeek, setIsAddingWeek] = useState(false);

    const handleAddDay = () => {
        setModalMode("add");
        setEditingDay(null);
        setIsModalOpen(true);
    };

    const handleEditDay = (day: Day) => {
        setModalMode("edit");
        setEditingDay(day);
        setIsModalOpen(true);
    };

    const handleDeleteDay = async (day: Day) => {
        if (!confirm(`Are you sure you want to delete "${day.title}"?`)) return;

        try {
            const response = await fetch(
                `/api/admin/programs/${programId}/days/${day.id}`,
                { method: "DELETE" }
            );

            if (!response.ok) throw new Error("Failed to delete day");
            onDaysChange();
        } catch (error) {
            console.error("Error deleting day:", error);
            alert("Failed to delete day. Please try again.");
        }
    };

    const handleAddWeek = async () => {
        if (!confirm("This will add 7 new days to the program. Continue?")) return;

        setIsAddingWeek(true);
        try {
            const response = await fetch(`/api/admin/programs/${programId}/days`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count: 7 }),
            });

            if (!response.ok) throw new Error("Failed to add week");
            onDaysChange();
        } catch (error) {
            console.error("Error adding week:", error);
            alert("Failed to add week. Please try again.");
        } finally {
            setIsAddingWeek(false);
        }
    };

    const handleSubmitDay = async (data: DayFormData) => {
        try {
            if (modalMode === "add") {
                const response = await fetch(`/api/admin/programs/${programId}/days`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) throw new Error("Failed to create day");
            } else if (editingDay) {
                const response = await fetch(
                    `/api/admin/programs/${programId}/days/${editingDay.id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    }
                );

                if (!response.ok) throw new Error("Failed to update day");
            }

            setIsModalOpen(false);
            onDaysChange();
        } catch (error) {
            console.error("Error submitting day:", error);
            throw error;
        }
    };

    return (
        <>
            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={handleAddDay}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Add Day
                </button>
                <button
                    onClick={handleAddWeek}
                    disabled={isAddingWeek}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Calendar className="w-5 h-5" />
                    {isAddingWeek ? "Adding..." : "Add Week (7 Days)"}
                </button>
            </div>

            {/* Days List */}
            {days.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 mb-4">No days in this program yet.</p>
                    <p className="text-sm text-gray-400">
                        Click "Add Day" to create your first day, or "Add Week" to add 7 days at once.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {days.map((day) => (
                        <div
                            key={day.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                        {day.thumbnailUrl && (
                                            <img
                                                src={day.thumbnailUrl}
                                                alt={day.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                            Day {day.dayNumber}: {day.title}
                                        </h3>
                                        {day.description && (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                                {day.description}
                                            </p>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            {day.exercises.length}{" "}
                                            {day.exercises.length === 1 ? "exercise" : "exercises"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditDay(day)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            title="Edit day"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDay(day)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Delete day"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Exercises */}
                                {day.exercises.length > 0 && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                            Exercises:
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {day.exercises.map((exercise, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                                >
                                                    <span className="font-mono text-sm text-gray-500 w-6">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                                                        {exercise.thumbnailUrl ? (
                                                            <img
                                                                src={exercise.thumbnailUrl}
                                                                alt={exercise.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                                <Edit className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                            {exercise.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {[
                                                                exercise.sets && exercise.reps && `${exercise.sets} sets × ${exercise.reps} reps`,
                                                                exercise.time && `${exercise.time}s`,
                                                                exercise.distance && `${exercise.distance}m`
                                                            ].filter(Boolean).join(" • ") || "No details"}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <DayFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitDay}
                mode={modalMode}
                initialData={
                    editingDay
                        ? {
                            title: editingDay.title,
                            description: editingDay.description,
                            thumbnailUrl: editingDay.thumbnailUrl,
                            duration: editingDay.duration,
                            exercises: editingDay.exercises,
                        }
                        : undefined
                }
            />
        </>
    );
}
