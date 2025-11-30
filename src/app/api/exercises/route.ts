import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const db = await getFirestore();

        const docRef = await db.collection("exercises").add({
            ...data,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error("Error creating exercise:", error);
        return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
    }
}
