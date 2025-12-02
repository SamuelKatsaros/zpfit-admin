import { getFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; dayId: string }> }
) {
    try {
        const { programId, dayId } = await params;
        const body = await request.json();
        const { dayNumber, title, description, thumbnailUrl, exercises, duration } = body;

        const db = await getFirestore();
        const dayRef = db
            .collection("programs")
            .doc(programId)
            .collection("days")
            .doc(dayId);

        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (dayNumber !== undefined) updateData.dayNumber = dayNumber;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
        if (exercises !== undefined) updateData.exercises = exercises;
        if (duration !== undefined) updateData.duration = duration;

        await dayRef.update(updateData);

        const updatedDoc = await dayRef.get();
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        console.error("Error updating day:", error);
        return NextResponse.json(
            { error: "Failed to update day" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string; dayId: string }> }
) {
    try {
        const { programId, dayId } = await params;

        const db = await getFirestore();
        const dayRef = db
            .collection("programs")
            .doc(programId)
            .collection("days")
            .doc(dayId);

        await dayRef.delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting day:", error);
        return NextResponse.json(
            { error: "Failed to delete day" },
            { status: 500 }
        );
    }
}
