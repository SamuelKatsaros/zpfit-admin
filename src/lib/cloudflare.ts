import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const STREAM_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const STREAM_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
});

export async function getR2UploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return await getSignedUrl(S3, command, { expiresIn: 3600 });
}

export async function getStreamUploadUrl() {
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${STREAM_ACCOUNT_ID}/stream/direct_upload`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${STREAM_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                maxDurationSeconds: 3600,
                // allowedOrigins: ["*"], // Optional: restrict to domain
            }),
        }
    );

    const data = await response.json();
    return data.result.uploadURL;
}
