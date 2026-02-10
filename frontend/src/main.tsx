
  import { createRoot } from "react-dom/client";
  import { AuthProvider } from "./contexts/AuthContext";
  import App from "./app/App.tsx";
  import { Toaster } from "./app/components/ui/sonner";
  import "./styles/index.css";
  import "leaflet/dist/leaflet.css";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  );
