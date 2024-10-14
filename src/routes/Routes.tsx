import Layout from "../components/dashboard/layout";
import SetBalancePage from "../Pages/balance/funds";
import ComingSoon from "../Pages/comingSoon/coming";
import DocsPage from "../Pages/docs/docs";
import HomePage from "../Pages/home/home";
import Landing from "../Pages/landing/Landing";
import NewPair from "../Pages/pairs/NewPairs";
import SettingPage from "../Pages/setting/settings";
import SwapPage from "../Pages/swap/Swap";
import TradingPage from "../Pages/trading/TradingPage";
import Waitlist from "../Pages/waitlist/waitlist";


const appRoutes = [
  {
    path: "/",
    element: (
      <Landing />
    ),
  },
  {
    path: "/waitlist",
    element: (
      <Waitlist />
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
  {
    path: "/settings",
    element: (
      <Layout>
        <SettingPage />
      </Layout>
    ),
  },
  {
    path: "/docs",
    element: (
      <Layout>
        <DocsPage />
      </Layout>
    ),
  },

];

export default appRoutes;
