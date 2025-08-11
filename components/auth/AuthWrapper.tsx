"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REGISTER_MUTATION, LOGIN_MUTATION } from "@/graphql/mutations/authMutations";
import { ME_QUERY } from "@/graphql/queries/helloQuery";

const AuthWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState<{ [key: string]: string }>({});

  const [register, { loading: registering }] = useMutation(REGISTER_MUTATION, {
    onCompleted(data) {
      toast.success("Registered successfully!");
      localStorage.setItem("token", data.register);
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const [login, { loading: loggingIn }] = useMutation(LOGIN_MUTATION, {
    onCompleted(data) {
      toast.success("Logged in successfully!");
      localStorage.setItem("token", data.login);
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  // Optional: fetch current user
  const { data: meData, loading: meLoading, error: meError } = useQuery(ME_QUERY, {
    fetchPolicy: "network-only",
    skip: !localStorage.getItem("token"), // only if logged in
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "signin") {
      await login({
        variables: {
          data: {
            email: form.email,
            password: form.password,
          },
        },
      });
    } else {
      await register({
        variables: {
          data: {
            name: form.name,
            email: form.email,
            password: form.password,
          },
        },
      });
    }
  };

  if (meLoading) return <p>Loading profile...</p>;
  if (meError) console.error(meError);

  if (meData?.me) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Welcome, {meData.me.name || meData.me.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {meData.me.email}</p>
            <p>Name: {meData.me.name}</p>
            <p>Last Name: {meData.me.lastName}</p>
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="mt-4"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              setForm({});
            }}
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form className="space-y-3 mt-4" onSubmit={onSubmit}>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password || ""}
                  onChange={handleChange}
                  required
                />
                <Button type="submit" className="w-full" disabled={loggingIn}>
                  {loggingIn ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="space-y-3 mt-4" onSubmit={onSubmit}>
                <Input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name || ""}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email || ""}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password || ""}
                  onChange={handleChange}
                  required
                />
                <Button type="submit" className="w-full" disabled={registering}>
                  {registering ? "Creating account..." : "Create account"}
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
