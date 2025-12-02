import { getFirestore } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ programId: string }> }
) {
    try {
        const { programId } = await params;
        const body = await request.json();
        const { count, dayNumber, title, description, thumbnailUrl, exercises, duration } = body;

        const db = await getFirestore();
        const daysRef = db.collection("programs").doc(programId).collection("days");

        // If count is specified, create multiple days (for "Add Week" functionality)
        if (count && count > 0) {
            // Get the highest day number
            const snapshot = await daysRef.orderBy("dayNumber", "desc").limit(1).get();
            let nextDayNumber = 1;
            if (!snapshot.empty) {
                nextDayNumber = snapshot.docs[0].data().dayNumber + 1;
            }

            const createdDays = [];
            for (let i = 0; i < count; i++) {
                const newDay = {
                    dayNumber: nextDayNumber + i,
                    title: `Day ${nextDayNumber + i}`,
                    description: "",
                    thumbnailUrl: "",
                    exercises: [],
                    createdAt: new Date().toISOString(),
                };
                const docRef = await daysRef.add(newDay);
                createdDays.push({ id: docRef.id, ...newDay });
            }

            return NextResponse.json({ days: createdDays, count: createdDays.length });
        }

        // Single day creation
        const snapshot = await daysRef.orderBy("dayNumber", "desc").limit(1).get();
        let nextDayNumber = dayNumber || 1;
        if (!dayNumber && !snapshot.empty) {
            nextDayNumber = snapshot.docs[0].data().dayNumber + 1;
        }

        const newDay = {
            dayNumber: nextDayNumber,
            title: title || `Day ${nextDayNumber}`,
            description: description || "",
            thumbnailUrl: thumbnailUrl || "",
            duration: duration,
            exercises: exercises || [],
            createdAt: new Date().toISOString(),
        };

        const docRef = await daysRef.add(newDay);
        return NextResponse.json({ id: docRef.id, ...newDay });
    } catch (error) {
        console.error("Error creating day:", error);
        return NextResponse.json(
            { error: "Failed to create day" },
            { status: 500 }
        );
    }
}
