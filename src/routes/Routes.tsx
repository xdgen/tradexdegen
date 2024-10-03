import Layout from "../components/dashboard/layout";
import SetBalancePage from "../Pages/balance/funds";
import ComingSoon from "../Pages/comingSoon/coming";
import HomePage from "../Pages/home/home";
import Landing from "../Pages/landing/Landing";
import NewPair from "../Pages/pairs/NewPairs";
import SwapPage from "../Pages/swap/Swap";
import TradingPage from "../Pages/trading/TradingPage";


const appRoutes = [
  {
    path: "/",
    element: (
      <Landing />
    ),
  },
  {
    path: "/home",
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: "/funds",
    element: (
      <Layout>
        <SetBalancePage />
      </Layout>
    ),
  },
  {
    path: "/swap",
    element: (
      <SwapPage />
    ),
  },
  {
    path: "/trade",
    element: (
      <Layout>
        <NewPair />
      </Layout>
    ),
  },
  {
    path: "/trading/:id",
    element: (
      <Layout>
        <TradingPage />
      </Layout>
    ),
  },
  {
    path: "/coming",
    element: (
      <Layout>
        <ComingSoon />
      </Layout>
    ),
  },

];

export default appRoutes;
