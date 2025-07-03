import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Middleware } from "./Middleware.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Middleware>
        <App />
      </Middleware>
    </QueryClientProvider>
  </BrowserRouter>
);
