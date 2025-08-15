import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside style={{width:280, minHeight:"100vh", borderRight:"1px solid #e5e7eb", background:"#fff"}}>
      <div style={{padding:"20px 16px", background:"#dc3545", color:"#fff", fontWeight:700}}>
        ⛽ Gestão Combustível
      </div>

      <nav style={{padding:12}}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            "nav-link" + (isActive ? " active" : "")
          }
          style={{display:"flex",gap:10,alignItems:"center",padding:"12px 14px",borderRadius:8,color:"#444",textDecoration:"none"}}
        >
          <i className="fa-solid fa-chart-line" /> Dashboard
        </NavLink>

        <NavLink
          to="/motoristas"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " active" : "")
          }
          style={{display:"flex",gap:10,alignItems:"center",padding:"12px 14px",borderRadius:8,color:"#444",textDecoration:"none"}}
        >
          <i className="fa-solid fa-id-card-clip" /> Motoristas
        </NavLink>
      </nav>
    </aside>
  );
}
