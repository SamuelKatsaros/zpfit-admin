import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { programId: string; dayId: string } }
) {
    try {
        const { title, thumbnailUrl, exerciseIds } = await request.json();
        const db = await getFirestore();

        await db
            .collection("programs")
            .doc(params.programId)
            .collection("days")
            .doc(params.dayId)
            .update({
                title,
                thumbnailUrl,
                exerciseIds,
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating day:", error);
        return NextResponse.json({ error: "Failed to update day" }, { status: 500 });
    }
}
