<template>
  <div class="app">
    <div class="container">
      <h1>📝 Gestión de Usuarios - Vue + Vite</h1>

      <!-- Mensajes -->
      <transition name="slide">
        <div v-if="mensaje.texto" :class="['mensaje', mensaje.tipo]">
          {{ mensaje.texto }}
        </div>
      </transition>

      <!-- Formulario -->
      <div class="formulario-card">
        <h2>{{ editando ? '✏️ Editar Usuario' : '➕ Nuevo Usuario' }}</h2>
        <form @submit.prevent="handleSubmit">
          <!-- DNI -->
          <div class="form-group">
            <label for="dni">DNI *</label>
            <input
              type="text"
              id="dni"
              v-model="formulario.dni"
              :class="{ error: errores.dni }"
              placeholder="0123456789"
              @input="limpiarError('dni')"
            />
            <span v-if="errores.dni" class="error-text">{{ errores.dni }}</span>
          </div>

          <!-- Nombres -->
          <div class="form-group">
            <label for="nombres">Nombres *</label>
            <input
              type="text"
              id="nombres"
              v-model="formulario.nombres"
              :class="{ error: errores.nombres }"
              placeholder="Juan Pedro"
              @input="limpiarError('nombres')"
            />
            <span v-if="errores.nombres" class="error-text">{{ errores.nombres }}</span>
          </div>

          <!-- Apellidos -->
          <div class="form-group">
            <label for="apellidos">Apellidos *</label>
            <input
              type="text"
              id="apellidos"
              v-model="formulario.apellidos"
              :class="{ error: errores.apellidos }"
              placeholder="García López"
              @input="limpiarError('apellidos')"
            />
            <span v-if="errores.apellidos" class="error-text">{{ errores.apellidos }}</span>
          </div>

          <!-- Fecha de Nacimiento -->
          <div class="form-group">
            <label for="fechaNacimiento">Fecha de Nacimiento *</label>
            <input
              type="date"
              id="fechaNacimiento"
              v-model="formulario.fechaNacimiento"
              :class="{ error: errores.fechaNacimiento }"
              @input="limpiarError('fechaNacimiento')"
            />
            <span v-if="errores.fechaNacimiento" class="error-text">{{ errores.fechaNacimiento }}</span>
          </div>

          <!-- Género -->
          <div class="form-group">
            <label>Género *</label>
            <div class="radio-group">
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="formulario.genero"
                  value="masculino"
                  @change="limpiarError('genero')"
                />
                Masculino
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="formulario.genero"
                  value="femenino"
                  @change="limpiarError('genero')"
                />
                Femenino
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  v-model="formulario.genero"
                  value="otro"
                  @change="limpiarError('genero')"
                />
                Otro
              </label>
            </div>
            <span v-if="errores.genero" class="error-text">{{ errores.genero }}</span>
          </div>

          <!-- Ciudad -->
          <div class="form-group">
            <label for="ciudad">Ciudad *</label>
            <select
              id="ciudad"
              v-model="formulario.ciudad"
              :class="{ error: errores.ciudad }"
              @change="limpiarError('ciudad')"
            >
              <option value="">Seleccione una ciudad</option>
              <option v-for="ciudad in ciudades" :key="ciudad" :value="ciudad">
                {{ ciudad }}
              </option>
            </select>
            <span v-if="errores.ciudad" class="error-text">{{ errores.ciudad }}</span>
          </div>

          <!-- Botones - SECCIÓN MEJORADA -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-guardar">
              <span class="btn-icon">💾</span>
              {{ editando ? 'Actualizar Usuario' : 'Guardar Usuario' }}
            </button>
            <button
              v-if="editando"
              type="button"
              @click="resetFormulario"
              class="btn btn-secondary"
            >
              <span class="btn-icon">❌</span>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="tabla-card">
        <h2>👥 Lista de Usuarios ({{ usuarios.length }})</h2>
        <p v-if="usuarios.length === 0" class="no-data">
          No hay usuarios registrados. ¡Comienza agregando uno nuevo!
        </p>
        <div v-else class="tabla-responsive">
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
              <tr v-for="usuario in usuarios" :key="usuario.id">
                <td>{{ usuario.dni }}</td>
                <td>{{ usuario.nombres }}</td>
                <td>{{ usuario.apellidos }}</td>
                <td>{{ formatearFecha(usuario.fechaNacimiento) }}</td>
                <td>{{ usuario.genero }}</td>
                <td>{{ usuario.ciudad }}</td>
                <td>
                  <button
                    @click="handleEditar(usuario)"
                    class="btn btn-edit"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    @click="handleEliminar(usuario.id)"
                    class="btn btn-delete"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'App',
  setup() {
    const API_URL = 'http://localhost:3000/api/usuarios';

    // Estado
    const usuarios = ref([]);
    const editando = ref(null);
    const formulario = reactive({
      dni: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      genero: '',
      ciudad: ''
    });
    const errores = reactive({});
    const mensaje = reactive({ tipo: '', texto: '' });

    const ciudades = [
      'Guayaquil', 'Quito', 'Cuenca', 'Santo Domingo', 'Machala',
      'Durán', 'Manta', 'Portoviejo', 'Loja', 'Ambato'
    ];

    // Cargar usuarios al montar
    onMounted(() => {
      cargarUsuarios();
    });

    // Métodos
    const cargarUsuarios = async () => {
      try {
        const response = await axios.get(API_URL);
        usuarios.value = response.data;
      } catch (error) {
        mostrarMensaje('error', 'Error al cargar usuarios');
      }
    };

    const validarFormulario = () => {
      // Limpiar errores previos
      Object.keys(errores).forEach(key => delete errores[key]);

      // Validar DNI
      if (!formulario.dni.trim()) {
        errores.dni = 'El DNI es obligatorio';
      } else if (!/^\d{8,10}$/.test(formulario.dni)) {
        errores.dni = 'El DNI debe tener entre 8 y 10 dígitos';
      }

      // Validar nombres
      if (!formulario.nombres.trim()) {
        errores.nombres = 'Los nombres son obligatorios';
      } else if (formulario.nombres.trim().length < 2) {
        errores.nombres = 'Los nombres deben tener al menos 2 caracteres';
      }

      // Validar apellidos
      if (!formulario.apellidos.trim()) {
        errores.apellidos = 'Los apellidos son obligatorios';
      } else if (formulario.apellidos.trim().length < 2) {
        errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
      }

      // Validar fecha de nacimiento
      if (!formulario.fechaNacimiento) {
        errores.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
      } else {
        const fecha = new Date(formulario.fechaNacimiento);
        const hoy = new Date();
        if (fecha >= hoy) {
          errores.fechaNacimiento = 'La fecha debe ser anterior a hoy';
        }
      }

      // Validar género
      if (!formulario.genero) {
        errores.genero = 'Debe seleccionar un género';
      }

      // Validar ciudad
      if (!formulario.ciudad) {
        errores.ciudad = 'Debe seleccionar una ciudad';
      }

      return Object.keys(errores).length === 0;
    };

    const handleSubmit = async () => {
      if (!validarFormulario()) {
        mostrarMensaje('error', 'Por favor corrija los errores en el formulario');
        return;
      }

      try {
        if (editando.value) {
          await axios.put(`${API_URL}/${editando.value}`, formulario);
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
      formulario.dni = usuario.dni;
      formulario.nombres = usuario.nombres;
      formulario.apellidos = usuario.apellidos;
      formulario.fechaNacimiento = usuario.fechaNacimiento;
      formulario.genero = usuario.genero;
      formulario.ciudad = usuario.ciudad;
      editando.value = usuario.id;
      Object.keys(errores).forEach(key => delete errores[key]);
    };

    const handleEliminar = async (id) => {
      if (!confirm('¿Está seguro de eliminar este usuario?')) {
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
      formulario.dni = '';
      formulario.nombres = '';
      formulario.apellidos = '';
      formulario.fechaNacimiento = '';
      formulario.genero = '';
      formulario.ciudad = '';
      editando.value = null;
      Object.keys(errores).forEach(key => delete errores[key]);
    };

    const limpiarError = (campo) => {
      if (errores[campo]) {
        delete errores[campo];
      }
    };

    const mostrarMensaje = (tipo, texto) => {
      mensaje.tipo = tipo;
      mensaje.texto = texto;
      setTimeout(() => {
        mensaje.tipo = '';
        mensaje.texto = '';
      }, 5000);
    };

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString();
    };

    return {
      usuarios,
      editando,
      formulario,
      errores,
      mensaje,
      ciudades,
      handleSubmit,
      handleEditar,
      handleEliminar,
      resetFormulario,
      limpiarError,
      formatearFecha
    };
  }
};
</script>

<style scoped>
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --bg-light: #f8fafc;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.app {
  min-height: 100vh;
  padding: 2rem 1rem;
  background: var(--bg-light);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: var(--primary);
  margin-bottom: 2rem;
  font-size: 2rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

/* Transiciones */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mensajes */
.mensaje {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.mensaje.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.mensaje.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

/* Cards */
.formulario-card,
.tabla-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
}

/* Formulario */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: var(--error);
}

.error-text {
  display: block;
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Radio buttons */
.radio-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Botones - MEJORADOS */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Botón guardar destacado */
.btn-guardar {
  min-width: 200px;
  font-size: 1.1rem;
  padding: 1rem 2rem;
  font-weight: 600;
}

.btn-secondary {
  background: var(--text-secondary);
  color: white;
}

.btn-secondary:hover {
  background: #475569;
  transform: translateY(-1px);
}

.btn-edit {
  background: var(--warning);
  color: white;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.btn-edit:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.btn-delete {
  background: var(--error);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Tabla */
.tabla-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

thead {
  background: var(--bg-light);
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border);
}

td {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

tbody tr {
  transition: background 0.2s ease;
}

tbody tr:hover {
  background: var(--bg-light);
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .app {
    padding: 1rem 0.5rem;
  }

  .formulario-card,
  .tabla-card {
    padding: 1.5rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .radio-group {
    flex-direction: column;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-guardar {
    min-width: 100%;
  }

  table {
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.5rem;
  }
}
</style>