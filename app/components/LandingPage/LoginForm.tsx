"use client";

// Add Google types to the window object
declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (options: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          cancel: () => void;
        };
      };
    };
  }
}

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { motion } from "framer-motion";
import { LuMail, LuLock, LuEye, LuEyeOff, LuUser } from "react-icons/lu";
import clsx from "clsx";
import { RiLock2Fill } from "react-icons/ri";

interface AuthModalProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  displayAuthModal?: boolean;
  toggleDisplayAuthModal?: () => void;
  onAuthSuccess?: () => void;
  enableSignup?: boolean;
}

export default function AuthModal({
  className,
  displayAuthModal = true,
  toggleDisplayAuthModal,
  onAuthSuccess,
  enableSignup = false,
}: AuthModalProps) {
  const { theme } = useAppContext();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const router = useRouter();
  const API_URLS = process.env.NEXT_PUBLIC_API_URLS || "";
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";

  interface GoogleSignInResponse {
    credential?: string;
    select_by?: string;
    clientId?: string;
  }

  const handleGoogleSignIn = useCallback(async (response: GoogleSignInResponse) => {
    if (!response.credential) {
      setError("Google Sign-In failed: No credential received");
      setLoading(false);
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    const mutation = `
      mutation GoogleAuth($token: String!) {
        googleAuth(token: $token) {
          token
          isVerified
        }
      }
    `;

    const variables = {
      token: response.credential,
    };

    try {
      const res = await fetch(API_URLS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: variables,
        }),
      });

      const result = await res.json();

      if (result.errors) {
        throw new Error(result.errors[0].message || "Google authentication failed.");
      }

      if (result.data && result.data.googleAuth && result.data.googleAuth.token) {
        const { token } = result.data.googleAuth;
        localStorage.setItem("Token", token);
        setSuccess("Google Sign-In successful!");
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        router.replace("/app");
      } else {
        throw new Error("Invalid response from server during Google Sign-In.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed. Please try again.");
      console.error("Google Sign-In error:", err);
    } finally {
      setLoading(false);
    }
  }, [router, API_URLS, onAuthSuccess]);

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      console.log("Redirecting to /app");
      router.replace("/app");
      return;
    }

    setIsCheckingAuth(false);

    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = `https://accounts.google.com/gsi/client?key=${GOOGLE_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleScriptLoaded(true);
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          context: "signin",
          ux_mode: "popup",
          api_key: GOOGLE_API_KEY,
        });

        const googleButtonDiv = document.getElementById("googleSignInButton");
        if (googleButtonDiv) {
          window.google.accounts.id.renderButton(googleButtonDiv, {
            theme: theme === "dark" ? "filled_black" : "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
          });
        } else {
          setError("Google Sign-In button container not found");
        }
      } else {
        setError("Google Sign-In API not available");
      }
    };
    script.onerror = () => {
      setError("Failed to load Google Sign-In script");
      setGoogleScriptLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [theme, handleGoogleSignIn, GOOGLE_CLIENT_ID, GOOGLE_API_KEY, router]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!identifier || identifier.length < 3) {
      setError("Please enter a valid email address or username (minimum 3 characters).");
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
        }
      }
    `;

    const variables = {
      input: {
        identifier: identifier,
        password,
      },
    };

    try {
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

      if (result.errors) {
        throw new Error(result.errors[0].message || "An error occurred during login.");
      }

      if (result.data && result.data.loginUser) {
        const { token } = result.data.loginUser;
        localStorage.setItem("Token", token);
        setSuccess("Login successful!");
        setIdentifier("");
        setPassword("");
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        router.replace("/app");
      } else {
        throw new Error("No data returned from the server.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!firstName || !lastName || !identifier || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const mutation = `
      mutation SignUpUser($input: SignUpUserInput!) {
        signUpUser(input: $input) {
          token
        }
      }
    `;

    const variables = {
      input: {
        firstName,
        lastName,
        email: identifier,
        password,
      },
    };

    try {
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

      if (result.errors) {
        throw new Error(result.errors[0].message || "An error occurred during signup.");
      }

      if (result.data && result.data.signUpUser) {
        const { token } = result.data.signUpUser;
        localStorage.setItem("Token", token);
        setSuccess("Sign up successful!");
        setFirstName("");
        setLastName("");
        setIdentifier("");
        setPassword("");
        setConfirmPassword("");
        if (onAuthSuccess) {
          onAuthSuccess();
        }
        router.replace("/app");
      } else {
        throw new Error("No data returned from the server.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        `fixed inset-0 z-30 flex h-screen w-full items-center justify-center bg-[#00000065] p-4`,
        displayAuthModal ? "flex" : "hidden",
        className
      )}
      onClick={toggleDisplayAuthModal}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        <Card
          className={cn(
            `rounded-2xl border overflow-y-auto max-h-[90vh]`,
            theme === "dark" ? "bg-[#2a2a2a] border-gray-600" : "bg-white border-gray-100"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="px-6 py-6">
            {enableSignup && (
              <div className={`flex bg-gray-100 rounded-lg p-1 mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                <button
                  type="button"
                  className={clsx(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                    !isSignupMode
                      ? theme === "dark"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-white text-gray-900 shadow-sm"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  onClick={() => setIsSignupMode(false)}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={clsx(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                    isSignupMode
                      ? theme === "dark"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "bg-white text-gray-900 shadow-sm"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  onClick={() => setIsSignupMode(true)}
                >
                  Sign Up
                </button>
              </div>
            )}
            {!isSignupMode ? (
              <form className="grid grid-cols-1 gap-y-5" onSubmit={handleLoginSubmit}>
                <div className="mb-3 flex w-full items-center justify-start space-x-2">
                  <RiLock2Fill className="h-5 w-5" />
                  <h4 className="font-bold text-xl">sign into cloudnotte</h4>
                </div>
                <div id="googleSignInButton" className="mb- w-full flex justify-center"></div>
                {!googleScriptLoaded && (
                  <div className="text-yellow-500 text-sm text-center mb-4">
                    Loading Google Sign-In...
                  </div>
                )}
                {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
                {success && <div className="text-green-500 text-sm text-center mb-4">{success}</div>}
                <div className="space-y-1">
                  <Label
                    htmlFor="identifier"
                    className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    Email/Username
                  </Label>
                  <div className={`flex items-center gap-x-3 border py-1 rounded-lg px-4 ${theme === "dark" ? "border-gray-600 bg-[#2a2a2a]" : "border-gray-300 bg-white"}`}>
                    <LuMail className={theme === "dark" ? "stroke-white" : "stroke-black"} />
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Email Address/Username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className={`w-full px-1 py-2 outline-none md:text-[13px] ${theme === "dark" ? "bg-[#2a2a2a] text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500"}`}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="password"
                    className={`font-bold text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    Password
                  </Label>
                  <div className={`flex items-center gap-x-3 border py-1 rounded-lg px-4 ${theme === "dark" ? "border-gray-600 bg-[#2a2a2a]" : "border-gray-300 bg-white"}`}>
                    <LuLock className={theme === "dark" ? "stroke-white" : "stroke-black"} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-1 py-2 outline-none md:text-[13px] ${theme === "dark" ? "bg-[#2a2a2a] text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500"}`}
                      disabled={loading}
                    />
                    <span
                      className="my-auto cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <LuEyeOff /> : <LuEye />}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 items-center rounded">
                  <Button
                    variant="default"
                    className={`grow h-11 rounded-full ${theme === "dark" ? "bg-[#99002b] text-white hover:bg-[#7a0022]" : "bg-[#99002b] text-white hover:bg-[#7a0022]"}`}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                  {enableSignup && (
                    <Button
                      variant="outline"
                      className={theme === "dark" ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}
                      onClick={() => setIsSignupMode(true)}
                      disabled={loading}
                    >
                      Sign Up
                    </Button>
                  )}
                </div>
                {!enableSignup && (
                  <div className="text-center text-sm">
                    Don’t have an account?{" "}
                    <a
                      href="https://app.cloudnotte.com/signup"
                      className={`underline underline-offset-4 ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                    >
                      Sign up with cloudnotte
                    </a>
                  </div>
                )}
              </form>
            ) : (
              <form className="grid grid-cols-1 gap-y-3" onSubmit={handleSignupSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="firstName"
                      className={`font-bold text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                    >
                      First Name
                    </Label>
                    <div className={`flex items-center gap-x-3 border py-1 rounded-lg px-4 ${theme === "dark" ? "border-gray-600 bg-[#2a2a2a]" : "border-gray-300 bg-white"}`}>
                      <LuUser className={theme === "dark" ? "stroke-white" : "stroke-black"} />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={`w-full px-1 py-2 outline-none md:text-[13px] ${theme === "dark" ? "bg-[#2a2a2a] text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500"}`}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="lastName"
                      className={`font-bold text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Last Name
                    </Label>
                    <div className={`flex items-center gap-x-3 border py-1 rounded-lg px-4 ${theme === "dark" ? "border-gray-600 bg-[#2a2a2a]" : "border-gray-300 bg-white"}`}>
                      <LuUser className={theme === "dark" ? "stroke-white" : "stroke-black"} />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={`w-full px-1 py-2 outline-none md:text-[13px] ${theme === "dark" ? "bg-[#2a2a2a] text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500"}`}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className={`font-bold text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    Email
                  </Label>
                  <div className={`flex items-center gap-x-3 border py-1 rounded-lg px-4 ${theme === "dark" ? "border-gray-600 bg-[#2a2a2a]" : "border-gray-300 bg-white"}`}>
                    <LuMail className={theme === "dark" ? "stroke-white" : "stroke-black"} />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Email Address"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className={`w-full px-1 py-2 outline-none md:text-[13px] ${theme === "dark" ? "bg-[#2a2a2a] text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500"}`}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="password"
                    className={`font-bold text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    Password
                  </Label>
                  <div className={`flex items-center gap-x-3 border py-1 rounded-lg px-4 ${theme === "dark" ? "border-gray-600 bg-[#2a2a2a]" : "border-gray-300 bg-white"}`}>
                    <LuLock className={theme === "dark" ? "stroke-white" : "stroke-black"} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-1 py-2 outline-none md:text-[13px] ${theme === "dark" ? "bg-[#2a2a2a] text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500"}`}
                      disabled={loading}
                    />
                    <span
                      className="my-auto cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <LuEyeOff /> : <LuEye />}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="confirmPassword"
                    className={`font-bold text-xs ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}
                  >
                    Confirm Password
                  </Label>
                  <div className={`flex items-center gap-x-3 border py-1 rounded-lg px-4 ${theme === "dark" ? "border-gray-600 bg-[#2a2a2a]" : "border-gray-300 bg-white"}`}>
                    <LuLock className={theme === "dark" ? "stroke-white" : "stroke-black"} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-1 py-2 outline-none md:text-[13px] ${theme === "dark" ? "bg-[#2a2a2a] text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-500"}`}
                      disabled={loading}
                    />
                    <span
                      className="my-auto cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <LuEyeOff /> : <LuEye />}
                    </span>
                  </div>
                </div>
                <Button
                  variant="default"
                  className={`w-full ${theme === "dark" ? "bg-[#99002b] text-white hover:bg-[#7a0022]" : "bg-[#99002b] text-white hover:bg-[#7a0022]"}`}
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                <Button
                  variant="outline"
                  className={`w-full mt-2 ${theme === "dark" ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => setIsSignupMode(false)}
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}
