import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ programId: string; dayId: string }> }
) {
    try {
        const { programId, dayId } = await params;
        const { title, thumbnailUrl, exerciseIds, duration } = await request.json();
        const db = await getFirestore();

        await db
            .collection("programs")
            .doc(programId)
            .collection("days")
            .doc(dayId)
            .update({
                title,
                thumbnailUrl,
                exerciseIds,
                duration,
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating day:", error);
        return NextResponse.json({ error: "Failed to update day" }, { status: 500 });
    }
}
