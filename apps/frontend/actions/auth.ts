"use server";

import { UserRegisterSchema } from "@credit-store/shared";
import { redirect } from "next/navigation";

export async function registerAction(_prevState: unknown, formData: FormData) {
  try {
    console.log("action in");
    const validation = UserRegisterSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.flatten(),
      };
    }

    console.log("validated");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
        cache: "no-store",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message ?? "Login failed",
      };
    }
    return {
      success: true,
      message: "Register successful",
      data: result,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
