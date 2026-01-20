"use client";
import { useEffect } from "react";
import { toast } from "sonner";

export function NotificationToastListener() {
  useEffect(() => {
    const checkNotifications = async () => {
      const res = await fetch("/api/notifications/unread");
      const unread = await res.json();

      console.log(unread)
      
      unread.forEach((note: any) => {
        toast(`New Assignment`, {
          description: note.message,
          action: {
            label: "Mark as Seen",
            onClick: () => fetch(`/api/notifications/unread?q=${note.id}`, { method: 'POST' }),
          },
        });
      });
    };

    const interval = setInterval(checkNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return null;
}