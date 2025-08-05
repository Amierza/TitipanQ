'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sender } from '@/types/sender.type';
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sender: Sender | null;
}

const SenderDeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  sender,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700">
          Are you sure you want to delete sender{' '}
          <strong>{sender?.sender_name}</strong>?
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="cursor-pointer"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SenderDeleteConfirmation;
