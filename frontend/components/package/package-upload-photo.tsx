"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function UploadPackagePhoto({ photo, onChange }: { photo: File | null; onChange: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(photo ? URL.createObjectURL(photo) : null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Upload Foto Package</Label>
      <Input type="file" accept="image/*" onChange={handleFile} />
      {preview && <Image src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-md" />}
    </div>
  );
}
