// App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/api/usuarios';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
    ciudad: ''
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const ciudades = [
    'Guayaquil', 'Quito', 'Cuenca', 'Santo Domingo', 'Machala',
    'Durán', 'Manta', 'Portoviejo', 'Loja', 'Ambato'
  ];

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsuarios(response.data);
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar usuarios');
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar DNI
    if (!formulario.dni.trim()) {
      nuevosErrores.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8,10}$/.test(formulario.dni)) {
      nuevosErrores.dni = 'El DNI debe tener entre 8 y 10 dígitos';
    }

    // Validar nombres
    if (!formulario.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios';
    } else if (formulario.nombres.trim().length < 2) {
      nuevosErrores.nombres = 'Los nombres deben tener al menos 2 caracteres';
    }

    // Validar apellidos
    if (!formulario.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios';
    } else if (formulario.apellidos.trim().length < 2) {
      nuevosErrores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    // Validar fecha de nacimiento
    if (!formulario.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const fecha = new Date(formulario.fechaNacimiento);
      const hoy = new Date();
      if (fecha >= hoy) {
        nuevosErrores.fechaNacimiento = 'La fecha debe ser anterior a hoy';
      }
    }

    // Validar género
    if (!formulario.genero) {
      nuevosErrores.genero = 'Debe seleccionar un género';
    }

    // Validar ciudad
    if (!formulario.ciudad) {
      nuevosErrores.ciudad = 'Debe seleccionar una ciudad';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      mostrarMensaje('error', 'Por favor corrija los errores en el formulario');
      return;
    }

    try {
      if (editando) {
        await axios.put(`${API_URL}/${editando}`, formulario);
        mostrarMensaje('success', 'Usuario actualizado correctamente');
      } else {
        await axios.post(API_URL, formulario);
        mostrarMensaje('success', 'Usuario creado correctamente');
      }
      
      resetFormulario();
      cargarUsuarios();
    } catch (error) {
      mostrarMensaje('error', error.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleEditar = (usuario) => {
    setFormulario({
      dni: usuario.dni,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      fechaNacimiento: usuario.fechaNacimiento,
      genero: usuario.genero,
      ciudad: usuario.ciudad
    });
    setEditando(usuario.id);
    setErrores({});
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      mostrarMensaje('success', 'Usuario eliminado correctamente');
      cargarUsuarios();
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar usuario');
    }
  };

  const resetFormulario = () => {
    setFormulario({
      dni: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      genero: '',
      ciudad: ''
    });
    setEditando(null);
    setErrores({});
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>📝 Gestión de Usuarios - React + Vite</h1>

        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="formulario-card">
          <h2>{editando ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="dni">DNI *</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formulario.dni}
                onChange={handleChange}
                className={errores.dni ? 'error' : ''}
                placeholder="0123456789"
              />
              {errores.dni && <span className="error-text">{errores.dni}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nombres">Nombres *</label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formulario.nombres}
                onChange={handleChange}
                className={errores.nombres ? 'error' : ''}
                placeholder="Juan Pedro"
              />
              {errores.nombres && <span className="error-text">{errores.nombres}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formulario.apellidos}
                onChange={handleChange}
                className={errores.apellidos ? 'error' : ''}
                placeholder="García López"
              />
              {errores.apellidos && <span className="error-text">{errores.apellidos}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de Nacimiento *</label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formulario.fechaNacimiento}
                onChange={handleChange}
                className={errores.fechaNacimiento ? 'error' : ''}
              />
              {errores.fechaNacimiento && <span className="error-text">{errores.fechaNacimiento}</span>}
            </div>

            <div className="form-group">
              <label>Género *</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="genero"
                    value="masculino"
                    checked={formulario.genero === 'masculino'}
                    onChange={handleChange}
                  />
                  Masculino
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="genero"
                    value="femenino"
                    checked={formulario.genero === 'femenino'}
                    onChange={handleChange}
                  />
                  Femenino
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="genero"
                    value="otro"
                    checked={formulario.genero === 'otro'}
                    onChange={handleChange}
                  />
                  Otro
                </label>
              </div>
              {errores.genero && <span className="error-text">{errores.genero}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">Ciudad *</label>
              <select
                id="ciudad"
                name="ciudad"
                value={formulario.ciudad}
                onChange={handleChange}
                className={errores.ciudad ? 'error' : ''}
              >
                <option value="">Seleccione una ciudad</option>
                {ciudades.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
              {errores.ciudad && <span className="error-text">{errores.ciudad}</span>}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editando ? 'Actualizar' : 'Guardar'}
              </button>
              {editando && (
                <button type="button" onClick={resetFormulario} className="btn btn-secondary">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="tabla-card">
          <h2>👥 Lista de Usuarios ({usuarios.length})</h2>
          {usuarios.length === 0 ? (
            <p className="no-data">No hay usuarios registrados</p>
          ) : (
            <div className="tabla-responsive">
              <table>
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>F. Nacimiento</th>
                    <th>Género</th>
                    <th>Ciudad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(usuario => (
                    <tr key={usuario.id}>
                      <td>{usuario.dni}</td>
                      <td>{usuario.nombres}</td>
                      <td>{usuario.apellidos}</td>
                      <td>{new Date(usuario.fechaNacimiento).toLocaleDateString()}</td>
                      <td>{usuario.genero}</td>
                      <td>{usuario.ciudad}</td>
                      <td>
                        <button
                          onClick={() => handleEditar(usuario)}
                          className="btn btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleEliminar(usuario.id)}
                          className="btn btn-delete"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;