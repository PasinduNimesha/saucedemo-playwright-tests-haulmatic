import { Page, Response } from '@playwright/test';

/**
 * Utility helpers shared across test suites.
 */

// ── Sorting utilities ──────────────────────────────────────────────────────────

/** Returns true if the array is sorted in ascending order. */
export function isSortedAscending(arr: number[]): boolean {
  return arr.every((val, i) => i === 0 || arr[i - 1] <= val);
}

/** Returns true if the array is sorted in descending order. */
export function isSortedDescending(arr: number[]): boolean {
  return arr.every((val, i) => i === 0 || arr[i - 1] >= val);
}

// ── Price utilities ────────────────────────────────────────────────────────────

/** Strips the leading dollar sign and returns a float. */
export function parsePriceText(priceText: string): number {
  return parseFloat(priceText.replace('$', '').trim());
}

/** Rounds a number to two decimal places. */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

// ── Network / response utilities ───────────────────────────────────────────────

/**
 * Intercepts all XHR/fetch requests for a URL pattern and returns a mock
 * response with the provided JSON body and status code.
 *
 * Usage:
 *   await mockApiResponse(page, '**/api/endpoint', { error: 'Service unavailable' }, 503);
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string,
  body: Record<string, unknown>,
  status = 200,
): Promise<void> {
  await page.route(urlPattern, route =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    }),
  );
}

/**
 * Simulates a network failure for a given URL pattern by aborting the request.
 */
export async function simulateNetworkFailure(
  page: Page,
  urlPattern: string,
): Promise<void> {
  await page.route(urlPattern, route => route.abort('failed'));
}

/**
 * Waits for a specific network request matching the URL pattern and returns
 * its response, useful for validating API calls triggered by UI actions.
 */
export async function waitForRequest(
  page: Page,
  urlPattern: string,
): Promise<Response> {
  return page.waitForResponse(urlPattern);
}

// ── Screenshot utilities ───────────────────────────────────────────────────────

/** Takes a named screenshot, useful for attaching evidence in reports. */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

// ── Date / string utilities ────────────────────────────────────────────────────

/** Returns a timestamp string suitable for use in filenames. */
export function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/** Generates a random alphanumeric string of the given length. */
export function randomString(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}
