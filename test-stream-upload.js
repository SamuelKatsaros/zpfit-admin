const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCOUNT_ID = "ac08caabf57fb3af4d382095e4d6d375";
const API_TOKEN = "LfCoDIa4wsuDj-wJehQvsOOM94ghStTb4n7bHZwY";

async function testUpload() {
    console.log("1. Requesting Upload URL...");

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/direct_upload`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                maxDurationSeconds: 3600,
            }),
        }
    );

    const data = await response.json();
    console.log("Upload URL Response:", JSON.stringify(data, null, 2));

    if (!data.success) {
        console.error("Failed to get upload URL");
        return;
    }

    const uploadUrl = data.result.uploadURL;
    console.log("\n2. Uploading dummy file to:", uploadUrl);

    // Create a dummy video file (just text, but Stream might reject it later, 
    // but we want to see if we get a response at all)
    // Actually, let's try to send a proper multipart request

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const fileContent = "dummy video content";

    const body = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="test.txt"',
        'Content-Type: text/plain',
        '',
        fileContent,
        `--${boundary}--`
    ].join('\r\n');

    const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body
    });

    console.log("\n3. Upload Response Status:", uploadResponse.status);
    const responseText = await uploadResponse.text();
    console.log("Upload Response Body:", responseText);

    // Extract UID
    const uid = uploadUrl.split('/').pop();
    console.log("\n4. Checking video details for UID:", uid);

    const detailsResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${uid}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    );

    const details = await detailsResponse.json();
    console.log("Video Details:", JSON.stringify(details, null, 2));
}

testUpload().catch(console.error);
