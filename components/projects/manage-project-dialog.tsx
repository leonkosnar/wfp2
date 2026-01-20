"use client";
import { useState, useEffect, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  ShieldAlert,
  Trash2,
  Crown,
  Search,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Field, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ProjectAccessDialog({
  project,
  currentOwnerId,
  members: initialMembers,
}: any) {
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [searchResults, setSearchResults] = useState([]);
  const [members, setMembers] = useState(initialMembers);
  const router = useRouter();

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      const res = await fetch(`/api/users/search?q=${val}`);
      const data = await res.json();
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const editName = async () => {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, description }),
    });
    if (res.ok) {
      router.refresh();
    }
  };

  const addMember = async (userId: string) => {
    const res = await fetch(`/api/projects/${project.id}/members`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      router.refresh();
      setQuery("");
      setSearchResults([]);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to DELETE this project?")) return;
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  };

  const removeMember = async (membershipId: string) => {
    if (!confirm("Remove this member from the project?")) return;
    const res = await fetch(`/api/projects/${project.id}/members`, {
      method: "DELETE",
      body: JSON.stringify({ membershipId }),
    });
    if (res.ok) router.refresh();
  };

  const transferOwnership = async (newOwnerId: string) => {
    const confirmTransfer = confirm(
      "Are you sure? You will no longer be the owner of this project.",
    );
    if (!confirmTransfer) return;

    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      body: JSON.stringify({ ownerId: newOwnerId }),
    });
    if (res.ok) {
      router.refresh();
      alert("Ownership transferred successfully.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" /> Manage Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        {/* Search for new members */}
        <div className="space-y-2 pt-4">
          <Field>
            <FieldLabel>Project Title</FieldLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Button onClick={editName} variant="default">Save</Button>
          <Field>
            <FieldLabel>Add Members</FieldLabel>
            <InputGroup>
              <InputGroupInput
                placeholder="Invite by email..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <InputGroupAddon>
                <Search size={4} />
              </InputGroupAddon>
            </InputGroup>
          </Field>

          {searchResults.length > 0 && (
            <div className="border rounded-md divide-y shadow-sm">
              {searchResults.map((user: any) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-2 bg-white"
                >
                  <span className="text-sm font-medium">{user.fullName}</span>
                  <Button size="sm" onClick={() => addMember(user.id)}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Members List */}
        <Field>
          <FieldLabel>Edit Members</FieldLabel>
          <div className="space-y-3">
            {members.map((member: any) => {
              const isOwner = member.user.id === currentOwnerId;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.user.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">
                        {member.user.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <Badge variant="secondary" className="text-[10px]">
                        <Crown className="w-3 h-3 mr-1" /> Owner
                      </Badge>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Transfer Ownership"
                          onClick={() => transferOwnership(member.user.id)}
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Field>
        <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDelete} variant="destructive">Delete Project</Button>
        </CardContent>
      </Card>
      </DialogContent>
    </Dialog>
  );
}
