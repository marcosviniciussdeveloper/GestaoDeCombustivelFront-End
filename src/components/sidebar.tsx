import { NavLink } from "react-router-dom";
import { useAuth } from "../providers/authProvider";
import "../styles/sidebar.css";

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        ⛽ Gestão Combustível
      </div>

      <nav className="sidebar-nav">
        {/* Link para o Dashboard */}
        <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <i className="fa-solid fa-chart-line" /> Dashboard
        </NavLink>

        {/* Link para Motoristas */}
        <NavLink to="/motorista" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <i className="fa-solid fa-id-card-clip" /> Motoristas
        </NavLink>

        {/* 1. ADICIONE O NOVO LINK PARA ABASTECIMENTOS AQUI */}
        <NavLink to="/abastecimentos" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <i className="fa-solid fa-gas-pump" /> Abastecimentos
        </NavLink>
      </nav>

      {/* Área de Logout no rodapé */}
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
