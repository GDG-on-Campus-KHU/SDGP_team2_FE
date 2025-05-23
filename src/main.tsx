import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./locales/i18n.ts";

createRoot(document.getElementById("root")!).render(<App />);
