"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import z from "zod";
import { LoginSchema } from "@/validation/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginUserService } from "@/services/auth/loginUserService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginAdminService } from "@/services/auth/loginAdminService";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      user_email: "",
      user_password: "",
    },
  });

  const { mutate: loginUser, isPending } = useMutation({
    mutationFn: loginUserService,
    onSuccess: (result) => {
      if (result.status) {
        toast.success(result.message);
        router.push("/client/package");
      } else {
        loginAdmin(form.getValues());
      }
    },
    onError: () => {
      loginAdmin(form.getValues());
    },
  });

  const { mutate: loginAdmin } = useMutation({
    mutationFn: loginAdminService,
    onSuccess: (result) => {
      if (result.status) {
        console.log("Login admin berhasil")
        toast.success(result.message);
        router.push("/admin");
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    console.log("Submitted values:", values);
    loginUser(values);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col justify-center gap-6 p-6 md:p-8"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">
                  Login to your TitipanQ account
                </p>
              </div>

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
                name="user_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="******"
                          type={show ? "text" : "password"}
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

              <Link
                href="#"
                className="text-sm text-primary underline-offset-2 hover:underline text-end"
              >
                Forgot password?
              </Link>

              <Button type="submit" disabled={isPending} className="w-full cursor-pointer">
                {isPending ? "Loading" : "Login"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="underline underline-offset-4 hover:text-black hover:font-semibold"
                >
                  Register
                </Link>
              </p>
            </form>
          </Form>

          <div className="relative hidden bg-muted md:block">
            <Image
              src="/assets/Login.jpg"
              alt="Login Illustration"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
