import { initAdmin } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        const admin = await initAdmin();

        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Check if user is an admin
        const adminStatus = await isAdmin(decodedToken.uid);
        if (!adminStatus) {
            return NextResponse.json(
                { error: "Access denied: Admin privileges required" },
                { status: 403 }
            );
        }

        // Create session cookie
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await admin.auth().createSessionCookie(token, { expiresIn });

        const cookieStore = await cookies();
        cookieStore.set("session", sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

