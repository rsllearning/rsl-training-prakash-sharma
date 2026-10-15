import { chromium } from '@playwright/test';
import { mkdir, rename } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve(process.env.DEMO_OUTPUT_DIR || 'demo-recordings');
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const context = await browser.newContext({
  viewport: { width: 1120, height: 860 },
  recordVideo: { dir: outputDir, size: { width: 1120, height: 860 } },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const video = page.video();
const pause = (ms = 1600) => page.waitForTimeout(ms);
const button = (name) => page.getByRole('button', { name, exact: true });
const taskInput = () => page.getByRole('textbox', { name: 'New Todo', exact: true });
async function add(description) {
  await taskInput().fill(description);
  await button('Add new task').click();
  await pause(1100);
}
async function remove(description) {
  await button(`Delete: ${description}`).click();
  await pause(1100);
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm delete' }).click();
  await pause(1000);
}

try {
  await page.goto(process.env.DEMO_URL || 'http://127.0.0.1:5173');
  await pause(2200);
  await add('Learn ReactJS basics');
  await add('Practice ReactJS');
  await add('Learn Redux');
  await add('Code portfolio in React');
  await add('Learn React Native');

  // Permanent completion and completed-first ordering.
  await page.getByRole('checkbox', { name: 'Complete: Learn ReactJS basics', exact: true }).check();
  await pause(2200);
  await page.screenshot({ path: path.join(outputDir, 'todo-preview.png'), fullPage: true });
  await page.getByRole('checkbox', { name: 'Complete: Learn Redux', exact: true }).check();
  await pause(1800);

  // Cancel an edit, then confirm a different edit.
  await button('Edit: Practice ReactJS').click();
  await pause(1000);
  await page.getByRole('textbox', { name: 'Edit task description' }).fill('This draft will be cancelled');
  await pause(1500);
  await button('Cancel').click();
  await pause();
  await button('Edit: Practice ReactJS').click();
  await page.getByRole('textbox', { name: 'Edit task description' }).fill('Practice ReactJS every day');
  await pause(1400);
  await button('Confirm').click();
  await pause();

  // Each of the three filters.
  await button('Done').click();
  await pause(2200);
  await button('Todo').click();
  await pause(2200);
  await button('All').click();
  await pause(1800);

  // Cancel, then confirm deletion. Completed tasks only expose Delete.
  await button('Delete: Learn Redux').click();
  await pause();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await pause();
  await remove('Learn Redux');
  await page.reload();
  await pause(2000);

  // Empty filter, empty description, then delete everything to the empty state.
  await remove('Learn ReactJS basics');
  await button('Done').click();
  await pause(1800);
  await button('All').click();
  await add('');
  await remove('Empty task');
  await remove('Practice ReactJS every day');
  await remove('Code portfolio in React');
  await remove('Learn React Native');
  await pause(2400);
} finally {
  await context.close();
  await browser.close();
}

const recordedPath = await video.path();
const finalPath = path.join(outputDir, 'todo-demo.webm');
if (recordedPath !== finalPath) await rename(recordedPath, finalPath);
console.log(`Demo video: ${finalPath}`);
console.log(`Screenshot: ${path.join(outputDir, 'todo-preview.png')}`);
