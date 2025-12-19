"use client";

import Link from "next/link";
import { Input } from "@/components/auth/Input";
import { Button } from "@/components/auth/Button";
import { SocialButton } from "@/components/auth/SocialButton";
import { useState } from "react";
import { signUp } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
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
    setErrors({ name: "", email: "", password: "" });

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);

      const result = await signUp(formDataObj);
      
      if (result.ok) {
        router.push("/");
        router.refresh();
      } else {
        // Handle validation errors
        if (result.errors) {
          setErrors({
            name: result.errors.name?.[0] || "",
            email: result.errors.email?.[0] || "",
            password: result.errors.password?.[0] || "",
          });
        } else if (result.error) {
          // Handle general error
          setErrors({
            name: "",
            email: result.error,
            password: "",
          });
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      setErrors({
        name: "",
        email: error.message || "An error occurred during sign up",
        password: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Sign In Link */}
      <div className="text-right mb-6">
        <span className="text-gray-600">Already have an account? </span>
        <Link
          href="/sign-in"
          className="text-black font-medium hover:underline"
        >
          Sign In
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        Join Nike Today!
      </h1>
      <p className="text-gray-600 mb-8">
        Create your account to start your fitness journey
      </p>

      {/* Social Sign Up Buttons */}
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
          <span className="px-2 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

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

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="minimum 8 characters"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          minLength={8}
        />

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      {/* Terms and Privacy */}
      <p className="mt-6 text-sm text-gray-600 text-center">
        By signing up, you agree to our{" "}
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

