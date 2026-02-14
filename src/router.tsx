import { AuthProvider } from "./contexts/AuthProvider";
import { Navigate, createBrowserRouter, RouteObject } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AppLoader } from "./features/ui/components/Loader/Loader";
import HandleDynamicView from "./utils/app/HandleDynamicView";

const AuthCallback = lazy(() => import("@/features/auth/AuthCallback"));
const AuthLayout = lazy(() => import("@/features/ui/layouts/auth/auth"));
const SignInPage = lazy(() => import("@/features/auth/signin/SignIn"));
const SignUpPage = lazy(() => import("@/features/auth/signup/SignUp"));
const PanelLayout = lazy(() => import("@/features/ui/layouts/dashboard/dash"));
const PrivateRoute = lazy(() => import("@/contexts/PrivateRoute"));
const MyApps = lazy(() => import("@/features/myApps/MyApps"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: <Navigate to="sign-in" replace />,
  },
  {
    path: "/auth/*",
    element: (
      <Suspense fallback={<AppLoader />}>
        <AuthProvider>
          <AuthLayout />
        </AuthProvider>
      </Suspense>
    ),
    children: [
      {
        path: "sign-in",
        element: (
          <Suspense fallback={<AppLoader />}>
            <SignInPage />
          </Suspense>
        ),
      },
      {
        path: "sign-up",
        element: (
          <Suspense fallback={<AppLoader />}>
            <SignUpPage />
          </Suspense>
        ),
      },
      {
        path: "callback",
        element: <AuthCallback />,
      },
      {
        path: "getstarted",
        element: (
          <Suspense fallback={<AppLoader />}>
            <SignInPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/:tenant_name/app/*", // Multi-tenant base route
    element: (
      <Suspense fallback={<AppLoader />}>
        <AuthProvider>
          <PrivateRoute>
            <PanelLayout />
          </PrivateRoute>
        </AuthProvider>
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: <HandleDynamicView />,
      },
      {
        path: ":view/*",
        element: <HandleDynamicView />,
        children: [
          {
            path: ":params/*",
            element: <HandleDynamicView />,
          },
        ],
      },
    ],
  },
  {
    path: "/myApps",
    element: (
      <Suspense fallback={<AppLoader />}>
        <AuthProvider>
          <PrivateRoute>
            <PanelLayout />
          </PrivateRoute>
        </AuthProvider>
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: <MyApps />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/pageNotFound" replace />,
  },
];

const router = createBrowserRouter(routes);

export default router;
