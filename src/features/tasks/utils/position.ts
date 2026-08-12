/**
 * Fractional position utility for Kanban board drag and drop
 * Uses fractional positioning to avoid full-column rewrites on drag
 */

export interface TaskWithPosition {
  id: string;
  position: number;
}

/**
 * Calculate a new fractional position between two existing positions
 * @param beforePosition Position of the task before (or undefined if inserting at start)
 * @param afterPosition Position of the task after (or undefined if inserting at end)
 * @returns A new fractional position between the two
 */
export function calculateFractionalPosition(
  beforePosition?: number,
  afterPosition?: number
): number {
  // If no tasks in column, start at 0
  if (beforePosition === undefined && afterPosition === undefined) {
    return 0;
  }

  // If inserting at start, place before the first task
  if (beforePosition === undefined) {
    return afterPosition! - 1;
  }

  // If inserting at end, place after the last task
  if (afterPosition === undefined) {
    return beforePosition + 1;
  }

  // Calculate midpoint between two positions
  return (beforePosition + afterPosition) / 2;
}

/**
 * Get the position of the task before the target index in a sorted list
 */
export function getBeforePosition(
  tasks: TaskWithPosition[],
  targetIndex: number
): number | undefined {
  if (targetIndex === 0) return undefined;
  return tasks[targetIndex - 1].position;
}

/**
 * Get the position of the task after the target index in a sorted list
 */
export function getAfterPosition(
  tasks: TaskWithPosition[],
  targetIndex: number
): number | undefined {
  if (targetIndex >= tasks.length - 1) return undefined;
  return tasks[targetIndex + 1].position;
}

/**
 * Calculate new position when moving a task to a specific index in a column
 */
export function calculateNewPosition(
  tasksInColumn: TaskWithPosition[],
  targetIndex: number,
  taskId: string
): number {
  // Filter out the task being moved from the column
  const otherTasks = tasksInColumn.filter((t) => t.id !== taskId);
  
  // Get positions before and after the target index
  const beforePosition = getBeforePosition(otherTasks, targetIndex);
  const afterPosition = getAfterPosition(otherTasks, targetIndex);
  
  return calculateFractionalPosition(beforePosition, afterPosition);
}

/**
 * Normalize positions if they get too close to each other
 * This is a safety measure to prevent precision issues
 */
export function normalizePositions(tasks: TaskWithPosition[]): TaskWithPosition[] {
  const sorted = [...tasks].sort((a, b) => a.position - b.position);
  return sorted.map((task, index) => ({
    ...task,
    position: index * 1000, // Reset to clean integer positions
  }));
}
