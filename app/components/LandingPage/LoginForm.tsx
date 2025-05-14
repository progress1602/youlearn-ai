"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Auth({ className, ...props }: LoginFormProps) {
  const { theme } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const token = localStorage.getItem("Token");

    if (token) {
      router.replace("/app"); // Redirect authenticated users to home
    } else {
      setIsCheckingAuth(false); // Allow unauthenticated users to see the login form
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const mutation = `
      mutation LoginUser($input: LoginUserInput!) {
        loginUser(input: $input) {
          token
          isVerified
        }
      }
    `;

    const variables = {
      input: {
        identifier: email,
        password: password,
      },
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables,
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message || "An error occurred during login.");
      }

      if (result.data && result.data.loginUser) {
        const { token, isVerified } = result.data.loginUser;
        localStorage.setItem("Token", token);
        setSuccess("Login successful!");
        console.log("Is Verified:", isVerified);
        setEmail("");
        setPassword("");
        router.replace("/app"); // Use replace to prevent adding to history
      } else {
        throw new Error("No data returned from the server.");
      }
    } catch (err) {
      setError((err instanceof Error ? err.message : "An unknown error occurred") || "Failed to login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) return null;

  return (
    <div className={cn("flex flex-col gap-6 mx-auto max-w-5xl mt-12 md:mt-20 lg:mt-20", className)} {...props}>
      <Card className={`overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-200'}`}>
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Welcome back
                </h1>
                <p className={`text-balance ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
                  Login to your cloudnotte ai account
                </p>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm text-center">{success}</div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={theme === 'dark' ? 'bg-[#2a2a2a] border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={theme === 'dark' ? 'bg-[#2a2a2a] border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'}
                />
              </div>
              <Button
                type="submit"
                className={`w-full ${theme === 'dark' ? 'bg-gradient-to-r from-[#0F4C81] via-[#5A3F59] to-[#C92A1F] text-white' : 'bg-gradient-to-r from-[#0F4C81] via-[#5A3F59] to-[#C92A1F] text-white'}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don’t have an account?{" "}
                <a href="https://v3.cloudnotte.com" className={`underline underline-offset-4 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  Sign up with cloudnotte
                </a>
              </div>
            </div>
          </form>
          <div className={`relative hidden md:block ${theme === 'dark' ? 'bg-gray-800' : 'bg-muted'}`}>
            <Image
              src="/cloudnotte ai .jpg"
              alt="Image"
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}