import { useParams, useSearchParams } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { AppLoader } from "../../ui/components/Loader/Loader";
import componentConfig from "../../componentConfig"; // Adjust the path accordingly
import React from "react";

const HandleDynamicView = () => {
  console.log("===HANDLE DYNAMIC VIEW===");
  const { view, params } = useParams(); // Access the `view` and `params` from the URL
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "Default";
  // Dynamically import the component based on `view` parameter
  // Access the relevant app config from componentConfig
  const appConfig = componentConfig[appName];
  // Safely access the component based on the view
  const Component = useMemo(() => {
    if (
      view &&
      appConfig &&
      typeof appConfig === "object" &&
      view in appConfig
    ) {
      try {
        return lazy(appConfig[view]);
      } catch (err) {
        console.error("Error loading component:", err);
        return null;
      }
    }
  }, [view, appConfig]);
  // If the component doesn't exist, redirect to the 404 page
  if (!Component) {
    return <Navigate to="/pageNotFound" replace />;
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <Component /> {/* Render the lazy-loaded component */}
    </Suspense>
  );
};

export default React.memo(HandleDynamicView);
