import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import appRoutes from "./routes/Routes";
import { Toaster } from "../src/components/ui/sonner"

const router = createBrowserRouter(appRoutes);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
  </React.StrictMode>
);
