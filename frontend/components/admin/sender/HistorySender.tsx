'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSenderService } from '@/services/admin/sender/getAllSender';
import { Sender } from '@/types/sender.type';
import { deleteSenderService } from '@/services/admin/sender/deleteSender';
import { toast } from 'sonner';
import SenderDeleteConfirmation from './SenderDeleteConfirmation';
import { Mail, Pencil, Phone, Trash2, User } from 'lucide-react';
import SenderForm from './SenderForm';

const HistorySenderSection = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSender, setSelectedSender] = useState<Sender | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: senderData } = useQuery({
    queryKey: ['sender', { page: 1, pagination: true }],
    queryFn: ({ queryKey }) => {
      const [, rawParams] = queryKey;

      if (typeof rawParams === 'object' && rawParams !== null) {
        return getSenderService(rawParams);
      }
      return getSenderService();
    },
  });

  const { mutate: deleteCompany } = useMutation({
    mutationFn: deleteSenderService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['sender'] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!senderData) return <p>Failed to fetch company data</p>;
  if (!senderData.status) return <p>Failed to fetch company data</p>;

  const handleCreate = () => {
    setSelectedSender(null);
    setIsFormOpen(true);
  };

  const handleEdit = (sender: Sender) => {
    setSelectedSender(sender);
    setIsFormOpen(true);
  };

  const handleDelete = (sender: Sender) => {
    setSelectedSender(sender);
    setIsDeleteOpen(true);
  };

  const confirmDelete = (sender: Sender) => {
    if (selectedSender) {
      deleteCompany(sender.sender_id);
    }
    setIsDeleteOpen(false);
  };

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
              <BreadcrumbLink href="#">List Sender</BreadcrumbLink>
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
                List Sender
              </h1>
              <p className="text-gray-600">
                View senders whose packages have been sent
              </p>
            </div>

            <div className="flex gap-4">
              <Button className="cursor-pointer" onClick={handleCreate}>
                + Add New Sender
              </Button>
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

          <div className="grid grid-cols-3 gap-4">
            {senderData.data.map((sender) => (
              <div
                key={sender.sender_id}
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
                        {sender.sender_name || 'Andi Prakasa'}
                      </h3>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-1 pl-10">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {sender.sender_email || 'andiprakasa@gmail.com'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {sender.sender_phone_number || '089238934893'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(sender)}
                      className="cursor-pointer bg-amber-400 hover:bg-amber-500 text-white hover:text-white p-2 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
                      aria-label="Edit sender"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sender)}
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

          <SenderForm
            key={selectedSender?.sender_id ?? 'new'}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            sender={selectedSender}
          />

          <SenderDeleteConfirmation
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={() => {
              if (selectedSender) confirmDelete(selectedSender);
            }}
            sender={selectedSender}
          />
        </div>
      </div>
    </SidebarInset>
  );
};

export default HistorySenderSection;
