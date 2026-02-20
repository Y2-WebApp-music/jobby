import { createBrowserRouter } from "react-router-dom";
// import LandingPage from "@/pages/LandingPage";
import SearchJobPage from "@/pages/seachJob/SearchJobPage";
import Profile from "@/pages/profile/Profile";

export const router = createBrowserRouter(
  [
    // { path: "/", element: <LandingPage /> },
    { path: "/searchjob", element: <SearchJobPage /> },
    { path: "/profile", element: <Profile /> },
    { path: "*", element: <div>Not Found ESUS </div> },
  ],
  {
    basename: import.meta.env.VITE_BASE_URL,
  }
);
