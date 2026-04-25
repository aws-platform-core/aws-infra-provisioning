import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Amplify } from "aws-amplify";
import App from "./App";
import { cognitoConfig } from "./auth/cognitoConfig";
import { ThemeModeProvider } from "./context/ThemeModeContext";

Amplify.configure(cognitoConfig);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeModeProvider>
  </React.StrictMode>
);