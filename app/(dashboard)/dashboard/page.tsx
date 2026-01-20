import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");
  
const projects = await prisma.project.findMany({
  where: {
    OR: [
      { ownerId: user?.id },
      { members: { some: { userId: user?.id } } },
    ],
  },
  select: {
    id: true,
    title: true,
    key: true,
    description: true,
    columns: {
      orderBy: { order: "asc" },
      select: {
        title: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    },
  },
});

  return (
    <div className="space-y-8">
      <title>Jirassic Dashboard</title>
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.fullName}</h1>
        <p className="text-muted-foreground">Here is what is happening across your projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded uppercase tracking-wider text-slate-600">
                    {project.key}
                  </span>
                </div>
                <CardTitle className="mt-2">{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
                <div className="flex gap-2 pt-4 text-sm text-muted-foreground">
                {project.columns.map((col, i) => (<span key={i}>{col.title}: {col._count.tasks}</span>))}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}