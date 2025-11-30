import { getStreamUploadUrl } from "@/lib/cloudflare";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const url = await getStreamUploadUrl();
        return NextResponse.json({ url });
    } catch (error) {
        console.error("Stream upload error:", error);
        return NextResponse.json({ error: "Failed to get upload URL" }, { status: 500 });
    }
}
