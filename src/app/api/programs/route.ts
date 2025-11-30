import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name, description, thumbnailUrl } = await request.json();
        const db = await getFirestore();

        const docRef = await db.collection("programs").add({
            name,
            description,
            thumbnailUrl,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error("Error creating program:", error);
        return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
    }
}
