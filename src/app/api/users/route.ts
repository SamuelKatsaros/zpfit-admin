import { getFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const db = await getFirestore();

        // Validate required fields
        if (!data.email || !data.firstName || !data.lastName) {
            return NextResponse.json(
                { error: "Email, first name, and last name are required" },
                { status: 400 }
            );
        }

        // Create user document with defaults for missing fields
        const userData: any = {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth || null,
            heightFeet: data.heightFeet || 0,
            heightInches: data.heightInches || 0,
            weightPounds: data.weightPounds || 0,
            experienceLevel: data.experienceLevel || "Beginner",
            goals: data.goals || [],
            currentProgramId: data.currentProgramId || "",
            currentDayNumber: data.currentDayNumber || 0,
            joinedDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await db.collection("users").add(userData);

        return NextResponse.json({ id: docRef.id, ...userData });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const db = await getFirestore();
        const snapshot = await db.collection("users").get();

        const users = snapshot.docs.map(doc => {
            const data = doc.data();

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

            return user;
        });

        // Sort by joinedDate (most recent first)
        users.sort((a: any, b: any) => {
            const dateA = new Date(a.joinedDate).getTime();
            const dateB = new Date(b.joinedDate).getTime();
            return dateB - dateA;
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
