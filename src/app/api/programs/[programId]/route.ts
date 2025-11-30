import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: { programId: string } }
) {
    try {
        const { name, description, thumbnailUrl } = await request.json();
        const db = await getFirestore();

        await db.collection("programs").doc(params.programId).update({
            name,
            description,
            thumbnailUrl,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating program:", error);
        return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { programId: string } }
) {
    try {
        const db = await getFirestore();
        await db.collection("programs").doc(params.programId).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting program:", error);
        return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
    }
}
