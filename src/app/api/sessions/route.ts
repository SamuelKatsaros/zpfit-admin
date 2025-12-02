import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const db = await getFirestore();

        const docRef = await db.collection("sessions").add({
            ...data,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const db = await getFirestore();
        const snapshot = await db
            .collection("sessions")
            .orderBy("createdAt", "desc")
            .get();

        const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}
