/* Servidor de salas del Gran Premio de Barbaridades.
   Una sala (Durable Object) por código. Los jugadores se conectan por WebSocket y se
   repiten entre sí su "presencia" (nombre, distancia, velocidad...). Solo se envían cambios. */

const ORIGENES = ['https://japp2003.github.io', 'http://localhost', 'http://127.0.0.1'];
const MAX_JUGADORES = 16;
const MAX_MENSAJE = 4000;

function origenValido(origin) {
  if (!origin) return false;
  return ORIGENES.some((o) => origin === o || origin.startsWith(o + ':'));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cl = url.pathname.match(/^\/clase\/([a-z0-9]{4,16})(\/reiniciar)?$/);
    if (cl) {
      const cors = {
        'Access-Control-Allow-Origin': request.headers.get('Origin') || '',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
      };
      if (!origenValido(request.headers.get('Origin'))) return new Response('Origen no permitido', { status: 403 });
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
      const id = env.ROOM.idFromName('clase-' + cl[1]);
      const r = await env.ROOM.get(id).fetch(request);
      const h = new Headers(r.headers);
      for (const k of Object.keys(cors)) h.set(k, cors[k]);
      return new Response(r.body, { status: r.status, headers: h });
    }
    const m = url.pathname.match(/^\/sala\/([a-z0-9-]{3,40})$/);
    if (!m) return new Response('Gran Premio de Barbaridades: servidor de salas', { status: 200 });
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Se esperaba WebSocket', { status: 426 });
    if (!origenValido(request.headers.get('Origin'))) return new Response('Origen no permitido', { status: 403 });
    const id = env.ROOM.idFromName(m[1]);
    return env.ROOM.get(id).fetch(request);
  },
};

export class Room {
  constructor(state, env) {
    this.state = state;
    this.state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  /* Estado de todos los jugadores, reconstruido de los sockets (sobrevive a la hibernación). */
  jugadores() {
    const out = {};
    for (const ws of this.state.getWebSockets()) {
      const a = ws.deserializeAttachment();
      if (a && a.id) out[a.id] = a.p || {};
    }
    return out;
  }

  /* Resultados anónimos de una clase: solo contadores por tema y por pregunta, sin nombres ni fechas por alumno. */
  async clase(request) {
    const url = new URL(request.url);
    const json = (o, st) => new Response(JSON.stringify(o), { status: st || 200, headers: { 'Content-Type': 'application/json' } });
    let agg = (await this.state.storage.get('agg')) || { t: {}, m: {}, r: 0, c: {}, desde: Date.now() };
    if (url.pathname.endsWith('/reiniciar') && request.method === 'POST') {
      await this.state.storage.delete('agg');
      return json({ ok: true });
    }
    if (request.method === 'GET') return json(agg);
    if (request.method !== 'POST') return json({ error: 'método' }, 405);
    let b;
    try { const txt = await request.text(); if (txt.length > 6000) return json({ error: 'grande' }, 413); b = JSON.parse(txt); } catch (e) { return json({ error: 'json' }, 400); }
    if (!b || typeof b !== 'object') return json({ error: 'json' }, 400);
    const num = (x) => Math.max(0, Math.min(500, Math.floor(+x || 0)));
    for (const k of Object.keys(b.t || {}).slice(0, 40)) {
      if (!/^[a-z0-9]{1,8}$/.test(k)) continue;
      const e = b.t[k]; if (!Array.isArray(e)) continue;
      const ok = num(e[0]), n = Math.max(ok, num(e[1]));
      const a = agg.t[k] || (agg.t[k] = [0, 0]);
      a[0] += ok; a[1] += n;
    }
    for (const it of (Array.isArray(b.m) ? b.m : []).slice(0, 40)) {
      if (!Array.isArray(it)) continue;
      const k = String(it[0] || '').slice(0, 10).replace(/[^a-z0-9]/g, '') || 'x';
      const q = String(it[1] || '').slice(0, 140);
      const a = agg.m[k] || (agg.m[k] = [0, q]);
      a[0] += 1;
    }
    const ks = Object.keys(agg.m);
    if (ks.length > 400) { ks.sort((x, y) => agg.m[x][0] - agg.m[y][0]); ks.slice(0, ks.length - 400).forEach((k) => delete agg.m[k]); }
    if (/^[a-z0-9]{2,8}$/.test(String(b.c || ''))) agg.c[b.c] = (agg.c[b.c] || 0) + 1;
    agg.r += 1;
    await this.state.storage.put('agg', agg);
    return json({ ok: true });
  }

  async fetch(request) {
    if (new URL(request.url).pathname.startsWith('/clase/')) return this.clase(request);
    const vivos = this.state.getWebSockets().length;
    if (vivos >= MAX_JUGADORES) return new Response('Sala llena', { status: 409 });
    let n = (await this.state.storage.get('n')) || 0;
    n += 1;
    await this.state.storage.put('n', n);
    const id = 'p' + String(n).padStart(8, '0');   /* orden de entrada = orden alfabético */

    const par = new WebSocketPair();
    const [cliente, servidor] = Object.values(par);
    this.state.acceptWebSocket(servidor);
    servidor.serializeAttachment({ id, p: {} });
    servidor.send(JSON.stringify({ t: 'hola', id, s: this.jugadores() }));
    return new Response(null, { status: 101, webSocket: cliente });
  }

  difundir(msg, salvo) {
    const txt = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      if (ws === salvo) continue;
      try { ws.send(txt); } catch (e) { /* ya se cerrará */ }
    }
  }

  async webSocketMessage(ws, mensaje) {
    if (typeof mensaje !== 'string' || mensaje.length > MAX_MENSAJE) return;
    let m;
    try { m = JSON.parse(mensaje); } catch (e) { return; }
    if (!m || m.t !== 'p' || typeof m.patch !== 'object' || m.patch === null) return;
    const a = ws.deserializeAttachment();
    if (!a) return;
    const p = a.p || {};
    for (const k of Object.keys(m.patch).slice(0, 30)) p[k] = m.patch[k];
    try { ws.serializeAttachment({ id: a.id, p }); } catch (e) { /* estado demasiado grande: se reenvía igualmente */ }
    this.difundir({ t: 'd', d: { [a.id]: m.patch } }, ws);
  }

  async webSocketClose(ws) {
    const a = ws.deserializeAttachment();
    try { ws.close(); } catch (e) { /* nada */ }
    if (a && a.id) this.difundir({ t: 'x', id: a.id }, ws);
  }

  async webSocketError(ws) { await this.webSocketClose(ws); }
}
