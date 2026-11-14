import React from 'react';
import { NavLink } from 'react-router-dom';

export default function MainLayout({ children }) {
  return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* Barra de navegación superior moderna */}
        <nav className="navbar navbar-expand navbar-dark shadow-sm px-4" style={{ backgroundColor: '#0f172a', height: '65px' }}>
        <span className="navbar-brand fw-bold fs-5 text-white d-flex align-items-center gap-2">
          🎬 Películas Admin
        </span>
          <div className="navbar-nav ms-3 gap-2">
            <NavLink className="nav-link px-3 rounded text-light" activeStyle={{ backgroundColor: '#1e293b', fontWeight: '600' }} to="/generos">Géneros</NavLink>
            <NavLink className="nav-link px-3 rounded text-light" activeStyle={{ backgroundColor: '#1e293b', fontWeight: '600' }} to="/directores">Directores</NavLink>
            <NavLink className="nav-link px-3 rounded text-light" activeStyle={{ backgroundColor: '#1e293b', fontWeight: '600' }} to="/productoras">Productoras</NavLink>
            <NavLink className="nav-link px-3 rounded text-light" activeStyle={{ backgroundColor: '#1e293b', fontWeight: '600' }} to="/tipos">Tipos</NavLink>
          </div>
        </nav>

        {/* Contenedor principal con efecto de tarjeta elegante */}
        <main className="container py-4" style={{ maxWidth: '1100px' }}>
          <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '12px' }}>
            {children}
          </div>
        </main>
      </div>
  );
}