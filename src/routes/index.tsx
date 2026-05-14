import LandingPage from "@/pages/LandingPage";
import CreateResumePage from "@/pages/resume/CreateResumePage";
import ResumePage from "@/pages/resume/ResumePage";
import ShowCase from "@/pages/ShowCase";
import ShowCaseDialogs from "@/pages/ShowCaseDialogs";

import { createBrowserRouter } from "react-router-dom";
import SearchJobPage from "@/pages/seachJob/SearchJobPage";
import Profile from "@/pages/profile/Profile";
import Message from "@/pages/message/MessagePage";
import AppliedHis from "@/pages/myjob/AppliedHis";
import SignInPage from "@/pages/auth/SignInPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import AccountSettingsPage from "@/pages/pagesetting/AccountSettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

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
    {
      path: "/showcase/dialogs",
      element: <ShowCaseDialogs />,
    },
    {
      path: "/message",
      element: <Message />,
    },
    {
      path: "/signin",
      element: <SignInPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
    { path: "/searchjob", element: <SearchJobPage /> },
    { path: "/profile", element: <Profile /> },
    { path: "/myjobs", element: <AppliedHis /> },
    {
      path: "/settings/account",
      element: <AccountSettingsPage />,
    },
  ],
  {
    basename: import.meta.env.VITE_BASE_URL,
  },
);
