import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "../config/supabase";

function roomOf(path) {
  const seg = String(path).split("/");
  return seg[0] === "games" && seg[1] ? seg[1] : "_";
}

export async function SupabaseStore() {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) return null;
  let sb;
  try {
    sb = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: { persistSession: false }
    });
    const probe = await sb.from("docs").select("path").limit(1);
    if (probe.error) {
      console.warn("Supabase table 'docs' is not ready:", probe.error.message);
      return null;
    }
  } catch (e) {
    console.warn("Supabase unavailable:", e.message || e);
    return null;
  }

  const rooms = {};

  function wake(room) {
    const e = rooms[room];
    if (e) {
      e.listeners.forEach(f => {
        try { f(); } catch (err) { console.error(err); }
      });
    }
  }

  function onRoomChange(room, fn) {
    let entry = rooms[room];
    if (!entry) {
      entry = rooms[room] = { listeners: new Set(), channel: null, poll: null };
      const wakeRoom = () => entry.listeners.forEach(f => {
        try { f(); } catch (e) { console.error(e); }
      });
      entry.channel = sb
        .channel("lockdown:" + room)
        .on("postgres_changes", { event: "*", schema: "public", table: "docs", filter: "room=eq." + room }, wakeRoom)
        .subscribe(status => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            if (!entry.poll) entry.poll = setInterval(wakeRoom, 5000);
          } else if (status === "SUBSCRIBED" && entry.poll) {
            clearInterval(entry.poll);
            entry.poll = null;
          }
        });
    }
    entry.listeners.add(fn);
    return () => {
      entry.listeners.delete(fn);
      if (!entry.listeners.size) {
        if (entry.poll) clearInterval(entry.poll);
        sb.removeChannel(entry.channel);
        delete rooms[room];
      }
    };
  }

  const api = {
    kind: "supabase",
    async getDoc(path) {
      const r = await sb.from("docs").select("data").eq("path", path).maybeSingle();
      if (r.error) {
        console.warn("supabase get", path, r.error.message);
        return null;
      }
      return r.data ? r.data.data : null;
    },
    async setDoc(path, data) {
      const r = await sb.from("docs").upsert(
        { path: path, room: roomOf(path), data: data, updated_at: new Date().toISOString() },
        { onConflict: "path" }
      );
      if (r.error) console.warn("supabase set", path, r.error.message);
      else wake(roomOf(path));
    },
    async updateDoc(path, patch) {
      const cur = await api.getDoc(path);
      return api.setDoc(path, Object.assign({}, cur || {}, patch));
    },
    async deleteDoc(path) {
      const r = await sb.from("docs").delete().eq("path", path);
      if (r.error) console.warn("supabase delete", path, r.error.message);
      else wake(roomOf(path));
    },
    async listCol(path) {
      const r = await sb.from("docs").select("path,data").like("path", path + "/%");
      if (r.error) {
        console.warn("supabase list", path, r.error.message);
        return [];
      }
      return r.data
        .map(row => ({ id: row.path.slice(path.length + 1), data: row.data }))
        .filter(row => row.id.indexOf("/") === -1)
        .sort((a, b) => (a.id < b.id ? -1 : 1));
    },
    watchDoc(path, cb) {
      const run = () => api.getDoc(path).then(cb);
      run();
      return onRoomChange(roomOf(path), run);
    },
    watchCol(path, cb) {
      const run = () => api.listCol(path).then(cb);
      run();
      return onRoomChange(roomOf(path), run);
    }
  };

  return api;
}
