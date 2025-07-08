"use client";

import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeletePackageButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button variant="destructive" size="icon" onClick={onClick}>
      <Trash size={16} />
    </Button>
  );
}
