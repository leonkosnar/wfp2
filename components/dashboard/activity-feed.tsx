"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed({ activities }: { activities: any[] }) {
  return (
    <ScrollArea className="h-100 pr-4">
      <div className="space-y-6">
        {activities.map((log) => (
          <div key={log.id} className="flex gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{log.user.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-semibold">{log.user.fullName}</span>{" "}
                <span className="text-muted-foreground">
                  {log.actionType.toLowerCase().replace("_", " ")}
                </span>{" "}
                <span className="font-medium text-primary">
                  {log.entityTitle || log.task?.title}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-10">No recent activity.</p>
        )}
      </div>
    </ScrollArea>
  );
}