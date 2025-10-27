const express = require('express');
const Usuario = require('../models/Usuario');

const router = express.Router();

// GET - Obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET - Obtener usuario por ID
router.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// POST - Crear nuevo usuario
router.post('/usuarios', async (req, res) => {
  try {
    const { dni, nombres, apellidos, fechaNacimiento, genero, ciudad } = req.body;

    // Validaciones
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

    // Verificar DNI duplicado
    const dniExistente = await Usuario.findOne({ dni });
    if (dniExistente) {
      return res.status(400).json({
        error: 'El DNI ya está registrado'
      });
    }

    // Validar fecha
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    if (fecha >= hoy) {
      return res.status(400).json({
        error: 'La fecha de nacimiento debe ser anterior a hoy'
      });
    }

    const usuario = new Usuario({
      dni,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fechaNacimiento,
      genero,
      ciudad,
      fechaRegistro: new Date()
    });

    await usuario.save();
    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT - Actualizar usuario
router.put('/usuarios/:id', async (req, res) => {
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

    // Verificar que el DNI no esté en otro usuario
    const dniExistente = await Usuario.findOne({
      dni,
      _id: { $ne: req.params.id }
    });
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

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      {
        dni,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        fechaNacimiento,
        genero,
        ciudad,
        fechaActualizacion: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE - Eliminar usuario
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario eliminado correctamente',
      usuario
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;