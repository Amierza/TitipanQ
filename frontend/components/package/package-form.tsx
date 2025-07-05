"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadPackagePhoto from "./package-upload-photo";

type PackageType = "document" | "package" | "other";

interface PackageFormData {
  userId: string;
  type: PackageType;
  description: string;
  photo: File | null;
}

interface PackageFormProps {
  onSubmit: (data: PackageFormData) => void;
  initialData?: Partial<PackageFormData>;
  users: { id: string; name: string }[];
}

export default function PackageForm({
  onSubmit,
  initialData,
  users,
}: PackageFormProps) {
  const [formData, setFormData] = useState<PackageFormData>({
    userId: initialData?.userId || "",
    type: initialData?.type || "document",
    description: initialData?.description || "",
    photo: initialData?.photo || null,
  });

  const handleChange = <K extends keyof PackageFormData>(field: K, value: PackageFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <UploadPackagePhoto
        photo={formData.photo}
        onChange={(file) => handleChange("photo", file)}
      />

      <div>
        <Label>Select User</Label>
        <Select
          value={formData.userId}
          onValueChange={(val) => handleChange("userId", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(val: PackageType) => handleChange("type", val)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="package">Package</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}
