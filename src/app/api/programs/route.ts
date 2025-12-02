import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { name, description, thumbnailUrl, difficulty, days } = await request.json();
        const db = await getFirestore();

        // 1. Create the program
        const programRef = await db.collection("programs").add({
            name,
            description,
            thumbnailUrl,
            difficulty,
            createdAt: new Date().toISOString(),
        });

        // 2. Create all days with embedded exercises
        if (days && Array.isArray(days)) {
            const batch = db.batch();

            days.forEach((day: any) => {
                const dayRef = programRef.collection("days").doc();
                batch.set(dayRef, {
                    dayNumber: day.dayNumber,
                    title: day.title,
                    description: day.description || "",
                    thumbnailUrl: day.thumbnailUrl,
                    duration: day.duration,
                    exercises: day.exercises || [],
                });
            });

            await batch.commit();
        }

        return NextResponse.json({ id: programRef.id });
    } catch (error) {
        console.error("Error creating program:", error);
        return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
    }
}
