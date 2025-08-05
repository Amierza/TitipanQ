"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { RegisterSchema } from "@/validation/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { registerUserService } from "@/services/auth/registerUserService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import SelectCompany from "./companyDropDown";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [show, setShow] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
    defaultValues: {
      user_name: "",
      user_email: "",
      user_phone_number: "",
      user_address: "",
      user_password: "",
    },
  });

  const { mutate: registerUser, isPending } = useMutation({
    mutationFn: registerUserService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        router.push("/login");
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    const payload = { ...values };
    if (!payload.company_id) delete payload.company_id;
    if (!payload.user_address) delete payload.user_address;

    registerUser(values);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8 space-y-6"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-sm">
                  Register your account to use TitipanQ
                </p>
              </div>

              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="08xxxxxxxxxx" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <RadioGroup
                className="grid grid-cols-2 gap-6"
                defaultValue="user"
                onValueChange={(val) => setIsCompany(val === "company")}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="user" id="r1" />
                  <Label htmlFor="r1">User</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="company" id="r2" />
                  <Label htmlFor="r2">Company</Label>
                </div>
              </RadioGroup>

              {!isCompany ? (
                <FormField
                  control={form.control}
                  name="user_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jalan Ahmad Yani"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <SelectCompany
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="user_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          id="password"
                          placeholder="******"
                          type={show ? "text" : "password"}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShow((prev) => !prev)}
                          className="absolute right-2 top-0 p-0 m-0 bg-transparent border-none shadow-none ring-0 focus:ring-0 focus-visible:ring-0 hover:bg-transparent"
                          tabIndex={-1}
                        >
                          {show ? (
                            <Eye size={12} className="text-black" />
                          ) : (
                            <EyeOff size={12} className="text-black" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={!form.formState.isValid || isPending}
                className="w-full cursor-pointer"
              >
                {isPending ? "Loading..." : "Register"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4 hover:font-semibold hover:text-black"
                >
                  Login
                </Link>
              </p>
            </form>
          </Form>

          {/* Image Section */}
          <div className="relative hidden md:block bg-muted">
            <Image
              src="/assets/Register.jpg"
              alt="Register"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
