import * as SQLite from "expo-sqlite";

export interface TasbeehItem {
  id: string;
  name: string;
  goal: number;
  isDefault?: boolean;
}

export type HistoryEventType = "manual-reset" | "goal-complete";

export interface HistoryEntry {
  id: string;
  tasbeehName: string;
  goal: number;
  countAtEvent: number;
  currentSet: number;
  completedSets: number;
  eventType: HistoryEventType;
  createdAt: string;
}

export interface ActiveState {
  count: number;
  currentSet: number;
  completedSets: number;
  goal: number;
  tasbeehName: string;
  hapticEnabled: boolean;
}


const DATABASE_NAME = "noorly.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return dbPromise;
}

async function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDb();
      await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS custom_tasbeeh (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          goal INTEGER NOT NULL,
          is_default INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS history_entries (
          id TEXT PRIMARY KEY NOT NULL,
          tasbeeh_name TEXT NOT NULL,
          goal INTEGER NOT NULL,
          count_at_event INTEGER NOT NULL,
          current_set INTEGER NOT NULL,
          completed_sets INTEGER NOT NULL,
          event_type TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS active_state (
          id TEXT PRIMARY KEY NOT NULL,
          count INTEGER NOT NULL,
          current_set INTEGER NOT NULL,
          completed_sets INTEGER NOT NULL,
          goal INTEGER NOT NULL,
          tasbeeh_name TEXT NOT NULL,
          haptic_enabled INTEGER NOT NULL
        );
      `);
    })();
  }

  return initPromise;
}

export async function getCustomTasbeehItems(): Promise<TasbeehItem[]> {
  await initDb();
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    goal: number;
    is_default: number;
  }>(
    "SELECT id, name, goal, is_default FROM custom_tasbeeh ORDER BY rowid ASC",
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    goal: Number(row.goal),
    isDefault: Boolean(row.is_default),
  }));
}

export async function saveCustomTasbeehItems(
  items: TasbeehItem[],
): Promise<void> {
  await initDb();
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM custom_tasbeeh");

    for (const item of items) {
      await db.runAsync(
        "INSERT INTO custom_tasbeeh (id, name, goal, is_default) VALUES (?, ?, ?, ?)",
        item.id,
        item.name,
        item.goal,
        item.isDefault ? 1 : 0,
      );
    }
  });
}

export async function getHistoryEntries(): Promise<HistoryEntry[]> {
  await initDb();
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: string;
    tasbeeh_name: string;
    goal: number;
    count_at_event: number;
    current_set: number;
    completed_sets: number;
    event_type: HistoryEventType;
    created_at: string;
  }>(
    `SELECT id, tasbeeh_name, goal, count_at_event, current_set, completed_sets, event_type, created_at
     FROM history_entries
     ORDER BY datetime(created_at) DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    tasbeehName: row.tasbeeh_name,
    goal: Number(row.goal),
    countAtEvent: Number(row.count_at_event),
    currentSet: Number(row.current_set),
    completedSets: Number(row.completed_sets),
    eventType: row.event_type,
    createdAt: row.created_at,
  }));
}

export async function addHistoryEntry(
  entry: Omit<HistoryEntry, "id" | "createdAt">,
): Promise<void> {
  await initDb();
  const db = await getDb();

  const nextEntry: HistoryEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO history_entries
      (id, tasbeeh_name, goal, count_at_event, current_set, completed_sets, event_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    nextEntry.id,
    nextEntry.tasbeehName,
    nextEntry.goal,
    nextEntry.countAtEvent,
    nextEntry.currentSet,
    nextEntry.completedSets,
    nextEntry.eventType,
    nextEntry.createdAt,
  );
}

export async function clearHistoryEntries(): Promise<void> {
  await initDb();
  const db = await getDb();
  await db.runAsync("DELETE FROM history_entries");
}

export async function getActiveState(): Promise<ActiveState | null> {
  await initDb();
  const db = await getDb();
  const row = await db.getFirstAsync<{
    count: number;
    current_set: number;
    completed_sets: number;
    goal: number;
    tasbeeh_name: string;
    haptic_enabled: number;
  }>("SELECT count, current_set, completed_sets, goal, tasbeeh_name, haptic_enabled FROM active_state WHERE id = 'active'");
  
  if (!row) return null;
  return {
    count: Number(row.count),
    currentSet: Number(row.current_set),
    completedSets: Number(row.completed_sets),
    goal: Number(row.goal),
    tasbeehName: row.tasbeeh_name,
    hapticEnabled: Boolean(row.haptic_enabled),
  };
}

export async function saveActiveState(state: ActiveState): Promise<void> {
  await initDb();
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO active_state (id, count, current_set, completed_sets, goal, tasbeeh_name, haptic_enabled)
     VALUES ('active', ?, ?, ?, ?, ?, ?)`,
    state.count,
    state.currentSet,
    state.completedSets,
    state.goal,
    state.tasbeehName,
    state.hapticEnabled ? 1 : 0
  );
}
