import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./providers/authProvider";

import Dashboard from "./Pages/dashboard";
import Login from "./Pages/login";
import Motorista from "./Pages/motorista";
// 1. ADICIONE A IMPORTAÇÃO DA NOVA PÁGINA DE ABASTECIMENTO
import AbastecimentoPage from "./Pages/Abastecimento"; 

// --- Componentes e Hooks ---
import { Sidebar } from "./components/sidebar";
import { useNProgress } from "./hooks/usenNProgress";


// --- COMPONENTE DE LAYOUT PRIVADO ---
// Este componente já tem a estrutura perfeita com a Sidebar e o conteúdo principal.
function AppLayout() {
  useNProgress();
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: { background: '#f0fdf4', color: '#166534' },
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            style: { background: '#fef2f2', color: '#991b1b' },
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      <div className="app">
        <Sidebar />
        <main className="main-content">
          <div className="content">
            <Routes>
              {/* Suas rotas privadas existentes */}
              <Route index element={<Dashboard />} />
              <Route path="motorista" element={<Motorista />} />
              
              {/* 2. ADICIONE A NOVA ROTA PARA A PÁGINA DE ABASTECIMENTOS AQUI */}
              <Route path="abastecimentos" element={<AbastecimentoPage />} />

            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}


// --- COMPONENTE PRINCIPAL QUE GERE AS ROTAS PÚBLICAS E PRIVADAS ---
export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // A sua lógica de loading e autenticação está perfeita, não precisa de alterações.
  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      {isAuthenticated ? (
        // Se autenticado, renderiza o layout principal que contém todas as rotas privadas.
        <Route path="/*" element={<AppLayout />} />
      ) : (
        // Se não autenticado, só permite o acesso à página de login.
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
}
