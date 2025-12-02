import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const { title, thumbnailUrl, dayNumber, duration } = await request.json();
        const db = await getFirestore();

        const docRef = await db
            .collection("programs")
            .doc(programId)
            .collection("days")
            .add({
                title,
                thumbnailUrl,
                dayNumber,
                duration,
                exerciseIds: [],
            });

        return NextResponse.json({ id: docRef.id, title, thumbnailUrl, dayNumber, duration, exerciseIds: [] });
    } catch (error) {
        console.error("Error adding day:", error);
        return NextResponse.json({ error: "Failed to add day" }, { status: 500 });
    }
}
