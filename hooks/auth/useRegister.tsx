import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "../use-toast";
import { useRouter } from "next/navigation";

// --- Validation Schema ---
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterResponse {
  user: { id: string; email: string; username: string };
  jwt: string;
}

// --- API Call ---
async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${baseUrl}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: data.username,
      email: data.email,
      password: data.password,
    }),
  });

  if (!res.ok) {
    const error: { message?: string } = await res.json();
    throw new Error(error.message ?? "Registration failed");
  }

  return res.json();
}

// --- Custom Hook ---
export function useRegister() {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation<
    RegisterResponse,
    Error,
    { username: string; email: string; password: string }
  >({
    mutationFn: registerUser,
    onSuccess: () => {
      toast({
        title: "Register successful",
        duration: 2000,
        className: "bg-green-800 text-white font-bold text-base",
      });
      router.push("/login");
    },
    onError: () => {
      toast({
        title: "Register failed",
        duration: 2000,
        className: "bg-red-800 text-white font-bold text-base",
      });
    },
  });
}
