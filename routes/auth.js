const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { pool, poolConnect, sql } = require('../db');

// POST /api/auth/register — registrar usuario
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  try {
    await poolConnect;

    // Cifrar la contraseña antes de guardar
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('email',    sql.VarChar(150), email)
      .input('password', sql.VarChar(255), hash)
      .query(`
        INSERT INTO auth (email, password)
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.creado_en
        VALUES (@email, @password)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login — iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son obligatorios' });
  }

  try {
    await poolConnect;

    // Buscar el usuario por email
    const result = await pool.request()
      .input('email', sql.VarChar(150), email)
      .query('SELECT * FROM auth WHERE email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = result.recordset[0];

    // Verificar la contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;