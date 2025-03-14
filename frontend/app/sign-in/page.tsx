"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const { isSignedIn } = useAuth();
  const { isLoaded } = useUser();

  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  // If signed in, render nothing while redirecting
  if (isSignedIn) {
    return null;
  }

  if (!isLoaded) {
    return (
        <div className="min-h-[calc(100vh-4rem)] pt-9 relative overflow-auto">
            <div className="relative z-20">
          <p className="text-center text-white text-2xl sm:text-3xl font-semibold animate-pulse">
            Fetching your data...
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-[calc(100vh-4rem)] pt-6 relative overflow-auto">
      <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Welcome to Printee
        </h1>
          <p className="text-lg sm:text-xl max-w-md mx-auto mb-6">
            Printee makes printing effortless. Upload your documents, manage
            your print queue, and get high-quality prints with just a few
            clicks. Start printing smarter today!
          </p>
        <SignedOut>
          <div className="mt-6 inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer">
            <SignInButton>Sign In To Explore</SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
