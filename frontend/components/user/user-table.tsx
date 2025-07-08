// components/UserTable.tsx
"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user.type";

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserTable = ({ users, onEdit, onDelete }: Props) => {
  return (
    <div className="overflow-x-auto border rounded-xl bg-white">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Company</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} className="border-b hover:bg-gray-100">
              <td className="p-3 font-medium text-gray-800">{user.user_name}</td>
              <td className="p-3 text-gray-600">{user.user_email}</td>
              <td className="p-3">{user.company.company_name}</td>
              <td className="p-3 capitalize">{user.role.role_name}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
