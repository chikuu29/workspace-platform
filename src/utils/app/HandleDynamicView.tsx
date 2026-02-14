import { useLocation, useParams, useSearchParams } from "react-router";
import { lazy, Suspense, useMemo } from "react";
import { Navigate } from "react-router";
import { AppLoader } from "@/features/ui/components/Loader/Loader";
import componentConfig from "@/componentConfig"; // Adjust the path accordingly
import React from "react";

const HandleDynamicView = () => {
  console.log("===HANDLE DYNAMIC VIEW===");
  const { view, secondaryView } = useParams(); // Access the `view` and `params` from the URL
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "Default";

  const appConfig = componentConfig[appName];
  console.log("===APP CONFIG===", appConfig);


  // Safely access the component based on the view
  const Component = useMemo(() => {
    if (
      !secondaryView &&
      view &&
      appConfig &&
      typeof appConfig === "object" &&
      view in appConfig
    ) {
      try {
        console.log("===VIEW===", appConfig[view]);
        return lazy(appConfig[view]);
      } catch (err) {
        console.error("Error loading component:", err);
        return null;
      }
    } else if (
      secondaryView &&
      view &&
      appConfig &&
      typeof appConfig === "object" &&
      secondaryView in appConfig
    ) {

      try {
        return lazy(appConfig[secondaryView]);
      } catch (err) {
        console.error("Error loading component:", err);
        return null;
      }
    }
  }, [view, secondaryView, appConfig]);
  // If the component doesn't exist, redirect to the 404 page


  if (!Component) {
    // Fallback to Universal WorkspacePage
    const WorkspacePage = lazy((componentConfig["Default"] as any)["workspacePage"]);
    return (
      <Suspense fallback={<AppLoader />}>
        <WorkspacePage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppLoader />} key={`${appName}-${view}-${secondaryView || "default"}`}>
      <Component /> {/* Render the lazy-loaded component */}
    </Suspense>
  );
};

export default React.memo(HandleDynamicView);
