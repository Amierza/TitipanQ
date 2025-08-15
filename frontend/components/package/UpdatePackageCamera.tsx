'use client';

import { useRef, useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { imageUrl } from '@/config/api';
import Webcam from 'react-webcam';
import { Aperture } from 'lucide-react';

interface UpdatePackageCamera {
  photo: File | null;
  onChange: (file: File | null) => void;
  initialImageUrl?: string;
}

export default function UpdatePackageCamera({
  photo,
  onChange,
  initialImageUrl,
}: UpdatePackageCamera) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const processFile = async (file: File) => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    const newPreview = URL.createObjectURL(file);
    setLocalPreview(newPreview);
    onChange(file);
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], 'UpdatePackage.png', { type: 'image/png' });

    await processFile(file);
    setShowCamera(false);
  };

  const handleRemoveImage = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }
    setLocalPreview(null);
    onChange(null);
  };

  const previewUrl =
    localPreview ??
    (photo ? URL.createObjectURL(photo) : null) ??
    (initialImageUrl ? `${imageUrl}/${initialImageUrl}` : null);

  return (
    <div className="space-y-3">
      <Label>Update Status Package</Label>

      {showCamera && (
        <div className="space-y-2 flex flex-col items-center">
          <Webcam
            screenshotQuality={1}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={true}
            className="w-full h-auto rounded-md border"
          />
          <button
            type="button"
            onClick={handleCapture}
            className="flex items-center gap-2 justify-center text-sm border px-3 py-1 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 cursor-pointer border-gray-500"
          >
            <Aperture />
            Ambil Gambar
          </button>
        </div>
      )}

      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Preview"
          width={128}
          height={128}
          className="w-32 h-32 object-cover rounded-md border"
        />
      )}

      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={() => setShowCamera(!showCamera)}
          className="text-sm border px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer border-gray-500"
        >
          {showCamera ? 'Tutup Kamera' : 'Ambil dari Kamera'}
        </button>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="text-sm border px-3 py-1 rounded text-white font-semibold bg-red-500 hover:bg-red-600 cursor-pointer"
          >
            Hapus Gambar
          </button>
        )}
      </div>
    </div>
  );
}
