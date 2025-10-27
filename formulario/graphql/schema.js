const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Usuario {
    id: ID!
    dni: String!
    nombres: String!
    apellidos: String!
    fechaNacimiento: String!
    genero: String!
    ciudad: String!
    fechaRegistro: String!
    fechaActualizacion: String
  }

  type Query {
    usuarios: [Usuario!]!
    usuario(id: ID!): Usuario
  }

  type Mutation {
    crearUsuario(
      dni: String!
      nombres: String!
      apellidos: String!
      fechaNacimiento: String!
      genero: String!
      ciudad: String!
    ): Usuario!

    actualizarUsuario(
      id: ID!
      dni: String!
      nombres: String!
      apellidos: String!
      fechaNacimiento: String!
      genero: String!
      ciudad: String!
    ): Usuario!

    eliminarUsuario(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;