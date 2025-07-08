// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "../ui/form";
// import { Eye, EyeOff } from "lucide-react";
// import { toast } from "sonner";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
// import SelectCompany from "../auth/companyDropDown";
// import { createUserService } from "@/services/admin/user/createUser";
// import { User } from "@/types/user.type";
// import { updateUserService } from "@/services/admin/user/updateUser";
// import { UserSchema } from "@/validation/user.schema";

// interface UserFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   user: User | null;
// }

// const UserForm = ({ isOpen, onClose, user }: UserFormProps) => {
//   const queryClient = useQueryClient();
//   const [show, setShow] = useState(false);
//   const [isCompany, setIsCompany] = useState(false);
//   const form = useForm<z.infer<typeof UserSchema>>({
//     resolver: zodResolver(UserSchema),
//     mode: "onChange",
//     defaultValues: {
//       user_name: user?.user_name || "",
//       user_email: user?.user_email || "",
//       user_phone_number: user?.user_phone_number || "",
//       user_address: user?.user_address || "",
//       user_password: user?.user_password || "",
//     },
//   });

//   const { mutate: createUser, isPending } = useMutation({
//     mutationFn: createUserService,
//     onSuccess: (result) => {
//       if (result.status) {
//         toast.success(result.message);
//         queryClient.invalidateQueries({ queryKey: ["user"] });
//         onClose();
//       } else {
//         toast.error(result.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });

//   const { mutate: updateUser } = useMutation({
//     mutationFn: updateUserService,
//     onSuccess: (result) => {
//       if (result.status) {
//         toast.success(result.message);
//         queryClient.invalidateQueries({ queryKey: ["user"] });
//         onClose();
//       } else {
//         toast.error(result.message);
//       }
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });

//   const onSubmit = (values: z.infer<typeof UserSchema>) => {
//     if (user?.user_id) {
//       const updatedFields: Partial<typeof values> = {};

//       for (const key in values) {
//         const field = key as keyof typeof values;

//         if (field === "company_id") {
//           if (values.company_id !== user.company?.company_id) {
//             updatedFields.company_id = values.company_id;
//           }
//         } else if (values[field] !== (user as any)[field]) {
//           updatedFields[field] = values[field];
//         }
//       }

//       if (!updatedFields.user_address) delete updatedFields.user_address;
//       if (!updatedFields.company_id) delete updatedFields.company_id;

//       updateUser({ userId: user.user_id, data: updatedFields });
//     } else {
//       // Mode CREATE
//       const payload = { ...values };
//       if (!payload.user_address) delete payload.user_address;
//       if (!payload.company_id) delete payload.company_id;

//       createUser(payload);
//       form.reset();
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
//         </DialogHeader>
//         <FormProvider {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="user_name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="m@example.com" type="text" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="user_email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="m@example.com"
//                       type="email"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="user_phone_number"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Phone Number</FormLabel>
//                   <FormControl>
//                     <Input placeholder="08xxxxxxxxxx" type="tel" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <RadioGroup
//               className="grid grid-cols-2 gap-6"
//               defaultValue="user"
//               onValueChange={(val) => setIsCompany(val === "company")}
//             >
//               <div className="flex items-center gap-3">
//                 <RadioGroupItem value="user" id="r1" />
//                 <Label htmlFor="r1">User</Label>
//               </div>
//               <div className="flex items-center gap-3">
//                 <RadioGroupItem value="company" id="r2" />
//                 <Label htmlFor="r2">Company</Label>
//               </div>
//             </RadioGroup>

//             {!isCompany ? (
//               <FormField
//                 control={form.control}
//                 name="user_address"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Address</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="Jalan Ahmad Yani"
//                         type="text"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             ) : (
//               <FormField
//                 control={form.control}
//                 name="company_id"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Company</FormLabel>
//                     <FormControl>
//                       <SelectCompany
//                         value={field.value ?? ""}
//                         onChange={field.onChange}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             <FormField
//               control={form.control}
//               name="user_password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <div className="relative">
//                       <Input
//                         {...field}
//                         id="password"
//                         placeholder="******"
//                         type={show ? "text" : "password"}
//                         required
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         onClick={() => setShow((prev) => !prev)}
//                         className="absolute right-2 top-0 p-0 m-0 bg-transparent border-none shadow-none ring-0 focus:ring-0 focus-visible:ring-0 hover:bg-transparent"
//                         tabIndex={-1}
//                       >
//                         {show ? (
//                           <Eye size={12} className="text-black" />
//                         ) : (
//                           <EyeOff size={12} className="text-black" />
//                         )}
//                       </Button>
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex justify-end">
//               <Button
//                 disabled={isPending || !form.formState.isValid}
//                 type="submit"
//               >
//                 {user ? "Update" : "Create"}
//               </Button>
//             </div>
//           </form>
//         </FormProvider>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default UserForm;
