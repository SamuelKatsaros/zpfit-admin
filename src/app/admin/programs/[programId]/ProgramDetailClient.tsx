"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Program, Day } from "@/types";
import DayManagementPanel from "@/components/admin/DayManagementPanel";
import ProgramEditModal, { ProgramFormData } from "@/components/admin/ProgramEditModal";

interface ProgramDetailClientProps {
    program: Program;
    initialDays: Day[];
}

export default function ProgramDetailClient({
    program: initialProgram,
    initialDays,
}: ProgramDetailClientProps) {
    const router = useRouter();
    const [program, setProgram] = useState<Program>(initialProgram);
    const [days, setDays] = useState<Day[]>(initialDays);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const refreshDays = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch(`/api/admin/programs/${program.id}/days-list`);
            if (response.ok) {
                const data = await response.json();
                setDays(data.days);
            }
        } catch (error) {
            console.error("Error refreshing days:", error);
            window.location.reload();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDeleteProgram = async () => {
        if (!confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/programs/${program.id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete program");

            router.push("/admin");
            router.refresh();
        } catch (error) {
            console.error("Error deleting program:", error);
            alert("Failed to delete program");
        }
    };

    const handleUpdateProgram = async (data: ProgramFormData) => {
        try {
            const response = await fetch(`/api/admin/programs/${program.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to update program");

            const updatedProgram = await response.json();
            setProgram(updatedProgram);
            router.refresh();
        } catch (error) {
            console.error("Error updating program:", error);
            alert("Failed to update program");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/admin"
                    className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Programs
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Program
                    </button>
                    <button
                        onClick={handleDeleteProgram}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Program
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <div className="flex items-start gap-6">
                    <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {program.thumbnailUrl && (
                            <img
                                src={program.thumbnailUrl}
                                alt={program.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {program.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {program.description}
                        </p>
                        <div className="text-sm text-gray-500">
                            {days.length} {days.length === 1 ? "day" : "days"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Days Management Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Days</h2>
                <DayManagementPanel
                    programId={program.id}
                    days={days}
                    onDaysChange={refreshDays}
                />
            </div>

            {isRefreshing && (
                <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    Refreshing...
                </div>
            )}

            <ProgramEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateProgram}
                initialData={{
                    name: program.name,
                    description: program.description,
                    thumbnailUrl: program.thumbnailUrl,
                    difficulty: program.difficulty || "Intermediate",
                }}
            />
        </div>
    );
}
