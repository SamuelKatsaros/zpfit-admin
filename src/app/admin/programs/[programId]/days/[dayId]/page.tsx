import { getFirestore } from "@/lib/firebase-admin";
import { Day, Exercise } from "@/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DayEditor from "./DayEditor";

async function getDay(programId: string, dayId: string) {
    const db = await getFirestore();
    const doc = await db
        .collection("programs")
        .doc(programId)
        .collection("days")
        .doc(dayId)
        .get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Day;
}

async function getAllExercises() {
    const db = await getFirestore();
    const snapshot = await db.collection("exercises").orderBy("name", "asc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Exercise));
}

export default async function DayEditorPage({
    params,
}: {
    params: { programId: string; dayId: string };
}) {
    const day = await getDay(params.programId, params.dayId);
    const exercises = await getAllExercises();

    if (!day) notFound();

    return (
        <div className="max-w-4xl mx-auto">
            <Link
                href={`/admin/programs/${params.programId}`}
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Program
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Edit Day {day.dayNumber}: {day.title}
            </h1>

            <DayEditor
                programId={params.programId}
                day={day}
                allExercises={exercises}
            />
        </div>
    );
}
