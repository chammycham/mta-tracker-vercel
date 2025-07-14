// src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import "./globals.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push(`/users/${user.displayName || user.uid}`);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      router.push(`/users/${user.displayName || user.uid}`);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("Login failed.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-black p-4">
      <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
        <Image
          src="/icons/home_page.png"
          alt="MTA Pixel Logo"
          fill
          className="object-contain"
          style={{
            imageRendering: "pixelated",
          }}
        />
        <button
          onClick={handleGoogleSignIn}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] bg-yellow-500 text-black px-6 py-3 border-4 border-black press-start-2p-regular shadow-md hover:scale-105 transition"
        >
          LOGIN
        </button>
      </div>
    </main>
  );
}
