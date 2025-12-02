import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getFirestore();

        await db.collection("sessions").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();
        const db = await getFirestore();

        await db.collection("sessions").doc(id).update(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating session:", error);
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }
}
