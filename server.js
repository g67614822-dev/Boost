const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Chemin persistant sur Fly.io
const DB_PATH = '/app/data/db.json';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Créer le dossier data si il existe pas
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser db.json si il existe pas
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

// Lire la DB
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [] };
  }
}

// Ecrire la DB
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/users', (req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const { name, amount, paid } = req.body;
  const db = readDB();

  const newUser = {
    id: Date.now(),
    name,
    amount: parseFloat(amount),
    paid: paid || false,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);
  res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.users[userIndex] = {...db.users[userIndex],...req.body };
  writeDB(db);
  res.json(db.users[userIndex]);
});

app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = readDB();
  db.users = db.users.filter(u => u.id!== id);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
