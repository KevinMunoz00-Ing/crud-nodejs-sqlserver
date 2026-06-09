require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const users        = require('./routes/users');
const auth         = require('./routes/auth');
const verificarToken = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas públicas — no necesitan token
app.use('/api/auth', auth);

// Rutas protegidas — necesitan token
app.use('/api/users', verificarToken, users);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API CRUD corriendo correctamente ✓' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});