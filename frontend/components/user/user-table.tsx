// components/UserTable.tsx
'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user.type';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface Props {
  query?: string;
  users: User[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserTable = ({
  query = '',
  users,
  page,
  setPage,
  totalPages,
  onEdit,
  onDelete,
}: Props) => {
  const itemPerPage = 10;
  const currentPage = page ?? 1;

  const filteredData = users.filter((user) => {
    const q = query.toLowerCase();
    const name = user.user_name?.toLowerCase() ?? '';
    const company =
      user.companies
        ?.map((company) => company.company_name)
        .join(', ')
        .toLowerCase() ?? '';

    return name.includes(q) || company.includes(q);
  });

  return (
    <>
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-3 text-left">No.</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((user, index) => (
                <tr key={user.user_id} className="border-b hover:bg-gray-100">
                  <td className="p-3 font-medium text-gray-800">
                    {(currentPage - 1) * itemPerPage + (index + 1)}
                  </td>
                  <td className="p-3 font-medium text-gray-800">
                    {user.user_name}
                  </td>
                  <td className="p-3 text-gray-600">{user.user_email}</td>
                  <td className="p-3">
                    {user.companies
                      .map((company) => company.company_name)
                      .join(', ')}
                  </td>
                  <td className="p-3 capitalize">
                    {user.role?.role_name ?? '-'}
                  </td>
                  <td className="p-3 space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(user)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => currentPage > 1 && setPage(currentPage - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem key={`page-${index + 1}`}>
                  <PaginationLink
                    isActive={currentPage === index + 1}
                    onClick={() => setPage(index + 1)}
                    className="cursor-pointer"
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() =>
                    currentPage < totalPages && setPage(currentPage + 1)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default UserTable;
