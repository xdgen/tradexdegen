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
import SolanaWalletProvider from "./provider/WalletProvider ";;

const router = createBrowserRouter(appRoutes);

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
    <React.StrictMode>
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
              backgroundColor: "grey",
              opacity: "0.9",
              color: "white",
              textAlign: "center",
              padding: "10px",
              fontWeight: "bold",
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
            }}
          >
            Screen size too small. Please use a larger screen for the best
            experience.
          </div>
        )}
      </SolanaWalletProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
