"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import Image from "next/image";
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
  const API_URLS = process.env.NEXT_PUBLIC_API_URLS || "";

  useEffect(() => {
    const token = localStorage.getItem("Token");
    console.log("Token:", token); // Debug token

    if (token) {
      console.log("Redirecting to /app");
      router.replace("/app"); // Redirect authenticated users to app
    } else {
      console.log("No token found, allowing login form");
      setIsCheckingAuth(false); // Show login form for unauthenticated users
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validate inputs
    if (!email || email.length < 6) {
      setError("Please enter a valid email address (minimum 6 characters).");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      setLoading(false);
      return;
    }

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
        identifier: email, // Use identifier instead of email
        password,
      },
    };

    try {
      console.log("API_URLS:", API_URLS); // Debug API URL
      console.log("Variables:", variables); // Debug variables
      const response = await fetch(API_URLS, {
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
      console.log("Server response:", result); // Debug server response

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
      <Card className={`border-none shadow-none ${theme === 'dark' ? 'bg-transparent' : 'bg-transparent'}`}>
        <CardContent className="mx-auto max-w-7xl">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Welcome back
                </h1>
                <p className={`text-balance ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
                  Login to your cloudnotte account
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
                className={`w-full ${theme === 'dark' ? 'bg-[#99002b] text-white' : 'bg-[#99002b] text-white'}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don’t have an account?{" "}
                <a href="https://app.cloudnotte.com/signup" className={`underline underline-offset-4 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  Sign up with cloudnotte
                </a>
              </div>
            </div>
          </form>
          {/* <div className={`relative hidden md:block ${theme === 'dark' ? '' : 'bg-muted'}`}>
            <Image
              src="/hero-img.png"
              alt="Image"
              width={500}
              height={400}
              className=""
            />
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}