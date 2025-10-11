import Layout from "../components/dashboard/layout";
import SetBalancePage from "../Pages/balance/funds";
import ComingSoon from "../Pages/comingSoon/coming";
import DocsPage from "../Pages/docs/docs";
import HomePage from "../Pages/home/home";
import Landing from "../Pages/landing/Landing";
import NewPair from "../Pages/pairs/NewPairs";
import PnlPage from "../Pages/pnl/page";
import SettingPage from "../Pages/setting/settings";
import SwapPage from "../Pages/swap/Swap";
import TradingPage from "../Pages/trading/TradingPage";
import ExplorerGrid from "../Pages/explorer/ExplorerGrid";
import DetailsPage from "../Pages/explorer/DetailsPage";
import AcademyStats from "../Pages/academy/AcademyStats";

const appRoutes = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/explorer",
    element: (
      <Layout>
        <ExplorerGrid />
      </Layout>
    ),
  },
  {
    path: "/class/:id",
    element: (
      <Layout>
        <DetailsPage />
      </Layout>
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
      <Layout>
        <SwapPage />
      </Layout>
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
    path: "/pnl",
    element: (
      <Layout>
        <PnlPage />
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
  {
    path: "/academy-stats",
    element: (
      <Layout>
        <AcademyStats />
      </Layout>
    ),
  },
];

export default appRoutes;
