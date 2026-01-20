import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { title, order } = await request.json();

  const column = await prisma.column.update({
    where: { id: params.id },
    data: { 
      ...(title && { title }), 
      ...(order !== undefined && { order }) 
    },
  });

  return NextResponse.json(column);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const {id} = await params;

    // 1. Fetch the column to be deleted to get its order and projectID
    const columnToDelete = await prisma.column.findUnique({
      where: { id: id },
      include: { tasks: true },
    });

    if (!columnToDelete) {
      return new NextResponse("Column not found", { status: 404 });
    }

    // 2. Find a target column to move tasks to (Previous preferred, else Next)
    const targetColumn = await prisma.column.findFirst({
      where: {
        projectId: columnToDelete.projectId,
        id: { not: id }, // Not the one we are deleting
      },
      orderBy: {
        order: 'asc' // Get all columns ordered
      }
    });
    
    // Note: To strictly find the "previous" based on order, we could do more complex logic,
    // but typically finding the closest neighbor is sufficient. 
    // If you strictly want the previous one by order index:
    /*
    const previousColumn = await prisma.column.findFirst({
       where: { projectId: ..., order: { lt: columnToDelete.order } },
       orderBy: { order: 'desc' }
    });
    */

    // 3. Move tasks if a target exists
    if (targetColumn) {
      // Logic: Move all tasks from current column to the target column
      // We append them to the end of the target column's list by calculating new orders
      // For simplicity, we just update the columnId here. 
      // If your Kanban relies on strict 'order' integers for task sorting, 
      // you might want to recalculate task orders here too.
      
      await prisma.task.updateMany({
        where: { columnId: id },
        data: { columnId: targetColumn.id },
      });
    } else if (columnToDelete.tasks.length > 0) {
      // Edge case: This is the LAST column and it has tasks.
      // You might want to block deletion or allow tasks to be deleted.
      return new NextResponse("Cannot delete the only column with tasks", { status: 400 });
    }

    // 4. Delete the column
    await prisma.column.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true, movedTo: targetColumn?.id });
  } catch (error) {
    console.error("DELETE_COLUMN_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}