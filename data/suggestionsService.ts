// Talks to the `suggestions_public` view / `vote_suggestion` RPC over Supabase's
// public REST API using only the anon key — same pattern as menuService.ts.
// The base `suggestions` table (which also holds each submitter's email) is
// NOT readable by the anon key; see supabase/suggestions.sql for the schema
// and RLS policies this depends on.
//
// Deliberately a SEPARATE Supabase project from the menu database (whose
// tables get overwritten wholesale by a daily cron job) — suggestions must
// not get wiped out by that job, so they live somewhere it never touches.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUGGESTIONS_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUGGESTIONS_SUPABASE_ANON_KEY;

const FETCH_TIMEOUT_MS = 8000;

export interface SuggestionRow {
  id: number;
  content: string;
  score: number;
  created_at: string;
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Suggestions Supabase env vars are not configured (EXPO_PUBLIC_SUGGESTIONS_SUPABASE_URL / EXPO_PUBLIC_SUGGESTIONS_SUPABASE_ANON_KEY).');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Supabase request failed (${res.status}): ${path}${body ? ` — ${body}` : ''}`);
    }
    if (res.status === 204) return undefined as T;
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchSuggestions(): Promise<SuggestionRow[]> {
  return supabaseFetch<SuggestionRow[]>('suggestions_public?select=id,content,score,created_at&order=created_at.desc');
}

export async function submitSuggestion(email: string, content: string): Promise<void> {
  await supabaseFetch<void>('suggestions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ email, content }),
  });
}

// delta is the net change to apply (+1/-1 for a fresh vote, +2/-2 when
// switching from the opposite vote, and the inverse of the original vote
// when undoing it) — see the vote() function in suggestions.ts for how it's
// derived from the voter's previous choice.
export async function voteSuggestion(id: number, delta: number): Promise<number> {
  return supabaseFetch<number>('rpc/vote_suggestion', {
    method: 'POST',
    body: JSON.stringify({ suggestion_id: id, delta }),
  });
}
