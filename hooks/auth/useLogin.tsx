import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "../use-toast";
import { useRouter } from "next/navigation";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginResponse {
  jwt: string;
  user: { id: string; email: string; username: string };
}

// --- API Call ---
async function loginUser(data: { email: string; password: string }): Promise<LoginResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${baseUrl}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: data.email,
      password: data.password,
    }),
  });

  if (!res.ok) {
    const error: { message?: string } = await res.json();
    throw new Error(error.message ?? "Login failed");
  }

  return res.json();
}

// --- Custom Hook ---
export function useLogin() {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation<LoginResponse, Error, { email: string; password: string }>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        duration: 2000,
        className: "bg-green-800 text-white font-bold text-base",
      });
      router.push("/dashboard"); 
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        duration: 2000,
        className: "bg-red-800 text-white font-bold text-base",
      });
    },
  });
}
