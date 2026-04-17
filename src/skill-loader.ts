import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { homedir } from 'node:os';

const DEFAULT_SKILL_URL =
  'https://raw.githubusercontent.com/PaystackOSS/paystack-mcp-server/main/src/data/paystack-skill.md';

const CACHE_DIR = path.join(homedir(), '.paystack-mcp');
const CACHE_PATH = path.join(CACHE_DIR, 'skill-cache.md');
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours

export async function loadSkillContent(bundledPath: string): Promise<string> {
  const url = process.env.PAYSTACK_SKILL_URL || DEFAULT_SKILL_URL;

  try {
    // Check disk cache freshness
    const stat = await fs.stat(CACHE_PATH);
    if (Date.now() - stat.mtimeMs < MAX_AGE_MS) {
      return await fs.readFile(CACHE_PATH, 'utf-8');
    }
  } catch {
    // Cache missing or unreadable — continue to fetch
  }

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const text = await res.text();
      if (text.includes('name: paystack')) {
        try {
          await fs.mkdir(CACHE_DIR, { recursive: true });
          await fs.writeFile(CACHE_PATH, text, 'utf-8');
        } catch {
          // Cache write failed — non-fatal
        }
        return text;
      }
    }
  } catch {
    // Fetch failed or timed out — fall through
  }

  // Fallback: stale cache → bundled file
  try {
    return await fs.readFile(CACHE_PATH, 'utf-8');
  } catch {
    return await fs.readFile(bundledPath, 'utf-8');
  }
}
