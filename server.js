import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));
app.get('/health', (req, res) => res.json({ message: 'Сервер работает!' }));

// Последние сообщения хранятся в памяти (максимум 20 показываем новичку)
const history = [];
const HISTORY_LIMIT = 20;

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

// Сколько участников сейчас в чате (те, кто ввёл имя)
function onlineCount() {
  return [...io.sockets.sockets.values()].filter((s) => s.data.name).length;
}

io.on('connection', (socket) => {
  // Пользователь ввёл имя и вошёл в чат
  socket.on('join', (rawName) => {
    const name = clean(rawName).slice(0, 20);
    if (!name) return;

    socket.data.name = name;

    // 1. Новичку отправляем последние 20 сообщений
    socket.emit('history', history);

    // 2. Остальным — уведомление, что пришёл новый участник
    socket.broadcast.emit('system', {
      text: `${name} присоединился к чату`,
      ts: Date.now(),
    });

    // 3. Всем — обновлённое число участников онлайн
    io.emit('online', onlineCount());
  });

  // Пришло новое сообщение
  socket.on('message', (rawText) => {
    const text = clean(rawText).slice(0, 500);
    if (!socket.data.name || !text) return;

    const msg = { name: socket.data.name, text, ts: Date.now() };
    history.push(msg);
    if (history.length > HISTORY_LIMIT) history.shift();

    io.emit('message', msg); // сразу всем, включая отправителя
  });

  socket.on('disconnect', () => {
    if (!socket.data.name) return;
    io.emit('system', { text: `${socket.data.name} вышел из чата`, ts: Date.now() });
    io.emit('online', onlineCount());
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Чат: http://localhost:${PORT}`));
