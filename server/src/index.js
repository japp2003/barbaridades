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

  async fetch(request) {
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
    ws.serializeAttachment({ id: a.id, p });
    this.difundir({ t: 'd', d: { [a.id]: m.patch } }, ws);
  }

  async webSocketClose(ws) {
    const a = ws.deserializeAttachment();
    try { ws.close(); } catch (e) { /* nada */ }
    if (a && a.id) this.difundir({ t: 'x', id: a.id }, ws);
  }

  async webSocketError(ws) { await this.webSocketClose(ws); }
}
