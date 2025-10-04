import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z
  .object({
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

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterResponse {
  user: { id: string; email: string };
  jwt: string;
}

async function registerUser(data: { email: string; password: string }): Promise<RegisterResponse> {
  const res = await fetch("/auth/local/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error: { message?: string } = await res.json();
    throw new Error(error.message ?? "Registration failed");
  }

  return res.json();
}

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const {toast} = useToast();

  const mutation = useMutation<RegisterResponse, Error, { email: string; password: string }>({
    mutationFn: registerUser,
    onSuccess: () => {
      toast({
        title: "Register succesfull",
        duration: 2000,
        className: "bg-green-800 text-white font-bold text-base"
      })
    },
    onError: () => {
       toast({
        title: "Register failed",
        duration: 2000,
        className: "bg-red-800 text-white font-bold text-base"
      })
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.mutate({ email: values.email, password: values.password });
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-xl shadow"
    >
      <div>
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label>Password</Label>
        <Input type="password" {...register("password")} />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label>Confirm Password</Label>
        <Input type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Registering..." : "Register"}
      </Button>
    </motion.form>
  );
}
