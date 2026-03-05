import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { datadogRum } from "@datadog/browser-rum";
import App from "./App";
import "./index.css";

datadogRum.init({
  applicationId: "923d68a1-db68-4613-9a16-a971119e5c5d",
  clientToken: "pub50116d8c83348d2430f0ba1b76619b29",
  site: "datadoghq.com",
  service: "mirrorshop",
  env: "prod",
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackBfcacheViews: true,
  defaultPrivacyLevel: "mask-user-input",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
