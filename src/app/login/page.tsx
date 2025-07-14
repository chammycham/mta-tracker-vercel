//src/app/login/page.tsx
// "use client";
// import { useRouter } from "next/navigation";
// import { auth } from "@/lib/firebase";
// import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// export default function LoginPage() {
//   const router = useRouter();

//   const handleGoogleSignIn = async () => {
//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;
//       router.push(`/users/${user.displayName || user.uid}`);
//     } catch (error) {
//       console.error("Google sign-in failed:", error);
//       alert("Login failed.");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4">
//       <h1 className="text-2xl mb-4">Sign In</h1>
//       <button
//         onClick={handleGoogleSignIn}
//         className="bg-white text-black border px-4 py-2 rounded shadow"
//       >
//         Sign in with Google
//       </button>
//     </div>
//   );
// }
