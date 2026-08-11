'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import type {
  TaskWithDetails,
  TaskFilters,
  TaskSortOptions,
  TaskPriority,
  TaskStatus,
  TaskInsert,
} from '../types';

interface TaskListProps {
  tasks: TaskWithDetails[];
  loading?: boolean;
  onViewTask: (id: string) => void;
  onCreateTask: (data: TaskInsert) => Promise<void>;
  onEditTask?: (id: string) => void;
  canEdit?: boolean;
  projectId: string;
  members?: Array<{ id: string; username: string; avatar_url: string | null }>;
  onFilterChange?: (filters: TaskFilters) => void;
  onSortChange?: (sort: TaskSortOptions) => void;
}

export function TaskList({
  tasks,
  loading = false,
  onViewTask,
  onCreateTask,
  onEditTask,
  canEdit = false,
  projectId,
  members = [],
  onFilterChange,
  onSortChange,
}: TaskListProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'priority' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange?.({ search: value || undefined });
  };

  const handleStatusChange = (value: TaskStatus | 'all') => {
    setStatusFilter(value);
    onFilterChange?.({
      status: value === 'all' ? undefined : value,
      search: searchTerm || undefined,
    });
  };

  const handlePriorityChange = (value: TaskPriority | 'all') => {
    setPriorityFilter(value);
    onFilterChange?.({
      priority: value === 'all' ? undefined : value,
      search: searchTerm || undefined,
    });
  };

  const handleSortChange = (field: 'created_at' | 'priority' | 'status') => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    onSortChange?.({ field, order: newOrder });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSortChange('created_at')}
            title="Sort by date"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tasks found. {canEdit && 'Create your first task to get started.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={onViewTask}
              onEdit={onEditTask}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={onCreateTask}
          projectId={projectId}
          members={members}
        />
      )}
    </div>
  );
}
