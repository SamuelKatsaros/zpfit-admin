import { getFirestore } from "@/lib/firebase-admin";
import { Program, Day } from "@/types";
import { notFound } from "next/navigation";
import ProgramDetailClient from "@/app/admin/programs/[programId]/ProgramDetailClient";

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
    params: Promise<{ programId: string }>;
}) {
    const { programId } = await params;
    const program = await getProgram(programId);
    const days = await getDays(programId);

    if (!program) notFound();

    return <ProgramDetailClient program={program} initialDays={days} />;
}
