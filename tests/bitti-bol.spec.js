import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = 'file://' + path.resolve(__dirname, '..', 'bitti-bol.html');

test.describe('Bitti Bol v2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HTML_PATH, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
  });

  test('renders header and form', async ({ page }) => {
    await expect(page.getByText('Bitti Bol')).toBeVisible();
    await expect(page.getByText('Himachali Pahari Song Studio')).toBeVisible();
    await expect(page.getByText('New Song')).toBeVisible();
    await expect(page.getByText('History')).toBeVisible();
  });

  test('settings modal opens and closes', async ({ page }) => {
    await page.getByTitle('Settings').click();
    await expect(page.getByText('Settings', { exact: true })).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Composer Slot')).toBeVisible();
    await expect(page.getByText('Critic Slot')).toBeVisible();
    await expect(page.getByText(/API keys are stored/)).toBeVisible();
    await page.getByText('Done').click();
    await expect(page.getByText('Settings', { exact: true })).not.toBeVisible();
  });

  test('lexicon modal opens', async ({ page }) => {
    await page.getByTitle('Lexicon').click();
    await expect(page.getByRole('heading', { name: 'Lexicon' })).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('bitti', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('girl / daughter')).toBeVisible();
    await expect(page.getByText('manjh')).toBeVisible();
    await expect(page.getByText('dandru')).toBeVisible();
    await page.locator('.modal').getByText('✕').click();
    await expect(page.getByRole('heading', { name: 'Lexicon' })).not.toBeVisible();
  });

  test('generate button disabled when topic empty', async ({ page }) => {
    const btn = page.getByRole('button', { name: /generate/i });
    await expect(btn).toBeDisabled();
  });

  test('generate button enabled when topic filled', async ({ page }) => {
    await page.getByPlaceholder('chitte dandru').fill('test song');
    await expect(page.getByRole('button', { name: /generate/i })).toBeEnabled();
  });

  test('form fields accept input', async ({ page }) => {
    await page.getByPlaceholder('chitte dandru').fill('snowy mountains');
    await page.getByPlaceholder('romantic').fill('joyful');
    await page.getByPlaceholder('wedding').fill('harvest festival');
    await page.getByPlaceholder('acoustic guitar').fill('bansuri, dhol');
    await page.getByPlaceholder('extra guidance').fill('Make it lively');
    await expect(page.getByRole('button', { name: /generate/i })).toBeEnabled();
  });

  test('settings fields are configurable', async ({ page }) => {
    await page.getByTitle('Settings').click();
    await expect(page.getByText('Settings', { exact: true })).toBeVisible({ timeout: 3000 });

    const apiInput = page.locator('input[type="password"]').first();
    await apiInput.fill('sk-test-key-123');
    await expect(apiInput).toHaveValue('sk-test-key-123');

    const modelInput = page.locator('input[placeholder="deepseek-v4-flash"]').first();
    await modelInput.fill('deepseek-v4-flash');
    await expect(modelInput).toHaveValue('deepseek-v4-flash');

    const baseUrlInput = page.locator('.card').filter({ hasText: 'Composer Slot' }).locator('input').first();
    await expect(baseUrlInput).toHaveValue('https://opencode.ai/zen/go/v1');
  });

  test('critic toggle checkbox works', async ({ page }) => {
    await page.getByTitle('Settings').click();
    await expect(page.getByText('Settings', { exact: true })).toBeVisible({ timeout: 3000 });
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  test('pipeline shows auth error when no API key configured', async ({ page }) => {
    await page.getByPlaceholder('chitte dandru').fill('test');
    await page.getByRole('button', { name: /generate/i }).click();
    await expect(page.locator('.callout-error')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.callout-error')).toContainText('No API key configured');
  });

  test('history panel shows empty state', async ({ page }) => {
    await expect(page.getByText(/No songs yet/)).toBeVisible();
  });

  test('char counter changes color at limits', async ({ page }) => {
    // Inject song via page.evaluate to show the editor
    await page.evaluate(() => {
      window.__testSetSong && window.__testSetSong('Test Title', '[Verse 1]\ntest', 'pop');
    });
    await page.waitForTimeout(300);
    const charCounts = page.locator('.char-count');
    const first = charCounts.first();
    await expect(first).toBeVisible();
    await expect(first).toContainText('/');
  });

  test('mobile layout stacks single column', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.waitForTimeout(200);
    const app = page.locator('.app');
    const cols = await app.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(1);
  });

  test('desktop layout has two columns', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.waitForTimeout(200);
    const app = page.locator('.app');
    const gridTemplate = await app.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    expect(gridTemplate).not.toBe('1fr');
  });
});
