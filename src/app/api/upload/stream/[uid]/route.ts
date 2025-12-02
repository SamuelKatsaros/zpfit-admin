import { NextResponse } from "next/server";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const { uid } = await params;

        if (!ACCOUNT_ID || !API_TOKEN) {
            return NextResponse.json(
                { error: "Missing Cloudflare credentials" },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${uid}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Cloudflare API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success || !data.result) {
            throw new Error("Failed to get video details");
        }

        return NextResponse.json({
            playback: data.result.playback,
            ready: data.result.readyToStream
        });

    } catch (error) {
        console.error("Error fetching stream details:", error);
        return NextResponse.json(
            { error: "Failed to fetch video details" },
            { status: 500 }
        );
    }
}
