// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import appRoutes from "./routes/Routes";
// import { Toaster } from "../src/components/ui/sonner"
// import SolanaWalletProvider from "./provider/WalletProvider ";

// const router = createBrowserRouter(appRoutes);


// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <SolanaWalletProvider>
//         <RouterProvider router={router} />
//         <Toaster position="top-right" />
//     </SolanaWalletProvider>
//   </React.StrictMode>
// );




import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import appRoutes from "./routes/Routes";
import { Toaster } from "../src/components/ui/sonner";
// import SolanaWalletProvider from "./provider/WalletProvider ";
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import config from "./lib/wagmi";
// import { createClient } from '@supabase/supabase-js'

const router = createBrowserRouter(appRoutes);
const queryClient = new QueryClient();

const App = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1023);
  

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1023);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
          {isSmallScreen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(10, 30, 10, 0.8)",
              opacity: "0.7",
              color: "white",
              textAlign: "center",
              padding: "10px",
              fontWeight: "900",
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "30px",
            }}
          >
            Screen size too small. Please use a larger screen for the best
            experience.
          </div>
        )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Move StrictMode to wrap the entire app render
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
