import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./assets/css/App.css";
import "./index.css";
import { Provider as ChakraProvider } from "./components/ui/provider.tsx";

import { AuthProvider } from "./contexts/AuthProvider.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import Loader from "./features/ui/components/Loader/Loader.tsx";
import ApiResponseModalAlert from "./core/components/ApiResponseModalAlert.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider>
      {/* <AuthProvider> */}
      <Provider store={store} >
        <Loader></Loader>
        <ApiResponseModalAlert />
        <App />
      </Provider>
      {/* </AuthProvider> */}
    </ChakraProvider>
  </StrictMode>
);
