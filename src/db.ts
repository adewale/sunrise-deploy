export async function retryD1<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      last = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/SQLITE_BUSY|database is locked|network|timeout|temporar/i.test(message) || i === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25 * 2 ** i + cryptoJitter(20)));
    }
  }
  throw last;
}

function cryptoJitter(maxExclusive: number) {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % maxExclusive;
}

export async function getSession(db: D1Database, cookie: string | null) {
  const id = /(?:^|;\s*)sunrise_session=([^;]+)/.exec(cookie ?? '')?.[1];
  if (!id) return null;
  const row = await db.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?').bind(id, new Date().toISOString()).first<Record<string, string>>();
  return row ? { id, githubLogin: row.github_login, githubId: row.github_id, accessToken: row.access_token } : null;
}

export function sessionCookie(id: string, maxAge = 60 * 60 * 24 * 30) {
  return `sunrise_session=${id}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return 'sunrise_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
}
