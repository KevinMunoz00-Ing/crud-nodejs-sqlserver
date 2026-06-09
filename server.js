require('dotenv').config();
const express = require('express');
const cors    = require('cors');        // ← agrega esta línea
const users   = require('./routes/users');

const app = express();

app.use(cors());                        // ← agrega esta línea
app.use(express.json());

app.use('/api/users', users);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API CRUD corriendo correctamente ✓' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});