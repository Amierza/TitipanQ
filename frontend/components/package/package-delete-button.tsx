"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

export default function DeletePackageButton({ packageId }: { packageId: string }) {
  const handleDelete = () => {
    alert(`Delete package ${packageId}`); // ganti dengan fungsi API call nanti
  };

  return (
    <Button variant="destructive" size="icon" onClick={handleDelete}>
      <Trash size={16} />
    </Button>
  );
}
