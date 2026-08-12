import { describe, it, expect } from 'vitest';
import type { TaskWithDetails, TaskFilters, TaskSortOptions } from '@/features/tasks/types';

describe('Task Filtering and Sorting Logic', () => {
  const mockTasks: TaskWithDetails[] = [
    {
      id: '1',
      project_id: 'proj1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'TODO',
      priority: 'HIGH',
      assignee_id: 'user1',
      created_by: 'user1',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
      assignee: { id: 'user1', username: 'alice', avatar_url: null },
      creator: { id: 'user1', username: 'alice', avatar_url: null },
      comment_count: 2,
    },
    {
      id: '2',
      project_id: 'proj1',
      title: 'Task 2',
      description: 'Description 2',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assignee_id: 'user2',
      created_by: 'user1',
      created_at: '2024-01-02T10:00:00Z',
      updated_at: '2024-01-02T10:00:00Z',
      assignee: { id: 'user2', username: 'bob', avatar_url: null },
      creator: { id: 'user1', username: 'alice', avatar_url: null },
      comment_count: 1,
    },
    {
      id: '3',
      project_id: 'proj1',
      title: 'Task 3',
      description: 'Description 3',
      status: 'DONE',
      priority: 'LOW',
      assignee_id: 'user1',
      created_by: 'user2',
      created_at: '2024-01-03T10:00:00Z',
      updated_at: '2024-01-03T10:00:00Z',
      assignee: { id: 'user1', username: 'alice', avatar_url: null },
      creator: { id: 'user2', username: 'bob', avatar_url: null },
      comment_count: 0,
    },
    {
      id: '4',
      project_id: 'proj1',
      title: 'Urgent Task',
      description: 'Description 4',
      status: 'TODO',
      priority: 'URGENT',
      assignee_id: null,
      created_by: 'user1',
      created_at: '2024-01-04T10:00:00Z',
      updated_at: '2024-01-04T10:00:00Z',
      assignee: undefined,
      creator: { id: 'user1', username: 'alice', avatar_url: null },
      comment_count: 5,
    },
  ];

  describe('filterTasks', () => {
    it('should filter tasks by status', () => {
      const filters: TaskFilters = { status: 'TODO' };
      const filtered = mockTasks.filter((task) => {
        if (filters.status && task.status !== filters.status) return false;
        return true;
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((task) => task.status === 'TODO')).toBe(true);
    });

    it('should filter tasks by priority', () => {
      const filters: TaskFilters = { priority: 'HIGH' };
      const filtered = mockTasks.filter((task) => {
        if (filters.priority && task.priority !== filters.priority) return false;
        return true;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].priority).toBe('HIGH');
    });

    it('should filter tasks by assignee_id', () => {
      const filters: TaskFilters = { assignee_id: 'user1' };
      const filtered = mockTasks.filter((task) => {
        if (filters.assignee_id && task.assignee_id !== filters.assignee_id) return false;
        return true;
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.every((task) => task.assignee_id === 'user1')).toBe(true);
    });

    it('should filter tasks by search term (title)', () => {
      const filters: TaskFilters = { search: 'Urgent' };
      const filtered = mockTasks.filter((task) => {
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        return true;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Urgent Task');
    });

    it('should handle case-insensitive search', () => {
      const filters: TaskFilters = { search: 'task' };
      const filtered = mockTasks.filter((task) => {
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        return true;
      });

      expect(filtered).toHaveLength(4);
    });

    it('should apply multiple filters simultaneously', () => {
      const filters: TaskFilters = { status: 'TODO', assignee_id: 'user1' };
      const filtered = mockTasks.filter((task) => {
        if (filters.status && task.status !== filters.status) return false;
        if (filters.assignee_id && task.assignee_id !== filters.assignee_id) return false;
        return true;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('TODO');
      expect(filtered[0].assignee_id).toBe('user1');
    });

    it('should return all tasks when no filters are applied', () => {
      const filters: TaskFilters = {};
      const filtered = mockTasks.filter((task) => {
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.assignee_id && task.assignee_id !== filters.assignee_id) return false;
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        return true;
      });

      expect(filtered).toHaveLength(4);
    });
  });

  describe('sortTasks', () => {
    it('should sort tasks by created_at descending', () => {
      const sort: TaskSortOptions = { field: 'created_at', order: 'desc' };
      const sorted = [...mockTasks].sort((a, b) => {
        const comparison = new Date(a[sort.field]).getTime() - new Date(b[sort.field]).getTime();
        return sort.order === 'asc' ? comparison : -comparison;
      });

      expect(sorted[0].id).toBe('4');
      expect(sorted[3].id).toBe('1');
    });

    it('should sort tasks by created_at ascending', () => {
      const sort: TaskSortOptions = { field: 'created_at', order: 'asc' };
      const sorted = [...mockTasks].sort((a, b) => {
        const comparison = new Date(a[sort.field]).getTime() - new Date(b[sort.field]).getTime();
        return sort.order === 'asc' ? comparison : -comparison;
      });

      expect(sorted[0].id).toBe('1');
      expect(sorted[3].id).toBe('4');
    });

    it('should sort tasks by priority', () => {
      const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };
      const sort: TaskSortOptions = { field: 'priority', order: 'desc' };
      const sorted = [...mockTasks].sort((a, b) => {
        const comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        return sort.order === 'asc' ? comparison : -comparison;
      });

      expect(sorted[0].priority).toBe('URGENT');
      expect(sorted[3].priority).toBe('LOW');
    });

    it('should sort tasks by status', () => {
      const statusOrder = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
      const sort: TaskSortOptions = { field: 'status', order: 'asc' };
      const sorted = [...mockTasks].sort((a, b) => {
        const comparison = statusOrder[a.status] - statusOrder[b.status];
        return sort.order === 'asc' ? comparison : -comparison;
      });

      expect(sorted[0].status).toBe('TODO');
      expect(sorted[3].status).toBe('DONE');
    });

    it('should sort tasks by title alphabetically', () => {
      const sort: TaskSortOptions = { field: 'title', order: 'asc' };
      const sorted = [...mockTasks].sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        const comparison = (aValue || '').localeCompare(bValue || '');
        return sort.order === 'asc' ? comparison : -comparison;
      });

      expect(sorted[0].title).toBe('Task 1');
      expect(sorted[3].title).toBe('Urgent Task');
    });
  });

  describe('combined filter and sort', () => {
    it('should filter and then sort tasks', () => {
      const filters: TaskFilters = { status: 'TODO' };
      const sort: TaskSortOptions = { field: 'created_at', order: 'desc' };

      let filtered = mockTasks.filter((task) => {
        if (filters.status && task.status !== filters.status) return false;
        return true;
      });

      filtered = filtered.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        const comparison = new Date(aValue || '').getTime() - new Date(bValue || '').getTime();
        return sort.order === 'asc' ? comparison : -comparison;
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('4');
      expect(filtered[1].id).toBe('1');
    });
  });
});
