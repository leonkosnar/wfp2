import { getCurrentUser } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const handleDeleteAccount = () => {
    fetch("/api/user/security", {
      method: "DELETE"
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <title>Jirassic User</title>
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Public Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/" className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.fullName} name="fullName" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                defaultValue={user?.email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-muted-foreground">
                Email changes require admin approval.
              </p>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
