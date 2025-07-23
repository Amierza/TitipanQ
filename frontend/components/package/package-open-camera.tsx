"use client";

import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QrScannerModal({
  open,
  onClose,
  onScanSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (result: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    const setupScanner = async () => {
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        console.error("No camera found on this device.");
        return;
      }

      if (videoRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            onScanSuccess(result.data);
            onClose();
          },
          {
            returnDetailedScanResult: true,
          }
        );

        try {
          await scannerRef.current.start();
        } catch (error) {
          console.error("Failed to start scanner:", error);
        }
      }
    };
    
    return () => {
      setupScanner();
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [open, onClose, onScanSuccess]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Scan QR Code</DialogTitle>
        </DialogHeader>

        <video
          ref={videoRef}
          className="w-full rounded"
          muted
          playsInline
        />
      </DialogContent>
    </Dialog>
  );
}
