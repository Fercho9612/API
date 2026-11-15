import { useEffect, useState } from 'react';
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

const fecha = (f) => (f ? new Date(f).toLocaleDateString() : '');

const urlImagen = (ruta) => {
  if (!ruta) return '';
  return ruta.startsWith('http') ? ruta : `${API_URL}${ruta}`;
};

// Clasifica cada producción según el nombre de su tipo
const categoria = (item) => {
  const n = (item.tipo_id?.nombre || '').toLowerCase();
  if (n.includes('serie')) return 'series';
  if (n.includes('pel')) return 'peliculas';
  return 'otros';
};

const estilos = {
  contenedor: {
    background: '#101426',
    color: '#f1f5f9',
    minHeight: '100vh',
    padding: '30px',
    borderRadius: '14px',
  },
  panel: {
    background: '#1a2035',
    border: '1px solid #303951',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '25px',
  },
  etiqueta: {
    color: '#cbd5e1',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },
  campo: {
    background: '#11182a',
    border: '1px solid #39445e',
    color: '#fff',
    borderRadius: '8px',
    padding: '11px',
  },
  titulo: {
    color: '#fff',
    fontWeight: '700',
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

  // Estado del buscador y de la pestaña activa
  const [busqueda, setBusqueda] = useState('');
  const [pestana, setPestana] = useState('peliculas');

  // Filtrar por pestaña y por título o serial
  const itemsFiltrados = items.filter((item) => {
    const texto = busqueda.toLowerCase().trim();

    const coincide =
      (item.titulo || '').toLowerCase().includes(texto) ||
      (item.serial || '').toLowerCase().includes(texto);

    const enPestana = pestana === 'todos' || categoria(item) === pestana;

    return coincide && enPestana;
  });

  const contar = (c) => items.filter((i) => categoria(i) === c).length;

  const cargar = async () => {
    try {
      const res = await mediaService.listar();
      setItems(res.data);
    } catch (err) {
      Swal.fire('Error', mensajeError(err), 'error');
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

      setGeneros(g.data.filter((item) => item.estado === 'Activo'));
      setDirectores(d.data.filter((item) => item.estado === 'Activo'));
      setProductoras(p.data.filter((item) => item.estado === 'Activo'));
      setTipos(t.data);
    } catch (err) {
      Swal.fire('Error', mensajeError(err), 'error');
    }
  };

  useEffect(() => {
    cargar();
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (!archivoImagen) return;

    const url = URL.createObjectURL(archivoImagen);
    setVistaPrevia(url);

    return () => URL.revokeObjectURL(url);
  }, [archivoImagen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImagen = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      Swal.fire(
        'Formato no válido',
        'Selecciona una imagen JPG, PNG o WEBP.',
        'warning'
      );
      e.target.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      Swal.fire(
        'Imagen demasiado grande',
        'La imagen no debe superar los 5 MB.',
        'warning'
      );
      e.target.value = '';
      return;
    }

    setArchivoImagen(archivo);
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

    if (!editandoId && !archivoImagen) {
      Swal.fire(
        'Falta la portada',
        'Selecciona una imagen para continuar.',
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
      titulo: item.titulo,
      sinopsis: item.sinopsis,
      url_pelicula: item.url_pelicula,
      anio_estreno: item.anio_estreno,
      genero_id: item.genero_id?._id || item.genero_id,
      director_id: item.director_id?._id || item.director_id,
      productora_id: item.productora_id?._id || item.productora_id,
      tipo_id: item.tipo_id?._id || item.tipo_id,
    });

    setArchivoImagen(null);
    setVistaPrevia(urlImagen(item.imagen_portada));

    const input = document.getElementById('imagen_portada');
    if (input) input.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (item) => {
    const r = await Swal.fire({
      title: `¿Eliminar "${item.titulo}"?`,
      text: 'Esta acción eliminará el registro de la base de datos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (!r.isConfirmed) return;

    try {
      const res = await mediaService.eliminar(item._id);
      await Swal.fire('Eliminado', res.data.mensaje, 'success');
      await cargar();
    } catch (err) {
      Swal.fire('Error', mensajeError(err), 'error');
    }
  };

  // Mostrar la sinopsis completa sin cambiar el tamaño de la tarjeta
  const verSinopsis = (item) => {
    Swal.fire({
      title: item.titulo,
      text: item.sinopsis,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#7c3aed',
      background: '#1a2035',
      color: '#f1f5f9',
    });
  };

  const campo = (nombre, etiqueta, tipo = 'text', ancho = 'col-md-6') => (
    <div className={ancho} key={nombre}>
      <label style={estilos.etiqueta}>{etiqueta}</label>
      <input
        type={tipo}
        name={nombre}
        className="form-control"
        style={estilos.campo}
        value={form[nombre]}
        onChange={handleChange}
        min={tipo === 'number' ? 1801 : undefined}
        required
      />
    </div>
  );

  const selector = (nombre, etiqueta, opciones, propiedad, ancho = 'col-md-6') => (
    <div className={ancho} key={nombre}>
      <label style={estilos.etiqueta}>{etiqueta}</label>
      <select
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
    <div style={estilos.contenedor}>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <div style={{ color: '#a78bfa', fontSize: '13px', letterSpacing: '2px' }}>
            GESTIÓN DE CONTENIDO AUDIOVISUAL
          </div>

          <h2 style={{ ...estilos.titulo, fontSize: '30px', marginTop: '8px' }}>
            🎬 Catálogo de películas y series
          </h2>

          <p style={{ color: '#94a3b8' }}>
            Administra tus películas y series desde un solo lugar.
          </p>
        </div>

        <div style={{
          background: '#242c47',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '1px solid #39445e',
        }}>
          <div style={{ color: '#a78bfa', fontSize: '12px' }}>
            TÍTULOS REGISTRADOS
          </div>

          <div style={{ color: '#fff', fontSize: '26px', fontWeight: '700' }}>
            {items.length}
          </div>
        </div>
      </div>

      <div style={estilos.panel}>
        <h4 style={estilos.titulo}>
          {editandoId
            ? '✏️ Editar película o serie'
            : '＋ Registrar película o serie'}
        </h4>

        <p style={{ color: '#94a3b8', fontSize: '13px' }}>
          Completa la información y selecciona la portada de tu película o serie.
        </p>

        <p style={{ color: '#94a3b8', fontSize: '12px' }}>
          El serial se genera automáticamente al registrar (PEL-0001, SER-0001...).
        </p>

        <form onSubmit={handleSubmit}>
          <h6 style={{ color: '#a78bfa', margin: '25px 0 15px' }}>
            INFORMACIÓN DE LA PELÍCULA O SERIE
          </h6>

          <div className="row g-3">
            {campo('titulo', 'Título de la película o serie', 'text', 'col-12')}

            <div className="col-12">
              <label style={estilos.etiqueta}>Sinopsis</label>

              <textarea
                name="sinopsis"
                className="form-control"
                style={estilos.campo}
                rows="3"
                value={form.sinopsis}
                onChange={handleChange}
                required
              />
            </div>

            {campo('url_pelicula', 'URL de la película o serie', 'url')}
            {campo('anio_estreno', 'Año de estreno', 'number', 'col-md-6')}
          </div>

          <h6 style={{ color: '#a78bfa', margin: '28px 0 15px' }}>
            IMAGEN DE PORTADA
          </h6>

          <div className="row g-3 align-items-center">
            <div className="col-md-7">
              <label style={estilos.etiqueta}>Cargar imagen de portada</label>

              <input
                id="imagen_portada"
                type="file"
                className="form-control"
                style={estilos.campo}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImagen}
                required={!editandoId}
              />

              <small style={{ color: '#94a3b8' }}>
                Formatos JPG, PNG y WEBP. Tamaño máximo: 5 MB.
              </small>
            </div>

            <div className="col-md-5 text-center">
              {vistaPrevia ? (
                <img
                  src={vistaPrevia}
                  alt="Vista previa de portada"
                  style={{
                    maxWidth: '170px',
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '2px solid #8b5cf6',
                  }}
                />
              ) : (
                <div style={{
                  height: '180px',
                  border: '2px dashed #56617e',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <span style={{ fontSize: '35px' }}>🖼️</span>
                  Vista previa de la portada
                </div>
              )}
            </div>
          </div>

          <h6 style={{ color: '#a78bfa', margin: '28px 0 15px' }}>
            CLASIFICACIÓN
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
                background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                color: '#fff',
                border: 'none',
                fontWeight: '600',
                borderRadius: '8px',
              }}
            >
              {cargando
                ? 'Guardando...'
                : editandoId
                  ? 'Guardar cambios'
                  : '＋ Registrar película o serie'}
            </button>

            {editandoId && (
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={limpiarFormulario}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mb-3">
        <h4 style={estilos.titulo}>
          🍿 Películas y series registradas
        </h4>

        <p style={{ color: '#94a3b8', fontSize: '13px' }}>
          Consulta, edita o elimina películas y series de tu catálogo.
        </p>

        {/* Buscador de películas y series */}
        <div className="mb-4" style={{ maxWidth: '500px' }}>
          <div className="input-group">
            <span
              className="input-group-text"
              style={{
                background: '#242c47',
                border: '1px solid #39445e',
                color: '#a78bfa',
              }}
            >
              🔎
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Buscar por título o serial..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                ...estilos.campo,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            />

            {busqueda && (
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => setBusqueda('')}
              >
                Limpiar
              </button>
            )}
          </div>

          <small style={{ color: '#94a3b8' }}>
            {busqueda
              ? `${itemsFiltrados.length} resultado(s) encontrado(s)`
              : `${items.length} título(s) en el catálogo`}
          </small>
        </div>
      </div>

      {/* Pestañas: películas, series y todos */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'peliculas', texto: '🎬 Películas', total: contar('peliculas') },
          { id: 'series', texto: '📺 Series', total: contar('series') },
          { id: 'todos', texto: 'Todos', total: items.length },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPestana(p.id)}
            className="btn"
            style={{
              background: pestana === p.id
                ? 'linear-gradient(90deg, #7c3aed, #4f46e5)'
                : '#242c47',
              color: '#fff',
              border: '1px solid #39445e',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            {p.texto} ({p.total})
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{
          ...estilos.panel,
          textAlign: 'center',
          padding: '45px',
          color: '#94a3b8',
        }}>
          <div style={{ fontSize: '45px' }}>🎞️</div>

          <h5 style={{ color: '#fff', marginTop: '12px' }}>
            Aún no hay películas o series registradas
          </h5>

          ¡Comienza agregando tu primera película o serie!
        </div>
      ) : itemsFiltrados.length === 0 ? (
        <div style={{
          ...estilos.panel,
          textAlign: 'center',
          padding: '35px',
          color: '#94a3b8',
        }}>
          <div style={{ fontSize: '38px' }}>🔍</div>

          <h5 style={{ color: '#fff', marginTop: '12px' }}>
            No encontramos resultados
          </h5>

          <p>
            {busqueda
              ? `No hay resultados que coincidan con «${busqueda}» en esta sección.`
              : 'Aún no hay registros en esta sección.'}
          </p>

          {busqueda && (
            <button
              className="btn btn-outline-light"
              onClick={() => setBusqueda('')}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4 align-items-stretch">
          {itemsFiltrados.map((item) => (
            <div className="col-12 col-md-6 col-xl-4" key={item._id}>
              <div style={{
                background: '#1a2035',
                border: '1px solid #303951',
                borderRadius: '13px',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <img
                  src={urlImagen(item.imagen_portada)}
                  alt={item.titulo}
                  style={{
                    width: '100%',
                    height: '260px',
                    objectFit: 'cover',
                    background: '#11182a',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />

                <div style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}>
                  <div style={{
                    color: '#a78bfa',
                    fontSize: '12px',
                    marginBottom: '6px',
                  }}>
                    {item.tipo_id?.nombre || 'Sin tipo'} · {item.anio_estreno}
                  </div>

                  <h5 style={{
                    color: '#fff',
                    fontWeight: '700',
                    minHeight: '48px',
                    marginBottom: '10px',
                  }}>
                    {item.titulo}
                  </h5>

                  {/* Sinopsis resumida con altura uniforme */}
                  <div style={{ minHeight: '112px', marginBottom: '12px' }}>
                    <p style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      overflowWrap: 'anywhere',
                    }}>
                      {item.sinopsis}
                    </p>

                    {item.sinopsis && (
                      <button
                        type="button"
                        onClick={() => verSinopsis(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a78bfa',
                          padding: '5px 0 0',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Leer más
                      </button>
                    )}
                  </div>

                  <div style={{
                    borderTop: '1px solid #303951',
                    paddingTop: '12px',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    lineHeight: '1.7',
                  }}>
                    <div>Género: {item.genero_id?.nombre || 'No disponible'}</div>
                    <div>Director: {item.director_id?.nombres || 'No disponible'}</div>
                    <div>Productora: {item.productora_id?.nombre_productora || 'No disponible'}</div>
                    <div>Serial: {item.serial}</div>
                    <div>Creación: {fecha(item.fecha_creacion)}</div>
                  </div>

                  {/* Botones siempre al final */}
                  <div className="d-flex gap-2 mt-auto pt-3">
                    <button
                      className="btn btn-sm btn-warning flex-fill"
                      onClick={() => handleEditar(item)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="btn btn-sm btn-danger flex-fill"
                      onClick={() => handleEliminar(item)}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}