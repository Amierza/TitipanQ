"use client";

import { Button } from "@/components/ui/button";
import { Pencil, FileText, Package, User } from "lucide-react";
import Link from "next/link";
import DeletePackageButton from "./package-delete-button";
import Image from "next/image";
import type { PackageItem } from "@/types/package";

interface PackageListProps {
  packages: PackageItem[];
}

export default function PackageList({ packages }: PackageListProps) {
  if (packages.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No packages found
        </h3>
        <p className="text-gray-500 mb-6">
          Get started by adding your first package
        </p>
        <Link href="/admin/package/new">
          <Button className="bg-black text-white hover:bg-gray-800">
            Add Package
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            {/* Left Content */}
            <div className="flex gap-4 flex-1">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {pkg.photoUrl ? (
                  <Image
                    src={pkg.photoUrl}
                    alt={`Photo of ${pkg.description}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-black mb-2">
                  {pkg.description}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="capitalize">{pkg.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{pkg.userName}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  ID: {pkg.id}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <Link href={`/admin/package/${pkg.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
              <DeletePackageButton packageId={pkg.id} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}