import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getFirestore();

        const doc = await db.collection("users").doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const data = doc.data()!;

        // Convert Firestore timestamps to ISO strings
        const user = {
            id: doc.id,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            dateOfBirth: data.dateOfBirth?.toDate?.()?.toISOString() || data.dateOfBirth || "",
            heightFeet: data.heightFeet || 0,
            heightInches: data.heightInches || 0,
            weightPounds: data.weightPounds || 0,
            experienceLevel: data.experienceLevel || "Beginner",
            goals: data.goals || [],
            currentProgramId: data.currentProgramId || "",
            currentDayNumber: data.currentDayNumber || 0,
            joinedDate: data.joinedDate?.toDate?.()?.toISOString() || data.joinedDate || "",
            lastCompletionDate: data.lastCompletionDate?.toDate?.()?.toISOString() || data.lastCompletionDate,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        };

        // Optionally fetch completions subcollection
        const completionsSnapshot = await db
            .collection("users")
            .doc(id)
            .collection("completions")
            .get();

        const completions = completionsSnapshot.docs.map(compDoc => ({
            id: compDoc.id,
            ...compDoc.data(),
            completedAt: compDoc.data().completedAt?.toDate?.()?.toISOString() || compDoc.data().completedAt,
        }));

        return NextResponse.json({ ...user, completions });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
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

        // Update user with provided fields
        const updateData: any = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await db.collection("users").doc(id).update(updateData);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getFirestore();

        // Delete user document
        await db.collection("users").doc(id).delete();

        // Optionally delete subcollections (completions, progress, etc.)
        // Note: Firestore doesn't auto-delete subcollections, so you may want to handle this
        const completionsRef = db.collection("users").doc(id).collection("completions");
        const completionsSnapshot = await completionsRef.get();
        const deleteCompletions = completionsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteCompletions);

        const progressRef = db.collection("users").doc(id).collection("progress");
        const progressSnapshot = await progressRef.get();
        const deleteProgress = progressSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteProgress);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
