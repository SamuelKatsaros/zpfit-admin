import { getFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const body = await request.json();
        const { name, description, thumbnailUrl, difficulty } = body;

        const db = await getFirestore();
        const programRef = db.collection("programs").doc(programId);

        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
        if (difficulty !== undefined) updateData.difficulty = difficulty;

        await programRef.update(updateData);

        const updatedDoc = await programRef.get();
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        console.error("Error updating program:", error);
        return NextResponse.json(
            { error: "Failed to update program" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const db = await getFirestore();

        // Note: In a production app, we should recursively delete subcollections (days, exercises)
        // For now, we'll just delete the program document
        await db.collection("programs").doc(programId).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting program:", error);
        return NextResponse.json(
            { error: "Failed to delete program" },
            { status: 500 }
        );
    }
}
