"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/supabase/client";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { getErrorMessage } from "@/constants/applicationConstants";
import { checkEmailAction } from "@/actions/authActions";
import { CheckEmailResponse } from "@/types/applicationTypes";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;

const ForgotPasswordForm: FC = () => {
  const supabase = getSupabaseBrowserClient();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | undefined>(
    undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // ✅ Kontrola emailu pri opustení inputu
  const handleEmailBlur = async () => {
    const email = getValues("email");
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;

    try {
      setCheckingEmail(true);
      const result = (await checkEmailAction({ email })) as CheckEmailResponse;
      setEmailExists(result.exists);
    } catch {
      setEmailExists(undefined);
    } finally {
      setCheckingEmail(false);
    }
  };

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError("");

    if (emailExists === false) {
      setServerError("This email is not registered");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset password email sent!");
      setSuccess(true);
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message || "Failed to send reset email");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Check your email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a password reset link to{" "}
              <strong>{getValues("email")}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to reset your password. The link will
              expire in 1 hour.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                onBlur={handleEmailBlur}
                disabled={isSubmitting || checkingEmail}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
              {checkingEmail && (
                <p className="text-sm text-muted-foreground">
                  Checking email...
                </p>
              )}
              {emailExists === false && (
                <p className="text-sm text-destructive">
                  This email is not registered
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || checkingEmail}
            >
              {isSubmitting || checkingEmail ? <Spinner /> : "Send reset link"}
            </Button>
            <Link href="/auth/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
