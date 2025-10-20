const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.log('❌ Error MongoDB:', err));

const routesMongo = require('./routes/mongo');
const routesSQLite = require('./routes/sqlite');

app.use('/api/mongo', routesMongo);
app.use('/api/sqlite', routesSQLite);

app.listen(5000, () => console.log('🚀 Puerto 5000'));

let usuarios = [];
let nextId = 1;


app.post('/usuarios', (req, res) => {
  try {
    const { dni, nombres, apellidos, fechaNacimiento, genero, ciudad } = req.body;
    
    
    if (!dni || !nombres || !apellidos || !fechaNacimiento || !genero || !ciudad) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      });
    }

    
    if (!/^\d{8,10}$/.test(dni)) {
      return res.status(400).json({ 
        error: 'DNI debe tener entre 8 y 10 dígitos' 
      });
    }

    
    if (usuarios.find(u => u.dni === dni)) {
      return res.status(400).json({ 
        error: 'El DNI ya está registrado' 
      });
    }


    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    if (fecha >= hoy) {
      return res.status(400).json({ 
        error: 'La fecha de nacimiento debe ser anterior a hoy' 
      });
    }

    const nuevoUsuario = {
      id: nextId++,
      dni,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fechaNacimiento,
      genero,
      ciudad,
      fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});


app.get('/usuarios', (req, res) => {
  res.json(usuarios);
});


app.get('/usuarios/:id', (req, res) => {
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));
  
  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  
  res.json(usuario);
});


app.put('/usuarios/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { dni, nombres, apellidos, fechaNacimiento, genero, ciudad } = req.body;
    
  
    if (!dni || !nombres || !apellidos || !fechaNacimiento || !genero || !ciudad) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      });
    }

 
    if (!/^\d{8,10}$/.test(dni)) {
      return res.status(400).json({ 
        error: 'DNI debe tener entre 8 y 10 dígitos' 
      });
    }

   
    const dniExistente = usuarios.find(u => u.dni === dni && u.id !== id);
    if (dniExistente) {
      return res.status(400).json({ 
        error: 'El DNI ya está registrado en otro usuario' 
      });
    }

 
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    if (fecha >= hoy) {
      return res.status(400).json({ 
        error: 'La fecha de nacimiento debe ser anterior a hoy' 
      });
    }

    usuarios[index] = {
      ...usuarios[index],
      dni,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fechaNacimiento,
      genero,
      ciudad,
      fechaActualizacion: new Date().toISOString()
    };

    res.json(usuarios[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});


app.delete('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  
  const usuarioEliminado = usuarios.splice(index, 1)[0];
  res.json({ 
    message: 'Usuario eliminado correctamente',
    usuario: usuarioEliminado 
  });
});


app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Formulario funcionando',
    endpoints: {
      'GET /usuarios': 'Obtener todos los usuarios',
      'GET /usuarios/:id': 'Obtener usuario por ID',
      'POST /usuarios': 'Crear nuevo usuario',
      'PUT /usuarios/:id': 'Actualizar usuario',
      'DELETE /usuarios/:id': 'Eliminar usuario'
    }
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos en memoria inicializada`);
});