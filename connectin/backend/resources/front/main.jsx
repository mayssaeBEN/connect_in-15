import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// ✅ Tailwind uniquement
import "../css/app.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/feed/">
    <App />
  </BrowserRouter>
); 