"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { imageUrl } from "@/config/api";

interface UploadPackagePhotoProps {
  photo: File | null;
  onChange: (file: File) => void;
  initialImageUrl?: string;
}

export default function UploadPackagePhoto({
  photo,
  onChange,
  initialImageUrl,
}: UploadPackagePhotoProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up old preview
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }

      const newPreview = URL.createObjectURL(file);
      setLocalPreview(newPreview);
      onChange(file);
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
