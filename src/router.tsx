import { AuthProvider } from "./contexts/AuthProvider";
import { Navigate, createBrowserRouter, RouteObject } from "react-router";
import { Suspense, lazy } from "react";
import { AppLoader } from "./features/ui/components/Loader/Loader";
import HandleDynamicView from "./utils/app/HandleDynamicView";
import DynamicLayout from "./utils/app/DynamicLayout";

const PageNotFound = lazy(() => import("./pages/NoPageFound"));
const AuthCallback = lazy(() => import("@/features/auth/AuthCallback"));
const AuthError = lazy(() => import("@/features/auth/AuthError"));
const AuthLayout = lazy(() => import("@/theme/layouts/auth/auth"));
const SignInPage = lazy(() => import("@/features/auth/signin/SignIn"));
const SignUpPage = lazy(() => import("@/features/auth/signup/SignUp"));
const WorkspaceLayout = lazy(() => import("@/theme/layouts/workspace"));
const PrivateRoute = lazy(() => import("@/contexts/PrivateRoute"));
const MyApps = lazy(() => import("@/features/myApps/MyApps"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: <Navigate to="login" replace />,
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
        path: "login",
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
        path: "error",
        element: <AuthError />,
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
    path: "/:tenant_name/workspace/*", // Multi-tenant base route
    element: (
      <Suspense fallback={<AppLoader />}>
        <AuthProvider>
          <PrivateRoute>
            <DynamicLayout />
            {/* <WorkspaceLayout /> */}
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
        path: "app/:appCode",
        element: <HandleDynamicView />,
        children: [
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
            <WorkspaceLayout />
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
    element: <PageNotFound />,
  },
];

const router = createBrowserRouter(routes);

export default router;
