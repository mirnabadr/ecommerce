"use client";

import Link from "next/link";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { SocialButton } from "@/components/auth/SocialButton";
import { useState } from "react";
import { signIn } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ email: "", password: "" });

    try {
      const formDataObj = new FormData();
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);

      const result = await signIn(formDataObj);
      
      if (result.ok) {
        router.push("/");
        router.refresh();
      } else {
        // Handle validation errors
        if (result.errors && typeof result.errors === 'object') {
          const errors = result.errors as Record<string, string[] | undefined>;
          setErrors({
            email: errors.email?.[0] || "",
            password: errors.password?.[0] || "",
          });
        } else if (result.error) {
          // Handle general error
          setErrors({
            email: result.error,
            password: "",
          });
        }
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setErrors({
        email: error.message || "An error occurred during sign in",
        password: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Sign Up Link */}
      <div className="text-right mb-6">
        <span className="text-gray-600">Don't have an account? </span>
        <Link
          href="/sign-up"
          className="text-black font-medium hover:underline"
        >
          Sign Up
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Welcome Back!
      </h1>
      <p className="text-gray-600 mb-8">
        Sign in to continue your fitness journey
      </p>

      {/* Social Sign In Buttons */}
      <div className="space-y-3 mb-6">
        <SocialButton provider="google">
          Continue with Google
        </SocialButton>
        <SocialButton provider="apple">
          Continue with Apple
        </SocialButton>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign in with</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="johndoe@gmail.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <div className="flex items-center justify-between">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="ml-2 text-gray-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-black font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Terms and Privacy */}
      <p className="mt-6 text-sm text-gray-600 text-center">
        By signing in, you agree to our{" "}
        <Link href="/terms-of-service" className="text-black font-medium hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="text-black font-medium hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

