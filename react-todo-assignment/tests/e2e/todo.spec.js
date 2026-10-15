import { test, expect } from '@playwright/test';

const input = (page) => page.getByRole('textbox', { name: 'New Todo', exact: true });
const rows = (page) => page.getByRole('listitem');
const row = (page, text) => rows(page).filter({ has: page.locator('.todo-description').filter({ hasText: text }) });
async function add(page, text) {
  await input(page).fill(text);
  await page.getByRole('button', { name: 'Add new task', exact: true }).click();
}

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('starts empty, accepts empty descriptions and hides filters after the final deletion', async ({ page }) => {
  await expect(page.getByText('No todo is available', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filter todos' })).toHaveCount(0);
  await add(page, '');
  await expect(rows(page)).toHaveCount(1);
  await expect(page.getByRole('group', { name: 'Filter todos' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete: Empty task', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete' }).click();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.getByText('No todo is available', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filter todos' })).toHaveCount(0);
});

test('new tasks append and arbitrary descriptions render safely as text', async ({ page }) => {
  await add(page, 'First task');
  await input(page).fill('Second task');
  await input(page).press('Enter');
  await add(page, '<img src=x onerror=alert(1)> ✅ हिंदी');
  await add(page, '   ');
  await expect(rows(page)).toHaveCount(4);
  await expect(page.locator('.todo-description')).toHaveText(['First task', 'Second task', '<img src=x onerror=alert(1)> ✅ हिंदी', '']);
  await expect(rows(page).locator('img')).toHaveCount(0);
  await expect(input(page)).toHaveValue('');
});

test('editing prefills text, cancel restores it, and confirm saves it', async ({ page }) => {
  await add(page, 'Original');
  await row(page, 'Original').getByRole('button', { name: 'Edit: Original', exact: true }).click();
  const edit = page.getByRole('textbox', { name: 'Edit task description' });
  await expect(edit).toHaveValue('Original');
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  await edit.fill('Discarded');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.todo-description')).toHaveText(['Original']);
  await page.getByRole('button', { name: 'Edit: Original', exact: true }).click();
  await edit.fill('Updated');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('.todo-description')).toHaveText(['Updated']);
  await expect(page.getByRole('checkbox', { name: 'Complete: Updated', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Delete: Updated', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit: Updated', exact: true }).click();
  await edit.fill('');
  await edit.press('Enter');
  await expect(page.locator('.todo-description')).toHaveText(['Empty task']);
});

test('Escape cancels inline edits and the delete dialog', async ({ page }) => {
  await add(page, 'Keep me');
  await page.getByRole('button', { name: 'Edit: Keep me' }).click();
  const edit = page.getByRole('textbox', { name: 'Edit task description' });
  await edit.fill('Discard');
  await edit.press('Escape');
  await expect(page.locator('.todo-description')).toHaveText(['Keep me']);
  await page.getByRole('button', { name: 'Delete: Keep me' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(rows(page)).toHaveCount(1);
});

test('completed tasks move first, have strikethrough and cannot be edited or reopened', async ({ page }) => {
  await add(page, 'Pending one');
  await add(page, 'Finish this');
  await page.getByRole('checkbox', { name: 'Complete: Finish this', exact: true }).check();
  await expect(page.locator('.todo-description')).toHaveText(['Finish this', 'Pending one']);
  const completed = rows(page).first();
  await expect(completed.getByRole('checkbox')).toBeChecked();
  await expect(completed.getByRole('checkbox')).toBeDisabled();
  await expect(completed.getByRole('button', { name: /^Edit:/ })).toHaveCount(0);
  await expect(completed.locator('.todo-description')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(completed.getByRole('button', { name: 'Delete: Finish this' })).toBeVisible();
  await add(page, 'New last task');
  await expect(page.locator('.todo-description')).toHaveText(['Finish this', 'Pending one', 'New last task']);
});

test('All, Done and Todo are exclusive, show matching tasks and keep filters usable on no matches', async ({ page }) => {
  await add(page, 'Pending');
  const all = page.getByRole('button', { name: 'All', exact: true });
  const done = page.getByRole('button', { name: 'Done', exact: true });
  const todo = page.getByRole('button', { name: 'Todo', exact: true });
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(all).toHaveCSS('opacity', '0.6');
  await done.click();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.getByText('No todo is available', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Filter todos' })).toBeVisible();
  await expect(page.locator('.filter-button[aria-pressed="true"]')).toHaveCount(1);
  await expect(done).toHaveCSS('opacity', '0.6');
  await todo.click();
  await expect(page.locator('.todo-description')).toHaveText(['Pending']);
  await add(page, 'Completed');
  await page.getByRole('checkbox', { name: 'Complete: Completed', exact: true }).check();
  await done.click();
  await expect(page.locator('.todo-description')).toHaveText(['Completed']);
  await todo.click();
  await expect(page.locator('.todo-description')).toHaveText(['Pending']);
  await all.click();
  await expect(page.locator('.todo-description')).toHaveText(['Completed', 'Pending']);
  await done.click();
  await add(page, 'Visible new task');
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.todo-description')).toHaveText(['Completed', 'Pending', 'Visible new task']);
});

test('delete cancellation preserves a task and confirmation removes pending or completed tasks', async ({ page }) => {
  await add(page, 'Keep until confirmed');
  await add(page, 'Completed to delete');
  await page.getByRole('checkbox', { name: 'Complete: Completed to delete', exact: true }).check();
  await page.getByRole('button', { name: 'Delete: Keep until confirmed' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(rows(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'Delete: Keep until confirmed' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete' }).click();
  await expect(page.locator('.todo-description')).toHaveText(['Completed to delete']);
  await page.getByRole('button', { name: 'Delete: Completed to delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete' }).click();
  await expect(rows(page)).toHaveCount(0);
});

test('saved edits, completion and deletion survive a page reload', async ({ page }) => {
  await add(page, 'Saved pending');
  await add(page, 'Saved complete');
  await add(page, 'Removed');
  await page.getByRole('button', { name: 'Edit: Saved pending' }).click();
  await page.getByRole('textbox', { name: 'Edit task description' }).fill('Saved edited');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Complete: Saved complete', exact: true }).check();
  await page.getByRole('button', { name: 'Delete: Removed' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete' }).click();
  await page.reload();
  await expect(page.locator('.todo-description')).toHaveText(['Saved complete', 'Saved edited']);
  await expect(page.getByRole('checkbox', { name: 'Completed: Saved complete', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('corrupt storage and blocked storage do not prevent task management', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('react-todo-assignment:v1', '{invalid'));
  await page.reload();
  await expect(page.getByText('No todo is available', { exact: true })).toBeVisible();
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } });
  });
  await page.reload();
  await add(page, 'Session task');
  await expect(page.locator('.todo-description')).toHaveText(['Session task']);
  await expect(page.getByText(/could not be saved for your next visit/)).toBeVisible();
});

test('mobile view wraps long tasks and keeps editing and dialogs inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await add(page, 'LongUnbrokenTask'.repeat(60));
  await expect(rows(page)).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await rows(page).getByRole('button', { name: /^Edit:/ }).click();
  await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await rows(page).getByRole('button', { name: /^Delete:/ }).click();
  await expect(page.getByRole('dialog')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Confirm delete' })).toBeInViewport();
});

test('ordinary interactions produce no browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await add(page, 'Check console');
  await page.getByRole('checkbox', { name: 'Complete: Check console', exact: true }).check();
  await page.getByRole('button', { name: 'Delete: Check console' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete' }).click();
  expect(errors).toEqual([]);
});
