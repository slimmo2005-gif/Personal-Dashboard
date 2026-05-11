import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { App } from "./App";

let basename = import.meta.env.BASE_URL;
if (basename.endsWith("/")) basename = basename.slice(0, -1);
const routerProps = basename !== "" && basename !== "/" ? { basename } : {};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter {...routerProps}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
