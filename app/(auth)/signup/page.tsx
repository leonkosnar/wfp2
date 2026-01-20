"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/dashboard");
    else alert("Registration failed");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-4 border rounded-xl bg-white shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-muted-foreground">Start tracking your issues today.</p>
        </div>
        <Input placeholder="Full Name" onChange={(e) => setForm({...form, fullName: e.target.value})} required />
        <Input type="email" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} required />
        <Input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} required />
        <Button type="submit" className="w-full h-11">Sign Up</Button>
        <p className="text-center text-sm">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}