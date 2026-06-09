const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // Leer el header Authorization
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  // Si no hay token — rechaza
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Verificar que el token sea válido
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario   = decoded; // guarda los datos del usuario en el request
    next();                  // pasa al siguiente middleware o ruta
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = verificarToken;