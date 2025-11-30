import { getFirestore } from "@/lib/firebase-admin";
import { Program, Day } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import ImageUploader from "@/components/ui/ImageUploader";
import EditProgramForm from "./EditProgramForm";
import DayList from "./DayList";

async function getProgram(id: string) {
    const db = await getFirestore();
    const doc = await db.collection("programs").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Program;
}

async function getDays(programId: string) {
    const db = await getFirestore();
    const snapshot = await db
        .collection("programs")
        .doc(programId)
        .collection("days")
        .orderBy("dayNumber", "asc")
        .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Day));
}

export default async function ProgramDetailPage({
    params,
}: {
    params: { programId: string };
}) {
    const program = await getProgram(params.programId);
    const days = await getDays(params.programId);

    if (!program) notFound();

    return (
        <div className="max-w-4xl mx-auto">
            <Link
                href="/admin"
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Programs
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Program Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Program Details</h2>
                        <EditProgramForm program={program} />
                    </div>
                </div>

                {/* Right Column: Days */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Days</h2>
                        {/* Add Day Button handled in DayList or separate component */}
                    </div>

                    <DayList programId={program.id} initialDays={days} />
                </div>
            </div>
        </div>
    );
}
