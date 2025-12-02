"use client";

import { useState } from "react";
import { Upload, Loader2, X, Video } from "lucide-react";

interface VideoUploaderProps {
    onUploadComplete: (url: string) => void;
    currentVideo?: string;
}

export default function VideoUploader({
    onUploadComplete,
    currentVideo,
}: VideoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentVideo);
    const [progress, setProgress] = useState(0);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);

        try {
            // 1. Get upload URL
            const res = await fetch("/api/upload/stream", { method: "POST" });
            const { url } = await res.json();

            // 2. Upload to Cloudflare Stream
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = new XMLHttpRequest();
            uploadRes.open("POST", url);

            uploadRes.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    setProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            uploadRes.onload = async () => {
                if (uploadRes.status >= 200 && uploadRes.status < 300) {
                    try {
                        let hlsUrl = "";

                        // Try to parse response if it exists
                        if (uploadRes.responseText) {
                            const response = JSON.parse(uploadRes.responseText);
                            if (response.result?.playback?.hls) {
                                hlsUrl = response.result.playback.hls;
                            }
                        }

                        // If no HLS URL yet (empty response or missing in JSON), fetch from API
                        if (!hlsUrl) {
                            // Extract UID from upload URL
                            const uid = url.split('/').pop();
                            if (uid) {
                                const detailsRes = await fetch(`/api/upload/stream/${uid}`);
                                if (detailsRes.ok) {
                                    const details = await detailsRes.json();
                                    if (details.playback?.hls) {
                                        hlsUrl = details.playback.hls;
                                    }
                                }
                            }
                        }

                        if (hlsUrl) {
                            setPreview(hlsUrl);
                            onUploadComplete(hlsUrl);
                        } else {
                            throw new Error("Could not retrieve video URL");
                        }
                    } catch (parseError: any) {
                        console.error("Failed to process upload response:", parseError);
                        alert(`Upload failed: ${parseError.message}`);
                    } finally {
                        setUploading(false);
                    }
                } else {
                    console.error("Upload failed", uploadRes.responseText);
                    alert(`Upload failed with status ${uploadRes.status}`);
                    setUploading(false);
                }
            };

            uploadRes.onerror = () => {
                console.error("Upload failed");
                alert("Upload failed");
                setUploading(false);
            };

            uploadRes.send(formData);

        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            {preview ? (
                <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-center h-full bg-black text-white">
                        <Video className="w-12 h-12" />
                        <span className="ml-2">Video Uploaded</span>
                    </div>
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
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 text-gray-500 animate-spin mb-4" />
                                <span className="text-sm text-gray-500">{progress}%</span>
                            </div>
                        ) : (
                            <Upload className="w-8 h-8 text-gray-500 mb-4" />
                        )}
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload video</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            MP4, MOV, etc.
                        </p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
}
