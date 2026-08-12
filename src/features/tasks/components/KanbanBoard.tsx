'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTasksWithDetails, useUpdateTask } from '../hooks/useTasks';
import { TaskStatus, TaskPriority, TaskUpdate, type TaskWithDetails } from '../types';
import { calculateNewPosition } from '../utils/position';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskCard } from './KanbanTaskCard';

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [filters, setFilters] = useState<{
    priority?: TaskPriority;
    assignee_id?: string;
  }>({});

  const { data: tasks, isLoading } = useTasksWithDetails(projectId, filters);
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null);

  // Group tasks by status
  const tasksByStatus = tasks?.reduce(
    (acc, task) => {
      const status = task.status as TaskStatus;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    },
    {} as Record<TaskStatus, TaskWithDetails[]>
  ) || { TODO: [], IN_PROGRESS: [], DONE: [] };

  // Sort tasks by position within each column
  (Object.keys(tasksByStatus) as TaskStatus[]).forEach((status) => {
    tasksByStatus[status].sort((a, b) => (a.position || 0) - (b.position || 0));
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks?.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks?.find((t) => t.id === activeId);
    const overTask = tasks?.find((t) => t.id === overId);

    if (!activeTask || !overTask) return;

    // If dragging over a column (not a task)
    if (overId === overTask?.status) {
      // Moving to empty column
      const columnTasks = tasksByStatus[overId as TaskStatus] || [];
      const newPosition = calculateNewPosition(
        columnTasks.map((t) => ({ id: t.id, position: t.position || 0 })),
        0,
        activeId
      );

      updateTask.mutate({
        id: activeId,
        updates: {
          status: overId as TaskStatus,
          position: newPosition,
        } as TaskUpdate & { position: number },
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks?.find((t) => t.id === activeId);
    const overTask = tasks?.find((t) => t.id === overId);

    if (!activeTask) return;

    // If dropping on a column header
    if (COLUMNS.some((col) => col.id === overId)) {
      const columnTasks = tasksByStatus[overId as TaskStatus] || [];
      const newPosition = calculateNewPosition(
        columnTasks.map((t) => ({ id: t.id, position: t.position || 0 })),
        columnTasks.length,
        activeId
      );

      updateTask.mutate({
        id: activeId,
        updates: {
          status: overId as TaskStatus,
          position: newPosition,
        } as any,
      });
      return;
    }

    // If dropping on a task
    if (overTask) {
      const targetStatus = overTask.status as TaskStatus;
      const columnTasks = tasksByStatus[targetStatus] || [];

      // Find the index where the task is being dropped
      const targetIndex = columnTasks.findIndex((t) => t.id === overId);
      const newPosition = calculateNewPosition(
        columnTasks.map((t) => ({ id: t.id, position: t.position || 0 })),
        targetIndex,
        activeId
      );

      updateTask.mutate({
        id: activeId,
        updates: {
          status: targetStatus,
          position: newPosition,
        } as TaskUpdate & { position: number },
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={filters.priority || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              priority: e.target.value as TaskPriority | undefined,
            })
          }
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>

        <select
          value={filters.assignee_id || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              assignee_id: e.target.value || undefined,
            })
          }
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Assignees</option>
          {Array.from(
            new Set(tasks?.map((t) => t.assignee_id).filter((id): id is string => id !== null) || [])
          ).map((assigneeId) => (
            <option key={assigneeId} value={assigneeId}>
              {tasks?.find((t) => t.assignee_id === assigneeId)?.assignee?.username}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" data-testid="kanban-board">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              label={column.label}
              tasks={tasksByStatus[column.id] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanTaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
