import LandingPage from "@/pages/LandingPage";
import CreateResumePage from "@/pages/resume/CreateResumePage";
import ResumePage from "@/pages/resume/ResumePage";
import ShowCase from "@/pages/ShowCase";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter(
  [
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
  ],
  {
    basename: import.meta.env.VITE_BASE_URL,
  },
);
