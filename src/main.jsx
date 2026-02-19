import React from "react";
import ReactDOM from "react-dom/client";
import SnackbarProviderWrapper from "./common/toaster";
import AppRouter from "./routes/AppRouter";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <SnackbarProviderWrapper>
        <AppRouter />
      </SnackbarProviderWrapper>
    </HashRouter>
  </React.StrictMode>
);
