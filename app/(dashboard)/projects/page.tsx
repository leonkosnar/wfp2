import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: user?.id }, { members: { some: { userId: user?.id } } }],
    },
    include: {
      owner: { select: { fullName: true } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <title>Jirassic Projects</title>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your workspaces and team collaborations.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="hover:border-primary transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="font-mono">
                    {project.key}
                  </Badge>
                  {project.ownerId === user?.id && (
                    <Badge variant="secondary">Owner</Badge>
                  )}
                </div>
                <CardTitle className="mt-2">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{project._count.tasks} Tasks</span>
                  <span>{project._count.members} Members</span>
                </div>
                <p className="text-xs mt-4 text-muted-foreground italic">
                  Owned by {project.owner.fullName}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
