import Landing from "../Pages/landing";
import NewPair from "../Pages/newPairs";
import SwapPage from "../Pages/swap";
import Layout from "../components/dashboard/layout";


const appRoutes = [
  {
    path: "/",
    element: (
      <Landing />
    ),
  },
  {
    path: "/swap",
    element: (
        <SwapPage />
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Layout>
        <NewPair />
      </Layout>
    ),
  },

];

export default appRoutes;
