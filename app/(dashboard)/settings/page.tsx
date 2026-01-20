"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SessionList } from "@/components/settings/session-list";
import { toast } from "sonner";
import { User, Lock, Monitor } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user/me").then(res => res.json()).then(data => {
      setUser(data.user);
      setSessions(data.sessions);
    });
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/user/update", {
      method: "PATCH",
      body: JSON.stringify({ fullName: formData.get("fullName") }),
    });
    if (res.ok) toast.success("Profile updated");
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formData.get("newPassword") !== formData.get("confirmPassword")) {
      return toast.error("Passwords do not match");
    }
    const res = await fetch("/api/user/security", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
      }),
    });
    if (res.ok) toast.success("Password changed successfully");
    else toast.error("Failed to update password");
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <title>Jirassic Settings</title>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your identity, security, and sessions.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/>Profile</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2"/>Security</TabsTrigger>
          <TabsTrigger value="sessions"><Monitor className="w-4 h-4 mr-2"/>Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input name="fullName" defaultValue={user.fullName} />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="bg-slate-50" />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Update Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Current Password</Label>
                  <Input name="currentPassword" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label>New Password</Label>
                  <Input name="newPassword" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label>Confirm New Password</Label>
                  <Input name="confirmPassword" type="password" />
                </div>
                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Device Sessions</CardTitle>
              <CardDescription>You are currently logged in on these devices.</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionList initialSessions={sessions} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}