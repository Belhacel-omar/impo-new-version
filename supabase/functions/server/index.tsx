import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Health check
app.get("/make-server-6e83f1fa/health", (c) => c.json({ status: "ok" }));

// ── ROOMS ────────────────────────────────────────────────────────────────────

/**
 * POST /rooms
 * Body: full GameState object
 * Saves the game to KV store under key "room:{gameId}"
 */
app.post("/make-server-6e83f1fa/rooms", async (c) => {
  try {
    const gameState = await c.req.json();
    const { gameId } = gameState;
    if (!gameId) {
      console.log("Create room error: missing gameId in body");
      return c.json({ error: "Missing gameId in request body" }, 400);
    }
    await kv.set(`room:${gameId}`, gameState);
    console.log(`Room created: ${gameId}`);
    return c.json({ roomId: gameId });
  } catch (e) {
    console.log("Error creating room:", e);
    return c.json({ error: `Failed to create room: ${e}` }, 500);
  }
});

/**
 * GET /rooms/:id
 * Returns the full GameState for the given room ID.
 */
app.get("/make-server-6e83f1fa/rooms/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const room = await kv.get(`room:${id}`);
    if (!room) {
      console.log(`Room not found: ${id}`);
      return c.json({ error: "Room not found" }, 404);
    }
    return c.json(room);
  } catch (e) {
    console.log("Error getting room:", e);
    return c.json({ error: `Failed to get room: ${e}` }, 500);
  }
});

/**
 * PATCH /rooms/:id/reveal
 * Body: { playerId: string }
 * Sets the given player's "revealed" field to true.
 */
app.patch("/make-server-6e83f1fa/rooms/:id/reveal", async (c) => {
  try {
    const id = c.req.param("id");
    const { playerId } = await c.req.json();
    if (!playerId) {
      return c.json({ error: "Missing playerId in request body" }, 400);
    }
    const room = await kv.get(`room:${id}`) as Record<string, unknown> | null;
    if (!room) {
      console.log(`Reveal error: room not found: ${id}`);
      return c.json({ error: "Room not found" }, 404);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players = (room.players as any[]).map((p: any) =>
      p.id === playerId ? { ...p, revealed: true } : p
    );
    const updated = { ...room, players };
    await kv.set(`room:${id}`, updated);
    console.log(`Player ${playerId} revealed in room ${id}`);
    return c.json(updated);
  } catch (e) {
    console.log("Error revealing player:", e);
    return c.json({ error: `Failed to reveal player: ${e}` }, 500);
  }
});

/**
 * PATCH /rooms/:id/end
 * Sets the game phase to "results".
 */
app.patch("/make-server-6e83f1fa/rooms/:id/end", async (c) => {
  try {
    const id = c.req.param("id");
    const room = await kv.get(`room:${id}`) as Record<string, unknown> | null;
    if (!room) {
      console.log(`End game error: room not found: ${id}`);
      return c.json({ error: "Room not found" }, 404);
    }
    const updated = { ...room, phase: "results" };
    await kv.set(`room:${id}`, updated);
    console.log(`Game ended in room ${id}`);
    return c.json(updated);
  } catch (e) {
    console.log("Error ending game:", e);
    return c.json({ error: `Failed to end game: ${e}` }, 500);
  }
});

Deno.serve(app.fetch);
