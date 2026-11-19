import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import mediaService from '../services/mediaService';
import { crearServicio } from '../services/crearServicio';

const generoService = crearServicio('generos');
const directorService = crearServicio('directores');
const productoraService = crearServicio('productoras');
const tipoService = crearServicio('tipos');

const API_URL = 'http://localhost:3000';

const vacio = {
  titulo: '',
  sinopsis: '',
  url_pelicula: '',
  anio_estreno: '',
  genero_id: '',
  director_id: '',
  productora_id: '',
  tipo_id: '',
  imagen_url: '',
};

const mensajeError = (err) => {
  const data = err.response?.data;

  if (!data) return 'No se pudo comunicar con el servidor';

  if (String(data.error).includes('E11000')) {
    return 'El serial o la URL ya están registrados';
  }

  return data.error
    ? `${data.mensaje || 'Error'}: ${data.error}`
    : data.mensaje || 'Ocurrió un error inesperado';
};

const urlImagen = (ruta) => {
  if (!ruta) return '';
  return ruta.startsWith('http') ? ruta : `${API_URL}${ruta}`;
};

const categoria = (item) => {
  const nombre = (item.tipo_id?.nombre || '').toLowerCase();
  if (nombre.includes('serie')) return 'series';
  if (nombre.includes('pel')) return 'peliculas';
  return 'otros';
};

const estilos = {
  pagina: {
    minHeight: '100vh',
    padding: 'clamp(16px, 3vw, 32px)',
    color: '#eef2ff',
    background: 'linear-gradient(135deg, #0b1020 0%, #11182c 55%, #17152e 100%)',
    borderRadius: '18px',
  },
  panel: {
    background: 'rgba(24, 32, 55, 0.92)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    borderRadius: '18px',
    boxShadow: '0 14px 40px rgba(0, 0, 0, 0.18)',
  },
  etiqueta: {
    display: 'block',
    color: '#cbd5e1',
    marginBottom: '7px',
    fontSize: '13px',
    fontWeight: 600,
  },
  campo: {
    width: '100%',
    background: '#10182b',
    border: '1px solid #394663',
    color: '#f8fafc',
    borderRadius: '10px',
    padding: '11px 13px',
    outline: 'none',
  },
  titulo: {
    color: '#fff',
    fontWeight: 750,
    letterSpacing: '-0.4px',
  },
};

export default function Media() {
  const [items, setItems] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [directores, setDirectores] = useState([]);
  const [productoras, setProductoras] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [pestana, setPestana] = useState('todos');

  const itemsFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return items.filter((item) => {
      const coincide =
        (item.titulo || '').toLowerCase().includes(texto) ||
        (item.serial || '').toLowerCase().includes(texto) ||
        (item.genero_id?.nombre || '').toLowerCase().includes(texto) ||
        (item.director_id?.nombres || '').toLowerCase().includes(texto);

      const enPestana = pestana === 'todos' || categoria(item) === pestana;
      return coincide && enPestana;
    });
  }, [items, busqueda, pestana]);

  const contar = (tipo) => items.filter((item) => categoria(item) === tipo).length;

  const cargar = async () => {
    try {
      const res = await mediaService.listar();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire('Error', mensajeError(err), 'error');
    } finally {
      setCargandoDatos(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [g, d, p, t] = await Promise.all([
        generoService.listar(),
        directorService.listar(),
        productoraService.listar(),
        tipoService.listar(),
      ]);

      setGeneros((g.data || []).filter((item) => item.estado === 'Activo'));
      setDirectores((d.data || []).filter((item) => item.estado === 'Activo'));
      setProductoras((p.data || []).filter((item) => item.estado === 'Activo'));
      setTipos(t.data || []);
    } catch (err) {
      Swal.fire('Error', mensajeError(err), 'error');
    }
  };

  useEffect(() => {
    cargar();
    cargarCatalogos();
    // Se carga la información inicial una sola vez al entrar al módulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (archivoImagen) {
      const url = URL.createObjectURL(archivoImagen);
      setVistaPrevia(url);
      return () => URL.revokeObjectURL(url);
    }

    if (form.imagen_url) {
      setVistaPrevia(form.imagen_url);
    } else if (!editandoId) {
      setVistaPrevia('');
    }
  }, [archivoImagen, form.imagen_url, editandoId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((actual) => ({ ...actual, [name]: value }));

    if (name === 'imagen_url' && value) {
      setArchivoImagen(null);
      const input = document.getElementById('imagen_portada');
      if (input) input.value = '';
    }
  };

  const handleImagen = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

    if (!tiposPermitidos.includes(archivo.type)) {
      Swal.fire('Formato no válido', 'Selecciona una imagen JPG, PNG o WEBP.', 'warning');
      e.target.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      Swal.fire('Imagen demasiado grande', 'La imagen no debe superar los 5 MB.', 'warning');
      e.target.value = '';
      return;
    }

    setArchivoImagen(archivo);
    setForm((actual) => ({ ...actual, imagen_url: '' }));
  };

  const limpiarFormulario = () => {
    setForm(vacio);
    setEditandoId(null);
    setArchivoImagen(null);
    setVistaPrevia('');

    const input = document.getElementById('imagen_portada');
    if (input) input.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editandoId && !archivoImagen && !form.imagen_url) {
      Swal.fire(
        'Falta la portada',
        'Selecciona una imagen local o pega una URL web para continuar.',
        'warning'
      );
      return;
    }

    const datos = new FormData();
    Object.entries(form).forEach(([clave, valor]) => {
      datos.append(clave, valor);
    });

    if (archivoImagen) {
      datos.append('imagen_portada', archivoImagen);
    }

    try {
      setCargando(true);

      const res = editandoId
        ? await mediaService.actualizar(editandoId, datos)
        : await mediaService.crear(datos);

      await Swal.fire(
        editandoId ? '¡Actualizado!' : '¡Registrado!',
        res.data.mensaje,
        'success'
      );

      limpiarFormulario();
      await cargar();
    } catch (err) {
      Swal.fire('Error', mensajeError(err), 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (item) => {
    setEditandoId(item._id);

    setForm({
      titulo: item.titulo || '',
      sinopsis: item.sinopsis || '',
      url_pelicula: item.url_pelicula || '',
      anio_estreno: item.anio_estreno || '',
      genero_id: item.genero_id?._id || item.genero_id || '',
      director_id: item.director_id?._id || item.director_id || '',
      productora_id: item.productora_id?._id || item.productora_id || '',
      tipo_id: item.tipo_id?._id || item.tipo_id || '',
      imagen_url: item.imagen_portada?.startsWith('http') ? item.imagen_portada : '',
    });

    setArchivoImagen(null);
    setVistaPrevia(urlImagen(item.imagen_portada));

    const input = document.getElementById('imagen_portada');
    if (input) input.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (item) => {
    const resultado = await Swal.fire({
      title: `¿Eliminar "${item.titulo}"?`,
      text: 'Esta acción eliminará el registro de la base de datos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      background: '#182037',
      color: '#f8fafc',
    });

    if (!resultado.isConfirmed) return;

    try {
      const res = await mediaService.eliminar(item._id);
      await Swal.fire('Eliminado', res.data.mensaje, 'success');
      await cargar();
    } catch (err) {
      Swal.fire('Error', mensajeError(err), 'error');
    }
  };

  const verSinopsis = (item) => {
    Swal.fire({
      title: item.titulo,
      text: item.sinopsis,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#7c3aed',
      background: '#182037',
      color: '#f1f5f9',
    });
  };

  const campo = (nombre, etiqueta, tipo = 'text', ancho = 'col-md-6', requerido = true) => (
    <div className={ancho} key={nombre}>
      <label htmlFor={nombre} style={estilos.etiqueta}>{etiqueta}</label>
      <input
        id={nombre}
        type={tipo}
        name={nombre}
        className="form-control"
        style={estilos.campo}
        value={form[nombre]}
        onChange={handleChange}
        min={tipo === 'number' ? 1801 : undefined}
        max={tipo === 'number' ? new Date().getFullYear() + 5 : undefined}
        required={requerido}
      />
    </div>
  );

  const selector = (nombre, etiqueta, opciones, propiedad, ancho = 'col-md-6') => (
    <div className={ancho} key={nombre}>
      <label htmlFor={nombre} style={estilos.etiqueta}>{etiqueta}</label>
      <select
        id={nombre}
        name={nombre}
        className="form-select"
        style={estilos.campo}
        value={form[nombre]}
        onChange={handleChange}
        required
      >
        <option value="">Seleccionar {etiqueta.toLowerCase()}</option>
        {opciones.map((item) => (
          <option key={item._id} value={item._id}>
            {item[propiedad]}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={estilos.pagina}>
      <style>{`
        .media-input:focus, .media-select:focus {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, .18) !important;
        }
        .media-tab {
          border: 1px solid #465372;
          color: #d3dbea;
          background: #202b47;
          border-radius: 999px;
          padding: 10px 18px;
          font-weight: 700;
          font-size: 13px;
          transition: .2s ease;
        }
        .media-tab:hover { border-color: #a78bfa; color: #fff; transform: translateY(-1px); }
        .media-tab.active {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(100deg, #7c3aed, #4f46e5);
          box-shadow: 0 7px 18px rgba(99, 102, 241, .28);
        }
        .media-catalogo {
          background: linear-gradient(145deg, #1b2540 0%, #202b47 100%);
          border: 1px solid rgba(148, 163, 184, .24);
          border-radius: 22px;
          padding: clamp(17px, 2.5vw, 28px);
          box-shadow: 0 18px 45px rgba(0, 0, 0, .2);
        }
        .media-search-wrap {
          width: 360px;
          max-width: 100%;
          min-width: min(100%, 260px);
          margin-left: auto;
        }
        .media-search-wrap .form-control {
          font-size: 13px;
        }
        .media-card {
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(148, 163, 184, .2);
          border-radius: 17px;
          background: #151f36;
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }
        .media-card:hover {
          transform: translateY(-4px);
          border-color: rgba(167, 139, 250, .55);
          box-shadow: 0 16px 30px rgba(0, 0, 0, .22);
        }
        .media-poster {
          width: 100%;
          height: 245px;
          object-fit: cover;
          background: #10182b;
        }
        .media-action {
          border-radius: 9px;
          font-weight: 650;
          padding: 6px 10px;
          font-size: 12px;
        }
        .media-link {
          color: #c4b5fd;
          text-decoration: none;
          font-weight: 650;
        }
        .media-link:hover { color: #fff; text-decoration: underline; }
        @media (max-width: 767px) {
          .media-search-wrap {
            width: 100%;
            margin-left: 0;
          }
        }
        @media (max-width: 576px) {
          .media-poster { height: 225px; }
        }
      `}</style>

      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 750, letterSpacing: '2px' }}>
            GESTIÓN DE CONTENIDO AUDIOVISUAL
          </div>
          <h2 style={{ ...estilos.titulo, fontSize: 'clamp(25px, 4vw, 34px)', margin: '8px 0' }}>
            🎬 Catálogo de películas y series
          </h2>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            Administra, consulta y organiza tus contenidos desde un solo lugar.
          </p>
        </div>

        <div style={{
          ...estilos.panel,
          minWidth: '170px',
          padding: '17px 22px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, .22), rgba(79, 70, 229, .12))',
        }}>
          <div style={{ color: '#c4b5fd', fontSize: '11px', fontWeight: 750, letterSpacing: '1px' }}>
            TÍTULOS REGISTRADOS
          </div>
          <div style={{ color: '#fff', fontSize: '30px', fontWeight: 800, lineHeight: 1.2 }}>
            {items.length}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>
            {contar('peliculas')} películas · {contar('series')} series
          </div>
        </div>
      </div>

      {/* Formulario */}
      <section style={{ ...estilos.panel, padding: 'clamp(17px, 2.5vw, 27px)', marginBottom: '30px' }}>
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <div style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 750, letterSpacing: '1.5px' }}>
              {editandoId ? 'ACTUALIZAR REGISTRO' : 'NUEVO CONTENIDO'}
            </div>
            <h4 style={{ ...estilos.titulo, margin: '5px 0' }}>
              {editandoId ? '✏️ Editar película o serie' : '＋ Registrar película o serie'}
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
              Completa los datos y agrega una portada para identificar el contenido.
            </p>
          </div>
          {editandoId && (
            <span style={{
              color: '#ddd6fe',
              background: 'rgba(124, 58, 237, .18)',
              border: '1px solid rgba(167, 139, 250, .3)',
              padding: '6px 11px',
              borderRadius: '999px',
              fontSize: '12px',
            }}>
              Modo edición
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <h6 style={{ color: '#c4b5fd', fontWeight: 750, fontSize: '12px', letterSpacing: '1px', marginBottom: '15px' }}>
            01 · INFORMACIÓN GENERAL
          </h6>
          <div className="row g-3">
            {campo('titulo', 'Título de la película o serie', 'text', 'col-12')}
            <div className="col-12">
              <label htmlFor="sinopsis" style={estilos.etiqueta}>Sinopsis</label>
              <textarea
                id="sinopsis"
                name="sinopsis"
                className="form-control media-input"
                style={{ ...estilos.campo, minHeight: '95px', resize: 'vertical' }}
                rows="3"
                value={form.sinopsis}
                onChange={handleChange}
                placeholder="Escribe una breve descripción del contenido..."
                required
              />
            </div>
            {campo('url_pelicula', 'URL de la película o serie', 'url', 'col-md-8', true)}
            {campo('anio_estreno', 'Año de estreno', 'number', 'col-md-4')}
          </div>

          <div style={{ borderTop: '1px solid rgba(148, 163, 184, .14)', margin: '25px 0 20px' }} />
          <h6 style={{ color: '#c4b5fd', fontWeight: 750, fontSize: '12px', letterSpacing: '1px', marginBottom: '15px' }}>
            02 · IMAGEN DE PORTADA
          </h6>

          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-7">
              <div className="mb-3">
                <label htmlFor="imagen_portada" style={estilos.etiqueta}>Cargar archivo de portada</label>
                <input
                  id="imagen_portada"
                  type="file"
                  className="form-control media-input"
                  style={estilos.campo}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagen}
                  required={!editandoId && !form.imagen_url}
                />
                <small style={{ color: '#94a3b8' }}>Formatos JPG, PNG y WEBP. Tamaño máximo: 5 MB.</small>
              </div>
              <div>
                <label htmlFor="imagen_url" style={estilos.etiqueta}>O pega la URL de la imagen (TMDb / web)</label>
                <input
                  id="imagen_url"
                  type="url"
                  name="imagen_url"
                  className="form-control media-input"
                  style={estilos.campo}
                  placeholder="https://..."
                  value={form.imagen_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-12 col-md-5">
              <div style={{
                minHeight: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                border: '1px dashed #56617e',
                borderRadius: '14px',
                background: 'rgba(15, 23, 42, .45)',
              }}>
                {vistaPrevia ? (
                  <img
                    src={vistaPrevia}
                    alt="Vista previa de portada"
                    style={{
                      maxWidth: '150px',
                      width: '100%',
                      height: '205px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      boxShadow: '0 10px 24px rgba(0,0,0,.3)',
                    }}
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  />
                ) : (
                  <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                    <div style={{ fontSize: '35px', marginBottom: '7px' }}>🖼️</div>
                    <div style={{ fontSize: '13px' }}>Vista previa de la portada</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(148, 163, 184, .14)', margin: '25px 0 20px' }} />
          <h6 style={{ color: '#c4b5fd', fontWeight: 750, fontSize: '12px', letterSpacing: '1px', marginBottom: '15px' }}>
            03 · CLASIFICACIÓN
          </h6>
          <div className="row g-3">
            {selector('genero_id', 'Género', generos, 'nombre')}
            {selector('director_id', 'Director', directores, 'nombres')}
            {selector('productora_id', 'Productora', productoras, 'nombre_productora')}
            {selector('tipo_id', 'Tipo', tipos, 'nombre')}
          </div>

          <div className="d-flex gap-2 mt-4 flex-wrap">
            <button
              type="submit"
              className="btn px-4"
              disabled={cargando}
              style={{
                background: 'linear-gradient(100deg, #7c3aed, #4f46e5)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                padding: '11px 18px',
                opacity: cargando ? 0.7 : 1,
              }}
            >
              {cargando ? 'Guardando...' : editandoId ? 'Guardar cambios' : '＋ Registrar contenido'}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-outline-light" onClick={limpiarFormulario}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Catálogo */}
      <section className="media-catalogo">
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <div style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 750, letterSpacing: '1.5px' }}>
              BIBLIOTECA
            </div>
            <h4 style={{ ...estilos.titulo, margin: '5px 0' }}>🎬 Películas y series registradas</h4>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
              {itemsFiltrados.length} {itemsFiltrados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          </div>

          <div className="input-group media-search-wrap ms-auto">
            <span className="input-group-text" style={{
              background: '#242c47',
              border: '1px solid #39445e',
              color: '#a78bfa',
            }}>
              🔎
            </span>
            <input
              type="text"
              className="form-control media-input"
              placeholder="Buscar por título o serial..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ ...estilos.campo, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            />
            {busqueda && (
              <button type="button" className="btn btn-outline-light" onClick={() => setBusqueda('')}>
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap mb-4">
          {[
            { id: 'todos', texto: 'Todos', total: items.length },
            { id: 'peliculas', texto: '🎬 Películas', total: contar('peliculas') },
            { id: 'series', texto: '📺 Series', total: contar('series') },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPestana(p.id)}
              className={`media-tab ${pestana === p.id ? 'active' : ''}`}
            >
              {p.texto} <span style={{ opacity: 0.8 }}>({p.total})</span>
            </button>
          ))}
        </div>

        {cargandoDatos ? (
          <div style={{ ...estilos.panel, padding: '45px 20px', textAlign: 'center', color: '#cbd5e1' }}>
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Cargando catálogo...
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div style={{ ...estilos.panel, padding: '50px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>🎞️</div>
            <h5 style={{ color: '#fff' }}>No hay registros en esta sección</h5>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Prueba otra pestaña o registra una película o serie nueva.
            </p>
          </div>
        ) : (
          <div className="row g-4 align-items-stretch">
            {itemsFiltrados.map((item) => (
              <div className="col-12 col-sm-6 col-xl-4" key={item._id}>
                <article className="media-card">
                  {item.imagen_portada ? (
                    <img
                      className="media-poster"
                      src={urlImagen(item.imagen_portada)}
                      alt={`Portada de ${item.titulo}`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="media-poster d-flex align-items-center justify-content-center" style={{ color: '#64748b' }}>
                      <span style={{ fontSize: '42px' }}>🎬</span>
                    </div>
                  )}

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                      <span style={{
                        color: '#c4b5fd',
                        background: 'rgba(124, 58, 237, .16)',
                        border: '1px solid rgba(167, 139, 250, .22)',
                        borderRadius: '999px',
                        padding: '4px 9px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}>
                        {item.tipo_id?.nombre || 'Sin tipo'}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{item.anio_estreno || 'Año no disponible'}</span>
                    </div>

                    <h5 style={{
                      color: '#fff',
                      fontWeight: 750,
                      minHeight: '48px',
                      margin: '3px 0 10px',
                      lineHeight: 1.3,
                    }}>
                      {item.titulo}
                    </h5>

                    <p style={{
                      color: '#aab6ca',
                      fontSize: '13px',
                      lineHeight: 1.55,
                      margin: '0 0 7px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '60px',
                    }}>
                      {item.sinopsis || 'Sin sinopsis disponible.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => verSinopsis(item)}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'none',
                        border: 'none',
                        color: '#a78bfa',
                        padding: '0 0 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Leer sinopsis completa
                    </button>

                    <div style={{
                      borderTop: '1px solid rgba(148, 163, 184, .15)',
                      paddingTop: '12px',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      lineHeight: 1.85,
                    }}>
                      <div><span style={{ color: '#94a3b8' }}>Género:</span> {item.genero_id?.nombre || 'No disponible'}</div>
                      <div><span style={{ color: '#94a3b8' }}>Director:</span> {item.director_id?.nombres || 'No disponible'}</div>
                      <div><span style={{ color: '#94a3b8' }}>Productora:</span> {item.productora_id?.nombre_productora || 'No disponible'}</div>
                      <div><span style={{ color: '#94a3b8' }}>Serial:</span> {item.serial || 'No disponible'}</div>
                    </div>

                    {item.url_pelicula ? (
                      <a
                        href={item.url_pelicula}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="media-link mt-3"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          border: '1px solid rgba(167, 139, 250, .28)',
                          background: 'rgba(124, 58, 237, .12)',
                          borderRadius: '10px',
                          padding: '9px 11px',
                        }}
                      >
                        <span aria-hidden="true">▶</span> Ver película o serie
                      </a>
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '12px' }}>
                        URL no disponible
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-auto pt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-warning flex-fill media-action"
                        onClick={() => handleEditar(item)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger flex-fill media-action"
                        onClick={() => handleEliminar(item)}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
