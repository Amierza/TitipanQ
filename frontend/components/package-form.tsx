"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export function PackageForm() {
  const [formData, setFormData] = useState({
    company: "",
    recipient: "",
    packageName: "",
    notes: "",
    status: "incoming"
  });

  // Dummy data
  const companies = ["PT Amanah", "PT Maju Terus", "PT Lampu Terang"];
  const users = ["Budi Santoso", "Siti Aminah", "Rudi Hartono"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // TODO: Kirim data ke backend
  };

  return (
    <Card className="h-full p-6 flex flex-col">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Package Details</h2>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-gray-700">Company</Label>
            <Select 
              onValueChange={(value) => setFormData({...formData, company: value})}
              value={formData.company}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((comp, idx) => (
                  <SelectItem key={idx} value={comp}>{comp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-gray-700">Recipient Name</Label>
            <Select 
              onValueChange={(value) => setFormData({...formData, recipient: value})}
              value={formData.recipient}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user, idx) => (
                  <SelectItem key={idx} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packageName" className="text-gray-700">Package Name</Label>
            <Input 
              id="packageName"
              name="packageName"
              placeholder="e.g. Important Documents" 
              value={formData.packageName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-700">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special instructions..." 
              value={formData.notes}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            Submit Package
          </Button>
        </div>
      </form>
    </Card>
  );
}