/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanySchema } from "@/validation/company.schema";
import { Company } from "@/types/company.type";
import { createCompanyService } from "@/services/admin/company/createCompany";
import { updateCompanyService } from "@/services/admin/company/updateCompany";

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
}

const CompanyForm = ({ isOpen, onClose, company }: UserFormProps) => {
    const queryClient = useQueryClient();
    const form = useForm<z.infer<typeof CompanySchema>>({
        resolver: zodResolver(CompanySchema),
        mode: "onChange",
        defaultValues: {
            company_name: company?.company_name || "",
            company_address: company?.company_address || "",
        },
    });

    const { mutate: createCompany, isPending: isCreating } = useMutation({
        mutationFn: createCompanyService,
        onSuccess: (result) => {
            if (result.status) {
                toast.success(result.message);
                queryClient.invalidateQueries({ queryKey: ["company"] });
                onClose();
            } else {
                toast.error(result.message);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { mutate: updateCompany, isPending: isUpdating } = useMutation({
        mutationFn: updateCompanyService,
        onSuccess: (result) => {
            if (result.status) {
                toast.success(result.message);
                queryClient.invalidateQueries({ queryKey: ["company"] });
                onClose();
            } else {
                toast.error(result.message);
            }
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const onSubmit = (values: z.infer<typeof CompanySchema>) => {
        if (company?.company_id) {
            const diff = Object.fromEntries(
                Object.entries(values).filter(
                    ([key, val]) => val !== (company as any)[key]
                )
            ) as Partial<typeof values>;

            updateCompany({ companyId: company.company_id, data: diff });
        } else {
            createCompany(values);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{company ? "Edit Company" : "Add New Company"}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="PT Otak Kanan" type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="company_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Jalan Ahmad Yani no.23"
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button
                                disabled={(isCreating || isUpdating) || !form.formState.isValid}
                                type="submit"
                            >
                                {company ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
};

export default CompanyForm;
