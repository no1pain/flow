'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TaskWithDetails } from '../types';
import { KanbanTaskCard } from './KanbanTaskCard';

interface KanbanColumnProps {
  id: string;
  label: string;
  tasks: TaskWithDetails[];
  onDeleteTask?: (taskId: string) => void;
}

export function KanbanColumn({ id, label, tasks, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-muted/50 rounded-lg p-4" data-testid={`column-${id}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{label}</h3>
          <span className="text-sm text-muted-foreground">{tasks.length}</span>
        </div>

        <SortableContext
          id={id}
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
            {tasks.map((task) => (
              <KanbanTaskCard key={task.id} task={task} onDelete={onDeleteTask} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No tasks</div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
