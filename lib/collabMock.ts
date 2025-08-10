import { useEffect, useState } from "react";

export type PresenceUser = {
  id: string;
  name: string;
  lastSeen: number;
};

const STORAGE_KEY = "collab.presence";
const SELF_ID_KEY = "collab.selfId";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function read(): PresenceUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PresenceUser[]) : [];
  } catch {
    return [];
  }
}

function write(users: PresenceUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSelf(displayName?: string): PresenceUser {
  let id = sessionStorage.getItem(SELF_ID_KEY);
  if (!id) {
    id = uid();
    sessionStorage.setItem(SELF_ID_KEY, id);
  }
  return {
    id,
    name: displayName?.trim() || "You",
    lastSeen: Date.now(),
  };
}

export function useMockPresence(displayName?: string) {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const self = getSelf(displayName);

    const addSelf = () => {
      const all = read();
      const idx = all.findIndex((u) => u.id === self.id);
      const next = idx === -1 ? [...all, self] : [...all.slice(0, idx), { ...self, lastSeen: Date.now() }, ...all.slice(idx + 1)];
      write(next);
      setUsers(next);
    };

    const removeSelf = () => {
      const all = read();
      const next = all.filter((u) => u.id !== self.id);
      write(next);
      setUsers(next);
    };

    addSelf();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setUsers(e.newValue ? (JSON.parse(e.newValue) as PresenceUser[]) : []);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", onStorage);

    const interval = window.setInterval(() => {
      // heartbeat to keep lastSeen fresh
      addSelf();
    }, 15000);

    window.addEventListener("beforeunload", removeSelf);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", removeSelf);
      window.clearInterval(interval);
      removeSelf();
    };
  }, [displayName]);

  return { users };
}