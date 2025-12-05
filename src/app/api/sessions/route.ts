import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const db = await getFirestore();

        // Get current max order to set new order
        const snapshot = await db.collection("sessions").orderBy("order", "desc").limit(1).get();
        const maxOrder = snapshot.empty ? -1 : (snapshot.docs[0].data().order ?? -1);
        const newOrder = maxOrder + 1;

        const docRef = await db.collection("sessions").add({
            ...data,
            order: newOrder,
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
            .get();

        const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort by order field (ascending), then by createdAt (descending) for sessions without order
        sessions.sort((a: any, b: any) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            if (a.order !== undefined) return -1;
            if (b.order !== undefined) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}
