"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { ApiResponse, User } from "@credit-store/shared";
import { redirect } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  console.log(process.env.NEXT_PUBLIC_BACKEND_DOMAIN);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const formData = new FormData(e.currentTarget);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/api/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.get("email"),
            password: formData.get("password"),
          }),
        },
      );

      const result: ApiResponse<User> = await res.json();

      if (!result.success) {
        toast.error(result.message ?? "Login failed");

        return;
      }

      toast.success(result.message ?? "Logged in successfully");
      redirect("/");

      // router.push("/dashboard");
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>

          <CardDescription>Login with your credentials.</CardDescription>
        </CardHeader>

        <CardContent>
          <form method="POST" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <Input id="password" name="password" type="password" required />
              </Field>

              <Field>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="register">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
