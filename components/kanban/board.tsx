"use client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import { TaskDetailSheet } from "./task-detail-sheet";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import {
  ChevronDown,
  ChevronsUp,
  ChevronUp,
  X,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function KanbanBoard({
  initialData,
  projectId,
  projectMembers,
}: {
  initialData: any[];
  projectId: string;
  projectMembers: any[];
}) {
  const [columns, setColumns] = useState(initialData);
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // New State for Adding Columns
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task: any) => {
        const matchesAssignee =
          filterAssignee === "all" || task.assigneeId === filterAssignee;
        const matchesPriority =
          filterPriority === "all" || task.priority === filterPriority;
        return matchesAssignee && matchesPriority;
      }),
    }));
  }, [columns, filterAssignee, filterPriority]);

  const clearFilters = () => {
    setFilterAssignee("all");
    setFilterPriority("all");
  };

  // --- New Handler: Add Column ---
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newColumnTitle,
          order: columns.length, // Put it at the end
        }),
      });

      if (!response.ok) throw new Error("Failed to create column");

      const newColumn = await response.json();
      // Ensure tasks array exists on the new object for local state
      setColumns([...columns, { ...newColumn, tasks: [] }]);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    } catch (error) {
      console.error(error);
      alert("Failed to add column");
    } finally {
      setIsLoading(false);
    }
  };

  // --- New Handler: Delete Column ---
  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm("Are you sure? All tasks in this column will be deleted."))
      return;

    // Optimistic update
    const prevColumns = [...columns];
    setColumns(columns.filter((col) => col.id !== columnId));

    try {
      const response = await fetch(`/api/projects/columns/${columnId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete column");
    } catch (error) {
      console.error(error);
      setColumns(prevColumns); // Rollback
      alert("Failed to delete column");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const sourceCol = columns.find((col) => col.id === source.droppableId);
    const destCol = columns.find((col) => col.id === destination.droppableId);

    if (!sourceCol || !destCol) return;

    const sourceTasks = [...sourceCol.tasks];
    const destTasks =
      source.droppableId === destination.droppableId
        ? sourceTasks
        : [...destCol.tasks];

    const [movedTask] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, movedTask);

    const newColumns = columns.map((col) => {
      if (col.id === source.droppableId) return { ...col, tasks: sourceTasks };
      if (col.id === destination.droppableId)
        return { ...col, tasks: destTasks };
      return col;
    });

    setColumns(newColumns);

    try {
      const response = await fetch(`/api/tasks/${draggableId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newColumnId: destination.droppableId,
          newOrder: destination.index,
        }),
      });

      if (!response.ok) throw new Error("Failed to save move");
    } catch (error) {
      console.error(error);
      setColumns(initialData);
      alert("Could not save task position.");
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Filters Header */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase pl-2">
            Filter:
          </span>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {projectMembers.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32.5 h-8 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>

          {(filterAssignee !== "all" || filterPriority !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Board Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto pb-4 items-start">
          {filteredColumns.map((column) => (
            <div key={column.id} className="w-80 shrink-0 flex flex-col gap-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  {column.title} ({column.tasks.length})
                </h3>
                {/* Delete Column Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-red-600"
                  onClick={() => handleDeleteColumn(column.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 min-h-37.5 bg-slate-100/50 p-2 rounded-lg"
                  >
                    {column.tasks.map((task: any, index: number) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <Item
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            // 1. Add this custom handler
                            onKeyDown={(e) => {
                              // Check for Enter key
                              if (e.key === "Enter") {
                                handleTaskClick(task);
                              }
                            }}
                            onClick={() => handleTaskClick(task)}
                            className="bg-white p-4 mb-3 cursor-pointer hover:border-primary transition-all shadow-sm active:shadow-md"
                          >
                            <ItemMedia variant="icon">
                              {task.priority == "HIGH" && <ChevronsUp />}
                              {task.priority == "MEDIUM" && <ChevronUp />}
                              {task.priority == "LOW" && <ChevronDown />}
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle>{task.title}</ItemTitle>
                              <ItemDescription>
                                {task.assignee?.fullName &&
                                  task.assignee.fullName}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}

          {/* Add Column Section */}
          <div className="w-80 shrink-0">
            {isAddingColumn ? (
              <div className="bg-slate-50 p-3 rounded-lg border flex flex-col gap-2">
                <Input
                  autoFocus
                  placeholder="Column title..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="h-8 text-sm bg-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") setIsAddingColumn(false);
                  }}
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsAddingColumn(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleAddColumn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-12 border-dashed bg-slate-50 hover:bg-slate-100 text-muted-foreground"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            )}
          </div>
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskDetailSheet
          projectMembers={projectMembers}
          task={selectedTask}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </div>
  );
}
