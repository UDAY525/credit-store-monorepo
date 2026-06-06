"use server";
import { UserLoginSchema } from "@credit-store/shared";
type LoginState = {
  success: boolean;
  message?: string;
  errors?: any;
  data?: any;
};

export async function loginAction(
  prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  try {
    const validation = UserLoginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.flatten(),
      };
    }

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validation.data),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
