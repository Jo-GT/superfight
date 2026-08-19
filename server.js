const http = require('http');
const { WebSocketServer } = require('ws');

const port = Number(process.env.PORT) || 8080;
const rooms = new Map();
const httpServer = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('SUPERFIGHT lobby server is running.');
});
const server = new WebSocketServer({ server: httpServer });

function roomCode() {
  let code = '';
  do {
    code = Math.random().toString(36).slice(2, 7).toUpperCase();
  } while (rooms.has(code));
  return code;
}

function send(socket, message) {
  if (socket.readyState === 1) socket.send(JSON.stringify(message));
}

function leaveRoom(socket) {
  if (!socket.roomCode) return;
  const room = rooms.get(socket.roomCode);
  if (!room) return;
  room.players = room.players.filter(player => player !== socket);
  room.players.forEach(player => send(player, { type: 'opponent-left' }));
  if (room.players.length === 0) rooms.delete(socket.roomCode);
  socket.roomCode = null;
}

server.on('connection', socket => {
  socket.on('message', raw => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (message.type === 'create') {
      leaveRoom(socket);
      const code = roomCode();
      rooms.set(code, { players: [socket] });
      socket.roomCode = code;
      send(socket, { type: 'lobby-created', code, playerNumber: 1 });
      return;
    }

    if (message.type === 'join') {
      const code = String(message.code || '').trim().toUpperCase();
      const room = rooms.get(code);
      if (!room || room.players.length >= 2) {
        send(socket, { type: 'error', message: 'Lobby not found or already full.' });
        return;
      }
      leaveRoom(socket);
      room.players.push(socket);
      socket.roomCode = code;
      room.players.forEach((player, index) => send(player, { type: 'match-start', playerNumber: index + 1 }));
      return;
    }

    if (message.type === 'input' && socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      room?.players.filter(player => player !== socket).forEach(player => send(player, message));
    }
  });

  socket.on('close', () => leaveRoom(socket));
});

httpServer.listen(port, () => console.log(`SUPERFIGHT lobby server listening on port ${port}`));
