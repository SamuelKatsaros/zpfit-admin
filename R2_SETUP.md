# Cloudflare R2 Setup Instructions

## 1. Create R2 Bucket

1. Go to Cloudflare Dashboard → R2
2. Click "Create bucket"
3. Name it (e.g., `zpfit-admin`)
4. Save the bucket name for your `.env.local`

## 2. Configure CORS

R2 buckets need CORS configuration to allow uploads from your Next.js app.

1. In your R2 bucket settings, go to "Settings" → "CORS Policy"
2. Add the following CORS policy:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

## 3. Get R2 Credentials

1. In Cloudflare Dashboard → R2 → Overview
2. Click "Manage R2 API Tokens"
3. Click "Create API Token"
4. Select "Admin Read & Write" permissions
5. Save the following:
   - Access Key ID
   - Secret Access Key
   - Account ID (from the URL or dashboard)

## 4. Enable Public Access (Optional)

If you want images to be publicly accessible:

1. In your R2 bucket settings, go to "Settings" → "Public Access"
2. Click "Allow Access"
3. Copy the public bucket URL (e.g., `https://pub-xxxxx.r2.dev`)
4. Use this as your `NEXT_PUBLIC_R2_DOMAIN` in `.env.local`

Alternatively, you can connect a custom domain to your R2 bucket.

## 5. Update Environment Variables

Add these to your `.env.local`:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_stream_api_token (for Stream)
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=zpfit-admin
NEXT_PUBLIC_R2_DOMAIN=https://pub-xxxxx.r2.dev
```

## 6. Restart Dev Server

Run `npm run dev` again for the changes to take effect.
