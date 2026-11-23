require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';
const DB_PATH = path.join(__dirname, 'recipes.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Conexão com o Banco de Dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error('Erro no DB:', err);
  console.log('Conectado ao SQLite em', DB_PATH);
});

function ensureSchema() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT,
        time TEXT,
        difficulty TEXT,
        image TEXT,
        excerpt TEXT,
        ingredients TEXT,
        steps TEXT,
        is_seeded INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) return console.error('Erro no Schema:', err);

      db.all('PRAGMA table_info(recipes)', (pragmaErr, columns) => {
        if (pragmaErr) return console.error('Erro no PRAGMA:', pragmaErr);
        const hasIsSeeded = columns.some((col) => col.name === 'is_seeded');
        if (!hasIsSeeded) {
          db.run('ALTER TABLE recipes ADD COLUMN is_seeded INTEGER DEFAULT 0', (alterErr) => {
            if (alterErr) console.error('Erro ao alterar tabela:', alterErr);
            markLegacySeededRecipes();
          });
          return;
        }
        markLegacySeededRecipes();
      });
    });
  });
}

function markLegacySeededRecipes() {
  const legacyTitles = [
    'Bowl de Quinoa e Legumes',
    'Pizza Artesanal',
    'Donuts Caseiros',
    'Bowl de Quinoa',
    'Pizza Marguerita',
    'Donuts Glaceados'
  ];

  db.run(
    `UPDATE recipes SET is_seeded = 1 WHERE title IN (${legacyTitles.map(() => '?').join(',')})`,
    legacyTitles,
    (err) => {
      if (err) return console.error('Erro ao marcar receitas legadas:', err);
    }
  );
}

ensureSchema();

const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASS, 10);

// Auxiliares de Autenticação
function generateToken() {
  return jwt.sign({ user: ADMIN_USER }, JWT_SECRET, { expiresIn: '6h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Não autorizado' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(400).json({ error: 'Cabeçalho de autorização inválido' });
  const payload = verifyToken(parts[1]);
  if (!payload || payload.user !== ADMIN_USER) return res.status(401).json({ error: 'Não autorizado' });
  next();
}

// ================= ROTAS DA API =================

// Login (Aceita formato em inglês 'user/pass' ou português 'usuario/senha')
app.post('/api/login', async (req, res) => {
  const body = req.body || {};
  const user = body.user || body.usuario;
  const pass = body.pass || body.senha;

  if (!user || !pass) return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  if (user !== ADMIN_USER) return res.status(401).json({ error: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(pass, ADMIN_HASH);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = generateToken();
  res.json({ token, sucesso: true });
});

// Listar Receitas
app.get('/api/recipes', (req, res) => {
  db.all('SELECT id, title, category, time, difficulty, image, excerpt FROM recipes WHERE COALESCE(is_seeded, 0) = 0 ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
    res.json(rows);
  });
});

// Buscar Receitas por termo (?q=...)
app.get('/api/recipes/search', (req, res) => {
  const query = req.query.q || '';
  db.all(
    'SELECT id, title, category, time, difficulty, image, excerpt FROM recipes WHERE title LIKE ? AND COALESCE(is_seeded, 0) = 0 ORDER BY id DESC',
    [`%${query}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro na busca' });
      res.json(rows);
    }
  );
});

// Obter uma Receita por ID
app.get('/api/recipes/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  db.get('SELECT id, title, category, time, difficulty, image, excerpt, ingredients, steps FROM recipes WHERE id = ? AND COALESCE(is_seeded, 0) = 0', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
    if (!row) return res.status(404).json({ error: 'Receita não encontrada' });
    res.json(row);
  });
});

// Criar Receita
app.post('/api/recipes', requireAdmin, (req, res) => {
  const b = req.body;
  const title = b.title || b.titulo;
  const category = b.category || b.categoria || '';
  const time = b.time || b.tempo || '';
  const difficulty = b.difficulty || b.dificuldade || '';
  const image = b.image || b.imagem || '';
  const excerpt = b.excerpt || b.resumo || '';
  const ingredients = b.ingredients || b.ingredientes || '';
  const steps = b.steps || b.passos || '';

  if (!title) return res.status(400).json({ error: 'O título é obrigatório' });

  const stmt = db.prepare('INSERT INTO recipes (title, category, time, difficulty, image, excerpt, ingredients, steps, is_seeded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)');
  stmt.run(title, category, time, difficulty, image, excerpt, ingredients, steps, function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao inserir receita' });
    res.status(201).json({ id: this.lastID });
  });
});

// Atualizar Receita
app.put('/api/recipes/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });

  const b = req.body;
  const title = b.title || b.titulo;
  const category = b.category || b.categoria || '';
  const time = b.time || b.tempo || '';
  const difficulty = b.difficulty || b.dificuldade || '';
  const image = b.image || b.imagem || '';
  const excerpt = b.excerpt || b.resumo || '';
  const ingredients = b.ingredients || b.ingredientes || '';
  const steps = b.steps || b.passos || '';

  db.run(
    'UPDATE recipes SET title=?, category=?, time=?, difficulty=?, image=?, excerpt=?, ingredients=?, steps=? WHERE id=? AND COALESCE(is_seeded, 0) = 0',
    [title, category, time, difficulty, image, excerpt, ingredients, steps, id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar receita' });
      if (this.changes === 0) return res.status(404).json({ error: 'Receita não encontrada' });
      res.json({ updated: true });
    }
  );
});

// Excluir Receita
app.delete('/api/recipes/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });

  db.run('DELETE FROM recipes WHERE id=? AND COALESCE(is_seeded, 0) = 0', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao deletar receita' });
    if (this.changes === 0) return res.status(404).json({ error: 'Receita não encontrada' });
    res.json({ deleted: true });
  });
});

// Servir index.html para rotas não-API
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, '..', 'html', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});