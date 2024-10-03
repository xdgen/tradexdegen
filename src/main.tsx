import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import appRoutes from "./routes/Routes";
import { Toaster } from "../src/components/ui/sonner"
import SolanaWalletProvider from "./provider/WalletProvider ";

const router = createBrowserRouter(appRoutes);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SolanaWalletProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
    </SolanaWalletProvider>
  </React.StrictMode>
);
