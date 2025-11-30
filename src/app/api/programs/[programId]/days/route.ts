import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { programId: string } }
) {
    try {
        const { title, thumbnailUrl, dayNumber } = await request.json();
        const db = await getFirestore();

        const docRef = await db
            .collection("programs")
            .doc(params.programId)
            .collection("days")
            .add({
                title,
                thumbnailUrl,
                dayNumber,
                exerciseIds: [],
            });

        return NextResponse.json({ id: docRef.id, title, thumbnailUrl, dayNumber, exerciseIds: [] });
    } catch (error) {
        console.error("Error adding day:", error);
        return NextResponse.json({ error: "Failed to add day" }, { status: 500 });
    }
}
