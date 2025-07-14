"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Company } from "@/types/company.type"
interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    company: Company | null
}

const CompanyDeleteConfirmation = ({ isOpen, onClose, onConfirm, company }: Props) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Delete</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-gray-700">
                    Are you sure you want to delete company <strong>{company?.company_name}</strong>?
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

export default CompanyDeleteConfirmation