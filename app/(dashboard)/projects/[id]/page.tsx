// app/(dashboard)/projects/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban/board";
import { ProjectAccessDialog } from "@/components/projects/manage-project-dialog";
import { notFound, redirect } from "next/navigation";
import { CreateTaskDialog } from "@/components/kanban/create-task-dialog";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return redirect("/login");

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      activityLogs: { take: 10 },
      members: { include: { user: true } },
      columns: {
        include: {
          tasks: {
            include: {
              assignee: true,
              comments: { include: { user: true } }, // For comment visibility
              timeLogs: true, // For time log visibility
            },
          },
        },
      },
    },
  });

  if (!project) return notFound();

  if (!project.members.map((member) => member.userId).includes(currentUser.id))
    return <p>ACCESS DENIED</p>;

  const firstColumnId = project.columns[0]?.id;

  return (
    <div className="h-full flex flex-col gap-6">
      <title>Jirassic Project</title>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Clock size={4} /> Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Activity</DialogTitle>
              <div className="flex flex-col gap-2 overflow-y-auto">
              {project.activityLogs.map((act, i) => (
                <div key={i} className="border p-1">{act.entityTitle}</div>
              ))}
              </div>
            </DialogContent>
          </Dialog>
          <a href={`/api/projects/${project.id}/export`} target="_blank">
            <Button size="sm" variant="outline">
              <ExternalLink size={4} />
              Export
            </Button>
          </a>
          {currentUser.id == project.ownerId && (
            <ProjectAccessDialog
              project={project}
              currentOwnerId={project.ownerId}
              members={project.members}
            />
          )}
          <CreateTaskDialog projectId={project.id} columnId={firstColumnId} />
        </div>
      </div>
      <KanbanBoard
        initialData={project.columns}
        projectId={project.id}
        projectMembers={project.members.map((projMember) => projMember.user)}
      />
    </div>
  );
}
