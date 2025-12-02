"use client";

import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";

interface ImageUploaderProps {
    onUploadComplete: (url: string) => void;
    folder: string;
    currentImage?: string;
}

export default function ImageUploader({
    onUploadComplete,
    folder,
    currentImage,
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview immediately
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setUploading(true);

        try {
            // 1. Get signed URL
            const res = await fetch("/api/upload/r2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentType: file.type, folder }),
            });

            if (!res.ok) {
                throw new Error(`Failed to get upload URL: ${res.statusText}`);
            }

            const { url, key } = await res.json();

            // 2. Upload to R2
            const uploadRes = await fetch(url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            if (!uploadRes.ok) {
                throw new Error(`R2 upload failed: ${uploadRes.statusText}`);
            }

            // 3. Construct public URL
            const domain = process.env.NEXT_PUBLIC_R2_DOMAIN || "";
            const publicUrl = domain ? `${domain}/${key}` : key;

            // Keep local preview but use public URL for saving
            onUploadComplete(publicUrl);
        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message}`);
            // Revert preview on error
            setPreview(undefined);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            {preview ? (
                <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        onClick={() => {
                            setPreview(undefined);
                            onUploadComplete("");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-gray-500 animate-spin mb-4" />
                        ) : (
                            <Upload className="w-8 h-8 text-gray-500 mb-4" />
                        )}
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            SVG, PNG, JPG or GIF
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
}
