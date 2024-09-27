import Landing from "../Pages/landing";
import Layout from "../components/dashboard/layout";
import NewPair from "../Pages/dashboard/newPairs";


const appRoutes = [
  {
    path: "/",
    element: (
      <Landing />
    ),
  },
  {
    path: "/dashboard/",
    element: (
      <Layout>
        <NewPair />
      </Layout>
    ),
  },

];

export default appRoutes;
