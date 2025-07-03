"use client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";

type Props = {
  photo: string;
  onChange: (photo: string) => void;
};

export function AvatarUpload({ photo, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(photo);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>Profile Photo</Label>
      <div className="flex items-center gap-6">
        <div className="relative">
          <Image
            src={preview || "/default-avatar.png"}
            alt="Profile photo"
            width={80}
            height={80}
            className="rounded-full object-cover border-2 border-gray-200"
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Change Photo
          </Button>
          <Input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sm text-gray-500">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}