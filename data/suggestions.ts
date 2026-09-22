import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SuggestionRow, fetchSuggestions, submitSuggestion, voteSuggestion } from './suggestionsService';

export type VoteDirection = 'like' | 'dislike';

const VOTES_KEY = 'suggestionVotes';

async function getLocalVotes(): Promise<Record<number, VoteDirection>> {
  try {
    const json = await AsyncStorage.getItem(VOTES_KEY);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

async function setLocalVote(id: number, direction: VoteDirection | null): Promise<void> {
  const votes = await getLocalVotes();
  if (direction) votes[id] = direction;
  else delete votes[id];
  await AsyncStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

// This only stops accidental double-taps from within the app — nothing
// server-side ties a vote to a specific device, since the app has no
// sign-in. See supabase/suggestions.sql for the caveat in full.
export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestionRow[] | null>(null);
  const [myVotes, setMyVotes]         = useState<Record<number, VoteDirection>>({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, votes] = await Promise.all([fetchSuggestions(), getLocalVotes()]);
      setSuggestions(rows);
      setMyVotes(votes);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (email: string, content: string) => {
    await submitSuggestion(email.trim(), content.trim());
    await load();
  }, [load]);

  const vote = useCallback(async (id: number, direction: VoteDirection) => {
    const current = myVotes[id] ?? null;
    // Tapping the already-active button undoes the vote; tapping the other
    // one switches it — either way the delta accounts for removing whatever
    // vote was already cast.
    const nextVote  = current === direction ? null : direction;
    const before     = current === 'like' ? 1 : current === 'dislike' ? -1 : 0;
    const after       = nextVote === 'like' ? 1 : nextVote === 'dislike' ? -1 : 0;
    const delta       = after - before;
    if (delta === 0) return;

    setSuggestions(prev => prev?.map(s => s.id === id ? { ...s, score: s.score + delta } : s) ?? prev);
    setMyVotes(prev => {
      const next = { ...prev };
      if (nextVote) next[id] = nextVote;
      else delete next[id];
      return next;
    });
    await setLocalVote(id, nextVote);

    try {
      await voteSuggestion(id, delta);
    } catch (e) {
      // Roll back the optimistic update on failure.
      setSuggestions(prev => prev?.map(s => s.id === id ? { ...s, score: s.score - delta } : s) ?? prev);
      setMyVotes(prev => {
        const next = { ...prev };
        if (current) next[id] = current;
        else delete next[id];
        return next;
      });
      await setLocalVote(id, current);
      throw e;
    }
  }, [myVotes]);

  return { suggestions, myVotes, loading, error, refresh: load, create, vote };
}
