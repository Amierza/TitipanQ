/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { imageUrl } from "@/config/api";
import QrScanner from "qr-scanner";

interface UploadPackagePhotoProps {
  photo: File | null;
  onChange: (file: File) => void;
  initialImageUrl?: string;
  onChangeValue: (value: string) => void;
}

export default function UploadPackagePhoto({
  photo,
  onChange,
  initialImageUrl,
  onChangeValue,
}: UploadPackagePhotoProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up old preview
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }

      const newPreview = URL.createObjectURL(file);
      setLocalPreview(newPreview);
      onChange(file);

      try {
        const result = await QrScanner.scanImage(file);
        onChangeValue(result);
      } catch (err: any) {
        console.warn(`${err}: QR code not found, skipping...`);
        onChangeValue("");
      }

    }
  };

  const previewUrl =
    localPreview ??
    (photo ? URL.createObjectURL(photo) : null) ??
    (initialImageUrl ? `${imageUrl}/${initialImageUrl}` : null);

  return (
    <div className="space-y-2">
      <Label>Upload Foto Package</Label>
      <Input type="file" accept="image/*" onChange={handleFile} />
      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Preview"
          width={128}
          height={128}
          className="w-32 h-32 object-cover rounded-md"
        />
      )}
    </div>
  );
}
