"use client";

import { FC, useState, useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/supabase/client";
import { getErrorMessage } from "@/constants/applicationConstants";
import { checkEmailAction } from "@/actions/authActions";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupForm: FC = () => {
  const id = useId();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    startTransition(async () => {
      try {
        const result = (await checkEmailAction({ email: data.email })) as { exists: boolean };
        if (result.exists) {
          setError("Email is already registered");
          return;
        }

        const { error: supabaseError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
              `${window.location.origin}/dashboard`,
          },
        });

        if (supabaseError) throw supabaseError;

        setRedirecting(true);

        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 800);
      } catch (err) {
        setError(getErrorMessage(err) || "Failed to create account");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`}>Email</Label>
              <Input
                id={`${id}-email`}
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
                disabled={isPending || redirecting}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-password`}>Password</Label>
              <div className="relative">
                <Input
                  id={`${id}-password`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  disabled={isPending || redirecting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor={`${id}-confirm-password`}>Confirm Password</Label>
              <div className="relative">
                <Input
                  id={`${id}-confirm-password`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword", { required: "Confirm your password" })}
                  disabled={isPending || redirecting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-4">
            <Button type="submit" className="w-full" disabled={isPending || redirecting}>
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> Creating account...
                </span>
              ) : redirecting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> Redirecting...
                </span>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {(isPending || redirecting) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-lg font-medium">
          <Loader2 className="animate-spin h-6 w-6 mr-2" />
          {redirecting ? "Redirecting..." : "Processing..."}
        </div>
      )}
    </div>
  );
};

export default SignupForm;
