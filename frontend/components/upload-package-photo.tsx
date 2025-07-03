"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UploadIcon } from "lucide-react";

export function UploadPackagePhoto() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  return (
    <Card className="h-full p-6 flex flex-col">
      <div className="mb-4">
        <Label htmlFor="photo" className="text-gray-700 font-medium">
          Package Photo
        </Label>
        <p className="text-sm text-gray-500 mt-1">
          Upload a clear photo of the package (Max. 5MB)
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {preview ? (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
              <Image 
                src={preview} 
                alt="Package preview" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setPreview(null)}
              >
                Change Photo
              </Button>
              <Button asChild>
                <label htmlFor="photo" className="cursor-pointer">
                  Upload Different
                </label>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center w-full h-64 md:h-80 lg:h-96 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center p-5">
                <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG (MAX. 5MB)
                </p>
              </div>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </Card>
  );
}
