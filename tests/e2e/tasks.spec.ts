import { test, expect } from '@playwright/test';

test.describe('Task CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login with test credentials (these should be set up in your test environment)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
  });

  test('should create a new task', async ({ page }) => {
    // Navigate to a project
    await page.click('text=Projects');
    await page.waitForURL('/dashboard/projects');

    // Click on the first project
    await page.click('.grid > div:first-child');
    await page.waitForURL(/\/dashboard\/projects\/[a-f0-9-]+/);

    // Navigate to tasks page
    await page.click('text=View Tasks');
    await page.waitForURL(/\/dashboard\/projects\/[a-f0-9-]+\/tasks/);

    // Click "Add Task" button
    await page.click('text=Add Task');

    // Fill in task form
    await page.fill('input[name="title"]', 'Test Task E2E');
    await page.fill('textarea[name="description"]', 'This is a test task created by E2E tests');
    await page.selectOption('select[name="status"]', 'TODO');
    await page.selectOption('select[name="priority"]', 'HIGH');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify task was created
    await expect(page.locator('text=Test Task E2E')).toBeVisible();
  });

  test('should read/view a task', async ({ page }) => {
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');

    // Click on a task card
    await page.click('.grid > div:first-child');

    // Verify task details page loads
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Description')).toBeVisible();
    await expect(page.locator('text=Comments')).toBeVisible();
  });

  test('should update a task', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');

    // Click on a task card
    await page.click('.grid > div:first-child');

    // Click Edit button
    await page.click('text=Edit');

    // Update task details
    await page.fill('input[name="title"]', 'Updated Task Title');
    await page.selectOption('select[name="status"]', 'IN_PROGRESS');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify task was updated
    await expect(page.locator('text=Updated Task Title')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');

    // Get initial task count
    const initialCount = await page.locator('.grid > div').count();

    // Click on a task card
    await page.click('.grid > div:first-child');

    // Click Delete button
    await page.click('text=Delete');

    // Confirm deletion
    page.on('dialog', (dialog) => dialog.accept());
    await page.click('button:has-text("Delete")');

    // Navigate back to tasks list
    await page.click('text=Back to Tasks');

    // Verify task was deleted
    const finalCount = await page.locator('.grid > div').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('should filter tasks by status', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');

    // Filter by "Todo" status
    await page.selectOption('select:has-text("Status")', 'TODO');

    // Verify filter is applied
    await page.waitForSelector('.grid > div');
    const tasks = await page.locator('.grid > div').all();

    // Verify all visible tasks have TODO status
    for (const task of tasks) {
      await expect(task.locator('text=Todo')).toBeVisible();
    }
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');

    // Filter by "High" priority
    await page.selectOption('select:has-text("Priority")', 'HIGH');

    // Verify filter is applied
    await page.waitForSelector('.grid > div');
    const tasks = await page.locator('.grid > div').all();

    // Verify all visible tasks have HIGH priority
    for (const task of tasks) {
      await expect(task.locator('text=High')).toBeVisible();
    }
  });

  test('should search tasks by title', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');

    // Search for a task
    await page.fill('input[placeholder="Search tasks..."]', 'Test');

    // Verify search is applied
    await page.waitForSelector('.grid > div');
    const tasks = await page.locator('.grid > div').all();

    // Verify all visible tasks contain "Test" in title
    for (const task of tasks) {
      const title = await task.textContent();
      expect(title?.toLowerCase()).toContain('test');
    }
  });

  test('should add a comment to a task', async ({ page }) => {
    // Navigate to a task
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');
    await page.click('.grid > div:first-child');

    // Click on Comments tab
    await page.click('text=Comments');

    // Add a comment
    await page.fill('textarea[placeholder="Add a comment..."]', 'This is a test comment');
    await page.click('button:has-text("Send")');

    // Verify comment was added
    await expect(page.locator('text=This is a test comment')).toBeVisible();
  });

  test('should view task activity log', async ({ page }) => {
    // Navigate to a task
    await page.goto('/dashboard/projects');
    await page.click('.grid > div:first-child');
    await page.click('text=View Tasks');
    await page.click('.grid > div:first-child');

    // Click on Activity tab
    await page.click('text=Activity');

    // Verify activity section is visible
    await expect(page.locator('text=Activity')).toBeVisible();
  });
});
