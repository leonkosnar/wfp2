"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Trash2 } from "lucide-react";

export function SessionList({ initialSessions }: { initialSessions: any[] }) {
  const [sessions, setSessions] = useState(initialSessions);

  const revokeSession = async (sessionId: string) => {
    const res = await fetch("/api/auth/sessions", {
      method: "DELETE",
      body: JSON.stringify({ sessionId }),
    });

    if (res.ok) {
      setSessions(sessions.filter((s) => s.id !== sessionId));
    }
  };

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 rounded-full">
              <Monitor className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {session.userAgent.includes("Windows") ? "Windows PC" : 
                 session.userAgent.includes("Mac") ? "MacBook" : "Mobile Device"}
              </p>
              <p className="text-xs text-muted-foreground uppercase">
                {session.ipAddress} • Created {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => revokeSession(session.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Revoke
          </Button>
        </div>
      ))}
      {sessions.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No other active sessions found.</p>
      )}
    </div>
  );
}