const socket = io();

const loginForm = document.getElementById('login');
const chatBox = document.getElementById('chat');
const messagesEl = document.getElementById('messages');
const onlineEl = document.getElementById('online');
const nameInput = document.getElementById('name-input');
const textInput = document.getElementById('text-input');

let myName = '';

// Время сообщения, например 14:05
const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

function scrollDown() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Обычное сообщение: имя, время и текст (через textContent — безопасно, см. неделю 11)
function addMessage(msg) {
  const div = document.createElement('div');
  div.className = 'msg' + (msg.name === myName ? ' me' : '');

  const meta = document.createElement('div');
  meta.className = 'meta';
  const b = document.createElement('b');
  b.textContent = msg.name;
  meta.append(b, formatTime(msg.ts));

  const text = document.createElement('div');
  text.textContent = msg.text;

  div.append(meta, text);
  messagesEl.appendChild(div);
  scrollDown();
}

// Уведомление в чате: «Имя присоединился к чату»
function addSystem(msg) {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = `${msg.text} · ${formatTime(msg.ts)}`;
  messagesEl.appendChild(div);
  scrollDown();
}

// Вход в чат
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  myName = name;
  socket.emit('join', myName);
  loginForm.style.display = 'none';
  chatBox.style.display = 'flex';
  textInput.focus();
});

// Отправка сообщения
document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = textInput.value.trim();
  if (!text) return;
  socket.emit('message', text);
  textInput.value = '';
});

// События от сервера
socket.on('history', (list) => {
  messagesEl.textContent = '';
  list.forEach(addMessage);
});
socket.on('message', addMessage);
socket.on('system', addSystem);
socket.on('online', (n) => (onlineEl.textContent = `Онлайн: ${n}`));

// Если связь пропала и вернулась — входим заново под тем же именем
socket.on('connect', () => {
  if (myName) socket.emit('join', myName);
});
