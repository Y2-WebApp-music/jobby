import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";
import { ThemeProvider } from "./components/theme-provider";
import { hydrateAuthStoreFromSession } from "./services/authClient";

export function App() {
  useEffect(() => {
    void hydrateAuthStoreFromSession();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
