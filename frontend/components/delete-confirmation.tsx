"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserData } from "../lib/data/dummy-user"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  user: UserData | null
}

export function DeleteConfirmation({ isOpen, onClose, onConfirm, user }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700">
          Are you sure you want to delete user <strong>{user?.name}</strong>?
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}