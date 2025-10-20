import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import appRoutes from "./routes/Routes";
import { Toaster } from "../src/components/ui/sonner";
import "@solana/wallet-adapter-react-ui/styles.css";
import SolanaWalletProvider from "./provider/WalletProvider ";
import AOS from "aos";
import "aos/dist/aos.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter(appRoutes);

const App = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1023);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
    });

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1023);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Solana wallet configuration
  // const network = WalletAdapterNetwork.Devnet; // Change to 'mainnet-beta' for production
  // const endpoint = clusterApiUrl(network);

  // const wallets: Adapter[] = [
  //   new PhantomWalletAdapter(),
  //   new SolflareWalletAdapter(),
  // ];

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <SolanaWalletProvider>
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
      </SolanaWalletProvider>
    </QueryClientProvider>
  );
};

// Move StrictMode to wrap the entire app render
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
