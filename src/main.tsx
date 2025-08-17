import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./app";
import { AuthProvider } from "./providers/authProvider";

// Seus CSS imports
import "./styles/Index.css";
import "./styles/App.css";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      {/* --- A ORDEM CORRETA É ESTA --- */}
      <BrowserRouter>  {/* 1. O BrowserRouter vem primeiro */}
        <AuthProvider> {/* 2. O AuthProvider vem depois, por dentro */}
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
