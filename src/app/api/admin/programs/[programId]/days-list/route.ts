import { getFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { Day } from "@/types";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const db = await getFirestore();

        const snapshot = await db
            .collection("programs")
            .doc(programId)
            .collection("days")
            .orderBy("dayNumber", "asc")
            .get();

        const days = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Day[];

        return NextResponse.json({ days });
    } catch (error) {
        console.error("Error fetching days:", error);
        return NextResponse.json(
            { error: "Failed to fetch days" },
            { status: 500 }
        );
    }
}
