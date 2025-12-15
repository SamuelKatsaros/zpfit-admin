import "server-only";
import { getAuth, getFirestore } from "./firebase-admin";

/**
 * Admin verification utilities
 * 
 * Uses an 'admins' collection in Firestore where each document ID
 * is the Firebase UID of an allowed admin user.
 */

/**
 * Check if a user UID exists in the admins collection
 */
export async function isAdmin(uid: string): Promise<boolean> {
    try {
        const db = await getFirestore();
        const adminDoc = await db.collection("admins").doc(uid).get();
        return adminDoc.exists;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

/**
 * Verify a session cookie and check if the user is an admin
 * Returns the decoded token if valid and user is admin, null otherwise
 */
export async function verifyAdminSession(sessionCookie: string): Promise<{
    uid: string;
    email?: string;
} | null> {
    try {
        const auth = await getAuth();
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

        // Check if user is an admin
        const adminStatus = await isAdmin(decodedToken.uid);
        if (!adminStatus) {
            return null;
        }

        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };
    } catch (error) {
        console.error("Error verifying admin session:", error);
        return null;
    }
}
