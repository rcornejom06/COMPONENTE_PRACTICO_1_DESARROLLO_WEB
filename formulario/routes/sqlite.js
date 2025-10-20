const express = require('express');
const router = express.Router();
const Usuario = require('better-sqlite3');

// Conexión a la base de datos SQLite
const db = new Usuario('usuarios.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE)

`);

router.get('/usuarios', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM usuarios');
        const usuarios = stmt.all();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/usuarios', (req, res) => {
    const { nombre, email } = req.body;
    try {
        const stmt = db.prepare('INSERT INTO usuarios (nombre, email) VALUES (?, ?)');
        const info = stmt.run(nombre, email);
        res.status(201).json({ id: info.lastInsertRowid, nombre, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
