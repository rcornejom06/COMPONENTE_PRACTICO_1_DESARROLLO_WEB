// App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_MONGO = 'http://localhost:5000/api/mongo/usuarios';
const API_SQLITE = 'http://localhost:5000/api/sqlite/usuarios';

function App() {
  // Estados para MongoDB
  const [usuariosMongo, setUsuariosMongo] = useState([]);
  const [editandoMongo, setEditandoMongo] = useState(null);

  // Estados para SQLite
  const [usuariosSQLite, setUsuariosSQLite] = useState([]);
  const [editandoSQLite, setEditandoSQLite] = useState(null);

  // Estados compartidos
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
  const [bdActiva, setBdActiva] = useState('mongo'); // 'mongo' o 'sqlite'

  const ciudades = [
    'Guayaquil', 'Quito', 'Cuenca', 'Santo Domingo', 'Machala',
    'Durán', 'Manta', 'Portoviejo', 'Loja', 'Ambato'
  ];

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuariosMongo();
    cargarUsuariosSQLite();
  }, []);

  // ============ MONGODB ============
  const cargarUsuariosMongo = async () => {
    try {
      const response = await axios.get(API_MONGO);
      setUsuariosMongo(response.data);
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar usuarios de MongoDB');
      console.error(error);
    }
  };

  // ============ SQLITE ============
  const cargarUsuariosSQLite = async () => {
    try {
      const response = await axios.get(API_SQLITE);
      setUsuariosSQLite(response.data);
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar usuarios de SQLite');
      console.error(error);
    }
  };

  // ============ VALIDACIÓN ============
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.dni.trim()) {
      nuevosErrores.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8,10}$/.test(formulario.dni)) {
      nuevosErrores.dni = 'El DNI debe tener entre 8 y 10 dígitos';
    }

    if (!formulario.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios';
    } else if (formulario.nombres.trim().length < 2) {
      nuevosErrores.nombres = 'Los nombres deben tener al menos 2 caracteres';
    }

    if (!formulario.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios';
    } else if (formulario.apellidos.trim().length < 2) {
      nuevosErrores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    if (!formulario.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    } else {
      const fecha = new Date(formulario.fechaNacimiento);
      const hoy = new Date();
      if (fecha >= hoy) {
        nuevosErrores.fechaNacimiento = 'La fecha debe ser anterior a hoy';
      }
    }

    if (!formulario.genero) {
      nuevosErrores.genero = 'Debe seleccionar un género';
    }

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
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ============ GUARDAR ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarMensaje('error', 'Por favor corrija los errores en el formulario');
      return;
    }

    try {
      if (bdActiva === 'mongo') {
        if (editandoMongo) {
          await axios.put(`${API_MONGO}/${editandoMongo}`, formulario);
          mostrarMensaje('success', 'Usuario actualizado en MongoDB ✅');
        } else {
          await axios.post(API_MONGO, formulario);
          mostrarMensaje('success', 'Usuario creado en MongoDB ✅');
        }
        resetFormulario();
        cargarUsuariosMongo();
      } else {
        if (editandoSQLite) {
          await axios.put(`${API_SQLITE}/${editandoSQLite}`, formulario);
          mostrarMensaje('success', 'Usuario actualizado en SQLite ✅');
        } else {
          await axios.post(API_SQLITE, formulario);
          mostrarMensaje('success', 'Usuario creado en SQLite ✅');
        }
        resetFormulario();
        cargarUsuariosSQLite();
      }
    } catch (error) {
      mostrarMensaje('error', error.response?.data?.error || 'Error al guardar usuario');
    }
  };

  // ============ EDITAR ============
  const handleEditar = (usuario, tipo) => {
    setFormulario({
      dni: usuario.dni,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      fechaNacimiento: usuario.fechaNacimiento,
      genero: usuario.genero,
      ciudad: usuario.ciudad
    });

    if (tipo === 'mongo') {
      setEditandoMongo(usuario._id);
      setBdActiva('mongo');
    } else {
      setEditandoSQLite(usuario.id);
      setBdActiva('sqlite');
    }
    setErrores({});
  };

  // ============ ELIMINAR ============
  const handleEliminar = async (id, tipo) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) {
      return;
    }

    try {
      if (tipo === 'mongo') {
        await axios.delete(`${API_MONGO}/${id}`);
        mostrarMensaje('success', 'Usuario eliminado de MongoDB ✅');
        cargarUsuariosMongo();
      } else {
        await axios.delete(`${API_SQLITE}/${id}`);
        mostrarMensaje('success', 'Usuario eliminado de SQLite ✅');
        cargarUsuariosSQLite();
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar usuario');
    }
  };

  // ============ RESETEAR ============
  const resetFormulario = () => {
    setFormulario({
      dni: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      genero: '',
      ciudad: ''
    });
    setEditandoMongo(null);
    setEditandoSQLite(null);
    setErrores({});
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>📝 Gestión de Usuarios - MongoDB + SQLite</h1>

        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Selector de Base de Datos */}
        <div className="selector-bd">
          <button
            className={`btn-bd ${bdActiva === 'mongo' ? 'activo' : ''}`}
            onClick={() => { setBdActiva('mongo'); resetFormulario(); }}
          >
            🍃 MongoDB
          </button>
          <button
            className={`btn-bd ${bdActiva === 'sqlite' ? 'activo' : ''}`}
            onClick={() => { setBdActiva('sqlite'); resetFormulario(); }}
          >
            🔒 SQLite
          </button>
        </div>

        {/* FORMULARIO */}
        <div className="formulario-card">
          <h2>
            {bdActiva === 'mongo' ? '🍃 MongoDB - ' : '🔒 SQLite - '}
            {(editandoMongo || editandoSQLite) ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
          </h2>
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
                {(editandoMongo || editandoSQLite) ? 'Actualizar' : 'Guardar'}
              </button>
              {(editandoMongo || editandoSQLite) && (
                <button type="button" onClick={resetFormulario} className="btn btn-secondary">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLAS */}
        <div className="tablas-container">
          {/* Tabla MongoDB */}
          <div className="tabla-card">
            <h2>🍃 MongoDB ({usuariosMongo.length})</h2>
            {usuariosMongo.length === 0 ? (
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
                    {usuariosMongo.map(usuario => (
                      <tr key={usuario._id}>
                        <td>{usuario.dni}</td>
                        <td>{usuario.nombres}</td>
                        <td>{usuario.apellidos}</td>
                        <td>{new Date(usuario.fechaNacimiento).toLocaleDateString()}</td>
                        <td>{usuario.genero}</td>
                        <td>{usuario.ciudad}</td>
                        <td>
                          <button
                            onClick={() => handleEditar(usuario, 'mongo')}
                            className="btn btn-edit"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleEliminar(usuario._id, 'mongo')}
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

          {/* Tabla SQLite */}
          <div className="tabla-card">
            <h2>🔒 SQLite ({usuariosSQLite.length})</h2>
            {usuariosSQLite.length === 0 ? (
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
                    {usuariosSQLite.map(usuario => (
                      <tr key={usuario.id}>
                        <td>{usuario.dni}</td>
                        <td>{usuario.nombres}</td>
                        <td>{usuario.apellidos}</td>
                        <td>{new Date(usuario.fechaNacimiento).toLocaleDateString()}</td>
                        <td>{usuario.genero}</td>
                        <td>{usuario.ciudad}</td>
                        <td>
                          <button
                            onClick={() => handleEditar(usuario, 'sqlite')}
                            className="btn btn-edit"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleEliminar(usuario.id, 'sqlite')}
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
    </div>
  );
}

export default App;