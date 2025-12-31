import LandingPage from "@/pages/LandingPage";
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
    { path: "*", element: <div>Not Found</div> },
  ],
  {
    basename: import.meta.env.VITE_BASE_URL,
  },
);
