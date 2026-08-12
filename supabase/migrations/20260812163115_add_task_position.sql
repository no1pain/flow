-- Add position column to tasks table for fractional ordering
ALTER TABLE tasks ADD COLUMN position NUMERIC DEFAULT 0;

-- Create index for position ordering
CREATE INDEX idx_tasks_position ON tasks(project_id, status, position);

-- Update existing tasks to have sequential positions based on created_at
WITH numbered_tasks AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id, status ORDER BY created_at) as row_num
  FROM tasks
)
UPDATE tasks 
SET position = row_num 
FROM numbered_tasks 
WHERE tasks.id = numbered_tasks.id;
