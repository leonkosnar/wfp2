"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Clock,
  MessageSquare,
  User as UserIcon,
  Trash2,
  Send,
  Plus,
  History,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "../ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "../ui/badge";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "../ui/item";
import { Textarea } from "../ui/textarea";

export function TaskDetailSheet({
  task,
  projectMembers,
  isOpen,
  onClose,
}: any) {
  const [comment, setComment] = useState("");
  const [description, setDescription] = useState(task.description);
  const [localTask, setLocalTask] = useState(task);
  const [logMinutes, setLogMinutes] = useState("");
  const [logDescription, setLogDescription] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const onAssign = async (userId: string) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ assigneeId: userId }),
    });
    if (res.ok) router.refresh();
  };

  const onPriorityChange = async (priority: string) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    });
    if (res.ok) router.refresh();
  };

  const updateEventDescription = async () => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      body: JSON.stringify({ description }),
    });
    if (res.ok) router.refresh();
  };

  const onDelete = async () => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  };

  const onPostComment = async () => {
    if (!comment.trim()) return;
    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: comment }),
    });
    if (res.ok) {
      setComment("");
      router.refresh();
    }
  };

  const onLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logMinutes) return;
    setIsLogging(true);

    const res = await fetch(`/api/tasks/${task.id}/time`, {
      method: "POST",
      body: JSON.stringify({
        durationMin: parseInt(logMinutes),
        description: logDescription,
        startTime: new Date(),
      }),
    });

    if (res.ok) {
      setLogMinutes("");
      setLogDescription("");
      router.refresh();
    }
    setIsLogging(false);
  };

  const totalTime =
    localTask.timeLogs?.reduce(
      (acc: number, log: any) => acc + log.durationMin,
      0,
    ) || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent onOpenAutoFocus={e => e.preventDefault()} className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="flex flex-row gap-4 border-b pb-4">
          <div className="flex-1 space-y-1">
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {task.projectId.slice(0, 4)}-{task.id.slice(0, 4)}
            </span>
            <SheetTitle className="text-2xl leading-tight flex justify-between">
              {task.title}
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </SheetTitle>
          </div>
        </SheetHeader>
        <div className="px-4 flex flex-col gap-6">
          <div className="flex gap-4">
            <Field>
              <FieldLabel>Assignee</FieldLabel>
              <Select
                onValueChange={onAssign}
                value={task.assigneeId || undefined}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers?.map((member: any) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                user responsible for this task
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Priority</FieldLabel>
              <Select
                name="priority"
                value={task.priority || "MEDIUM"}
                onValueChange={onPriorityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Time Invested</FieldLabel>
              <InputGroup className="pr-2">
                <InputGroupAddon>
                  <Clock className="w-3.5 h-3.5 mr-2" />
                </InputGroupAddon>
                <InputGroupText>{totalTime} minutes</InputGroupText>
              </InputGroup>
              <FieldDescription>
                total time invested in minutes
              </FieldDescription>
            </Field>
          </div>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="No description provided"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={updateEventDescription}>
                  <Save size={4} />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          {/* Tabs for Comments and Time Tracking */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList>
              <TabsTrigger value="comments">
                <MessageSquare size={4} />
                Comments ({localTask.comments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="time">
                <History size={4} />
                Work Log ({localTask.timeLogs?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Comments Content */}
            <TabsContent value="comments" className="space-y-4 pt-4">
              <InputGroup>
                <InputGroupTextarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ask a question or provide an update..."
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton onClick={onPostComment}>
                    <Send size={4} />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <div className="space-y-4 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {localTask.comments?.map((c: any) => (
                  <Item key={c.id} variant="outline">
                    <ItemContent>
                      <ItemTitle>{c.user.fullName}</ItemTitle>
                      <ItemDescription>{c.content}</ItemDescription>
                    </ItemContent>
                    <ItemFooter className="text-[10px] font-bold text-muted-foreground">
                      {new Date(c.createdAt).toUTCString()}
                    </ItemFooter>
                  </Item>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-6 pt-4">
              <form
                onSubmit={onLogTime}
                className="p-4 rounded-lg border border-slate-200 space-y-3"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Field>
                      <FieldLabel>Minutes</FieldLabel>
                      <Input
                        id="minutes"
                        type="number"
                        placeholder="e.g. 45"
                        value={logMinutes}
                        onChange={(e) => setLogMinutes(e.target.value)}
                        className="bg-white"
                      />
                    </Field>
                    <Button type="submit" size="sm" disabled={isLogging}>
                      <Plus className="w-3.5 h-3.5 mr-2" /> Log Work
                    </Button>
                  </div>
                  <Field>
                    <FieldLabel>Work Description</FieldLabel>
                    <Input
                      id="work-desc"
                      placeholder="What did you do?"
                      value={logDescription}
                      onChange={(e) => setLogDescription(e.target.value)}
                      className="bg-white"
                    />
                  </Field>
                </div>
              </form>

              {/* Work Logs List */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                  History
                </Label>
                <div className="divide-y border rounded-md bg-white">
                  {localTask.timeLogs?.length > 0 ? (
                    localTask.timeLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {log.description || "Research & Development"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(log.startTime).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-primary bg-primary/5"
                        >
                          +{log.durationMin}m
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No time logged for this task yet.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
