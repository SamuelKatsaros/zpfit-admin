import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const { name, description, thumbnailUrl, difficulty } = await request.json();
        const db = await getFirestore();

        await db.collection("programs").doc(programId).update({
            name,
            description,
            thumbnailUrl,
            difficulty,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating program:", error);
        return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const db = await getFirestore();
        await db.collection("programs").doc(programId).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting program:", error);
        return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
    }
}
