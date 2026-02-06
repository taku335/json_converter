import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import App from "./app.js";

const root = createRoot(document.getElementById("app"));
root.render(React.createElement(App));
