const express = require('express');
const router  = express.Router();
const { pool, poolConnect, sql } = require('../db');

// GET /api/users — obtener todos
router.get('/', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM usuarios');
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — obtener uno
router.get('/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM usuarios WHERE id = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — crear
router.post('/', async (req, res) => {
  const { nombre, email, edad } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son obligatorios' });
  }
  try {
    await poolConnect;
    const result = await pool.request()
      .input('nombre', sql.VarChar(100), nombre)
      .input('email',  sql.VarChar(150), email)
      .input('edad',   sql.Int,          edad || null)
      .query(`
        INSERT INTO usuarios (nombre, email, edad)
        OUTPUT INSERTED.*
        VALUES (@nombre, @email, @edad)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id — reemplazar completo
router.put('/:id', async (req, res) => {
  const { nombre, email, edad } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son obligatorios' });
  }
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id',     sql.Int,          req.params.id)
      .input('nombre', sql.VarChar(100), nombre)
      .input('email',  sql.VarChar(150), email)
      .input('edad',   sql.Int,          edad || null)
      .query(`
        UPDATE usuarios
        SET nombre = @nombre, email = @email, edad = @edad
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id — actualizar parcialmente
router.patch('/:id', async (req, res) => {
  const { nombre, email, edad } = req.body;
  const campos = [];
  const request = pool.request().input('id', sql.Int, req.params.id);
  if (nombre !== undefined) { campos.push('nombre = @nombre'); request.input('nombre', sql.VarChar(100), nombre); }
  if (email  !== undefined) { campos.push('email = @email');   request.input('email',  sql.VarChar(150), email);  }
  if (edad   !== undefined) { campos.push('edad = @edad');     request.input('edad',   sql.Int,          edad);   }
  if (campos.length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }
  try {
    await poolConnect;
    const result = await request.query(`
      UPDATE usuarios SET ${campos.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id — eliminar
router.delete('/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM usuarios OUTPUT DELETED.id WHERE id = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;