import { projectId, publicAnonKey } from "/utils/supabase/info";
import { GameState } from "../context/GameContext";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6e83f1fa`;

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

/** Save a new game room to the server (called when host starts the game). */
export async function saveRoom(game: GameState): Promise<void> {
  const res = await fetch(`${BASE}/rooms`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(game),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to save room: ${text}`);
  }
}

/** Fetch current room state from the server. Returns null if not found. */
export async function getRoom(roomId: string): Promise<GameState | null> {
  const res = await fetch(`${BASE}/rooms/${roomId}`, { headers: authHeaders });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get room: ${text}`);
  }
  return res.json();
}

/** Mark a player as revealed on the server. Returns updated game state. */
export async function revealPlayerInRoom(
  roomId: string,
  playerId: string
): Promise<GameState> {
  const res = await fetch(`${BASE}/rooms/${roomId}/reveal`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ playerId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to reveal player: ${text}`);
  }
  return res.json();
}

/** Set the game phase to "results" on the server. Returns updated game state. */
export async function endRoom(roomId: string): Promise<GameState> {
  const res = await fetch(`${BASE}/rooms/${roomId}/end`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to end room: ${text}`);
  }
  return res.json();
}
