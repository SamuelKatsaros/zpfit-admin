import { getR2UploadUrl } from "@/lib/cloudflare";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const { contentType, folder } = await request.json();
        const key = `${folder}/${uuidv4()}`;
        const url = await getR2UploadUrl(key, contentType);

        return NextResponse.json({ url, key });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
