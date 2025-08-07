'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Pencil, Phone, Trash2, User } from 'lucide-react';
import { getAllRecipientService } from '@/services/admin/recipient/getAllRecipient';
import { deleteRecipientService } from '@/services/admin/recipient/deleteRecipient';
import { Recipient } from '@/types/recipient.type';
import RecipientForm from './RecipientForm';
import RecipientDeleteConfirmation from './RecipientDeleteConfirmation';

const RecipientSection = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: recipientData } = useQuery({
    queryKey: ['recipient', { page, pagination: true }],
    queryFn: ({ queryKey }) => {
      const [, rawParams] = queryKey;

      if (typeof rawParams === 'object' && rawParams !== null) {
        return getAllRecipientService(rawParams);
      }
      return getAllRecipientService();
    },
  });

  const { mutate: deleteRecipient } = useMutation({
    mutationFn: deleteRecipientService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['recipient'] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!recipientData) return <p>Failed to fetch recipient data</p>;
  if (!recipientData.status) return <p>Failed to fetch recipient data</p>;

  const handleEdit = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsFormOpen(true);
  };

  const handleDelete = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsDeleteOpen(true);
  };

  const confirmDelete = (recipient: Recipient) => {
    if (selectedRecipient) {
      deleteRecipient(recipient.recipient_id);
    }
    setIsDeleteOpen(false);
  };

  const filteredData = recipientData.data.filter((recipient) => {
    return (
      !searchQuery ||
      recipient.recipient_name.toLowerCase().includes(searchQuery)
    );
  });

  const paginatedData = filteredData.slice(
    (page - 1) * recipientData.meta.per_page,
    page * recipientData.meta.per_page
  );

  return (
    <SidebarInset>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">List Recipient</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-8 h-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <div className="flex justify-between items-end mb-4">
            {/* Title + Deskripsi */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                List Recipient
              </h1>
              <p className="text-gray-600">
                View recipient whose packages have been received
              </p>
            </div>
          </div>

          <div className="flex flex-row justify-between gap-6">
            {/* Search form */}
            <div className="mb-4 max-w-md flex w-full items-center gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client or description"
                className="w-full px-4 py-2 border rounded-lg focus-visible:ring-black"
              />
            </div>
          </div>

          {paginatedData.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {paginatedData.map((recipient) => (
                <div
                  key={recipient.recipient_id}
                  className="group border border-gray-200 rounded-lg px-4 py-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white"
                >
                  <div className="flex items-center justify-between">
                    {/* Content Section */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Name Section */}
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {recipient.recipient_name}
                        </h3>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-1 pl-10">
                        <div className="flex items-start gap-3 text-sm text-gray-600">
                          <Mail className="w-5 h-5 flex-shrink-0" />
                          <span className="truncate text-wrap">
                            {recipient.recipient_email}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Phone className="w-5 h-5 flex-shrink-0" />
                          <span>{recipient.recipient_phone_number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(recipient)}
                        className="cursor-pointer bg-amber-400 hover:bg-amber-500 text-white hover:text-white p-2 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
                        aria-label="Edit sender"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recipient)}
                        className="cursor-pointer bg-red-500 hover:bg-red-600 text-white hover:text-white p-2 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete sender"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">
              Data tidak ditemukan
            </p>
          )}

          {recipientData.meta.max_page > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => page > 1 && setPage((prev) => prev - 1)}
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: recipientData.meta.max_page },
                    (_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          className="cursor-pointer"
                          isActive={page === index + 1}
                          onClick={() => setPage(index + 1)}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={() =>
                        page < recipientData.meta.max_page &&
                        setPage((prev) => prev + 1)
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <RecipientForm
            key={selectedRecipient?.recipient_id ?? 'new'}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            recipient={selectedRecipient}
          />

          <RecipientDeleteConfirmation
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => {
              if (selectedRecipient) confirmDelete(selectedRecipient);
            }}
            recipient={selectedRecipient}
          />
        </div>
      </div>
    </SidebarInset>
  );
};

export default RecipientSection;
