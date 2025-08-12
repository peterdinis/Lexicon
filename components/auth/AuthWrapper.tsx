"use client";

import { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation} from "@apollo/client";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REGISTER_MUTATION, LOGIN_MUTATION } from "@/graphql/mutations/authMutations";

type FormData = {
  email: string;
  password: string;
  name?: string;
};

const AuthWrapper: FC = () => {
  const [, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPasswordSignin, setShowPasswordSignin] = useState(false);
  const [showPasswordSignup, setShowPasswordSignup] = useState(false);
  const router = useRouter()

  const [, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const {
    register: registerSignin,
    handleSubmit: handleSubmitSignin,
    reset: resetSignin,
    formState: { errors: errorsSignin },
  } = useForm<FormData>();

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    reset: resetSignup,
    formState: { errors: errorsSignup },
  } = useForm<FormData>();

  const [registerMutation, { loading: registering }] = useMutation(REGISTER_MUTATION, {
    onCompleted(data) {
      toast.success("Registered successfully!");
      localStorage.setItem("token", data.register);
      setToken(data.register);
      resetSignup();
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const [loginMutation, { loading: loggingIn }] = useMutation(LOGIN_MUTATION, {
    onCompleted(data) {
      toast.success("Logged in successfully!");
      localStorage.setItem("token", data.login);
      setToken(data.login);
      resetSignin();
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const onSubmitSignin = (data: FormData) => {
    loginMutation({
      variables: {
        data: {
          email: data.email,
          password: data.password,
        },
      },
    });
    router.push("/dashboard")
  };

  const onSubmitSignup = (data: FormData) => {
    registerMutation({
      variables: {
        data: {
          email: data.email,
          password: data.password,
          name: data.name, // send name
        },
      },
    });
    setActiveTab("signin")
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="signin"
            onValueChange={(value) => {
              setActiveTab(value as "signin" | "signup");
              resetSignin();
              resetSignup();
              setShowPasswordSignin(false);
              setShowPasswordSignup(false);
            }}
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin">
              <form className="space-y-3 mt-4" onSubmit={handleSubmitSignin(onSubmitSignin)}>
                <Input
                  type="email"
                  placeholder="Email"
                  {...registerSignin("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                  })}
                />
                {errorsSignin.email && <p className="text-sm text-red-500">{errorsSignin.email.message}</p>}

                <div className="relative">
                  <Input
                    type={showPasswordSignin ? "text" : "password"}
                    placeholder="Password"
                    {...registerSignin("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPasswordSignin((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPasswordSignin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errorsSignin.password && <p className="text-sm text-red-500">{errorsSignin.password.message}</p>}

                <Button type="submit" className="w-full" disabled={loggingIn}>
                  {loggingIn ? <Loader2 className="animate-spin w-8 h-8" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="space-y-3 mt-4" onSubmit={handleSubmitSignup(onSubmitSignup)} noValidate>
                <Input
                  type="text"
                  placeholder="Name"
                  {...registerSignup("name", { required: "Name is required" })}
                />
                {errorsSignup.name && <p className="text-sm text-red-500">{errorsSignup.name.message}</p>}

                <Input
                  type="email"
                  placeholder="Email"
                  {...registerSignup("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
                  })}
                />
                {errorsSignup.email && <p className="text-sm text-red-500">{errorsSignup.email.message}</p>}

                <div className="relative">
                  <Input
                    type={showPasswordSignup ? "text" : "password"}
                    placeholder="Password"
                    {...registerSignup("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPasswordSignup((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPasswordSignup ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errorsSignup.password && <p className="text-sm text-red-500">{errorsSignup.password.message}</p>}

                <Button type="submit" className="w-full" disabled={registering}>
                  {registering ? <Loader2 className="animate-spin w-8 h-8" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthWrapper;
