const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    dni: {
        type: String,
        required: true,
        unique: true,
        match: /^\d{8,10}$/
    },
    nombres: {
        type: String,
        required: true,
        trim: true
    },
    apellidos: {
        type: String,
        required: true,
        trim: true
    },
    fechaNacimiento: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value < new Date();
            },
            message: 'La fecha de nacimiento debe ser anterior a hoy'
        }
    },
    genero: {
        type: String,
        required: true,
        enum: ['Masculino', 'Femenino', 'Otro']
    },
    ciudad: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: {
        createdAt: 'fechaRegistro',
        updatedAt: 'fechaActualizacion'
    }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;