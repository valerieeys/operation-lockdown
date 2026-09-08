export function LocalStore() {
  const KEY = "operation_lockdown_local";
  const listeners = new Set();

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  };

  const write = (o) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) {}
  };

  const fire = () => listeners.forEach(fn => {
    try { fn(); } catch (e) { console.error(e); }
  });

  try {
    window.addEventListener("storage", e => {
      if (e.key === KEY) fire();
    });
  } catch (e) {}

  const api = {
    kind: "local",
    async getDoc(path) {
      return read()[path] || null;
    },
    async setDoc(path, data) {
      const o = read();
      o[path] = data;
      write(o);
      fire();
    },
    async updateDoc(path, patch) {
      const o = read();
      o[path] = Object.assign({}, o[path] || {}, patch);
      write(o);
      fire();
    },
    async deleteDoc(path) {
      const o = read();
      delete o[path];
      write(o);
      fire();
    },
    async listCol(path) {
      const o = read(), out = [];
      for (const k in o) {
        if (k.startsWith(path + "/") && k.slice(path.length + 1).indexOf("/") === -1) {
          out.push({ id: k.slice(path.length + 1), data: o[k] });
        }
      }
      return out.sort((a, b) => (a.id < b.id ? -1 : 1));
    },
    watchDoc(path, cb) {
      const run = () => api.getDoc(path).then(cb);
      listeners.add(run);
      run();
      return () => listeners.delete(run);
    },
    watchCol(path, cb) {
      const run = () => api.listCol(path).then(cb);
      listeners.add(run);
      run();
      return () => listeners.delete(run);
    }
  };

  return api;
}
