<<<<<<< feat/JOB-112
import LandingPage from "@/pages/LandingPage";
import CreateResumePage from "@/pages/resume/CreateResumePage";
import ResumePage from "@/pages/resume/ResumePage";
import ShowCase from "@/pages/ShowCase";
=======
>>>>>>> JOB-77
import { createBrowserRouter } from "react-router-dom";
// import LandingPage from "@/pages/LandingPage";
import SearchJobPage from "@/pages/seachJob/SearchJobPage";
import Profile from "@/pages/profile/Profile";

export const router = createBrowserRouter(
  [
<<<<<<< feat/JOB-112
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/test",
      element: <div>Test</div>,
    },
    {
      path: "/resume",
      element: <ResumePage />,
    },
    {
      path: "/resume/create",
      element: <CreateResumePage />,
    },
    {
      path: "/showcase",
      element: <ShowCase />,
    },
    { path: "*", element: <div>Not Found</div> },
=======
    // { path: "/", element: <LandingPage /> },
    { path: "/searchjob", element: <SearchJobPage /> },
    { path: "/profile", element: <Profile /> },
    { path: "*", element: <div>Not Found ESUS </div> },
>>>>>>> JOB-77
  ],
  {
    basename: import.meta.env.VITE_BASE_URL,
  }
);
