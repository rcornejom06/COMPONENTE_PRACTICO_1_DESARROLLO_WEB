const Usuario = require('../models/Usuario');

const resolvers = {
  Query: {
    usuarios: async () => {
      try {
        const usuarios = await Usuario.find();
        return usuarios.map(u => ({
          id: u._id.toString(),
          dni: u.dni,
          nombres: u.nombres,
          apellidos: u.apellidos,
          fechaNacimiento: u.fechaNacimiento.toISOString(),
          genero: u.genero,
          ciudad: u.ciudad,
          fechaRegistro: u.fechaRegistro.toISOString(),
          fechaActualizacion: u.fechaActualizacion?.toISOString() || null
        }));
      } catch (error) {
        throw new Error('Error al obtener usuarios');
      }
    },

    usuario: async (_, { id }) => {
      try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
          throw new Error('Usuario no encontrado');
        }
        return {
          id: usuario._id.toString(),
          dni: usuario.dni,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          fechaNacimiento: usuario.fechaNacimiento.toISOString(),
          genero: usuario.genero,
          ciudad: usuario.ciudad,
          fechaRegistro: usuario.fechaRegistro.toISOString(),
          fechaActualizacion: usuario.fechaActualizacion?.toISOString() || null
        };
      } catch (error) {
        throw new Error('Error al obtener usuario');
      }
    }
  },

  Mutation: {
    crearUsuario: async (_, { dni, nombres, apellidos, fechaNacimiento, genero, ciudad }) => {
      try {
        const dniExistente = await Usuario.findOne({ dni });
        if (dniExistente) {
          throw new Error('El DNI ya está registrado');
        }

        const usuario = new Usuario({
          dni,
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          fechaNacimiento: new Date(fechaNacimiento),
          genero,
          ciudad,
          fechaRegistro: new Date()
        });

        await usuario.save();

        return {
          id: usuario._id.toString(),
          dni: usuario.dni,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          fechaNacimiento: usuario.fechaNacimiento.toISOString(),
          genero: usuario.genero,
          ciudad: usuario.ciudad,
          fechaRegistro: usuario.fechaRegistro.toISOString(),
          fechaActualizacion: null
        };
      } catch (error) {
        throw new Error(error.message || 'Error al crear usuario');
      }
    },

    actualizarUsuario: async (_, { id, dni, nombres, apellidos, fechaNacimiento, genero, ciudad }) => {
      try {
        const dniExistente = await Usuario.findOne({
          dni,
          _id: { $ne: id }
        });
        if (dniExistente) {
          throw new Error('El DNI ya está registrado en otro usuario');
        }

        const usuario = await Usuario.findByIdAndUpdate(
          id,
          {
            dni,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            fechaNacimiento: new Date(fechaNacimiento),
            genero,
            ciudad,
            fechaActualizacion: new Date()
          },
          { new: true, runValidators: true }
        );

        if (!usuario) {
          throw new Error('Usuario no encontrado');
        }

        return {
          id: usuario._id.toString(),
          dni: usuario.dni,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          fechaNacimiento: usuario.fechaNacimiento.toISOString(),
          genero: usuario.genero,
          ciudad: usuario.ciudad,
          fechaRegistro: usuario.fechaRegistro.toISOString(),
          fechaActualizacion: usuario.fechaActualizacion?.toISOString() || null
        };
      } catch (error) {
        throw new Error(error.message || 'Error al actualizar usuario');
      }
    },

    eliminarUsuario: async (_, { id }) => {
      try {
        const usuario = await Usuario.findByIdAndDelete(id);
        if (!usuario) {
          throw new Error('Usuario no encontrado');
        }
        return true;
      } catch (error) {
        throw new Error('Error al eliminar usuario');
      }
    }
  }
};

module.exports = resolvers;