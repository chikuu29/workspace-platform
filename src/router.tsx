import { Navigate, createBrowserRouter, RouteObject } from "react-router";
import { Suspense, lazy } from "react";
import { AppLoader } from "./features/ui/components/Loader/Loader";
import HandleDynamicView from "./utils/app/HandleDynamicView";
import DynamicLayout from "./utils/app/DynamicLayout";

const PageNotFound = lazy(() => import("@/pages/NoPageFound"));
const UnauthorizedAccess = lazy(() => import("@/pages/UnauthorizedAccess"));
const AuthCallback = lazy(() => import("@/features/auth/AuthCallback"));
const AuthLayout = lazy(() => import("@/theme/layouts/auth/auth"));
const SignInPage = lazy(() => import("@/features/auth/signin/SignIn"));
const SignUpPage = lazy(() => import("@/features/auth/signup/SignUp"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/forgot-password/ForgotPassword"));
const WorkspaceLayout = lazy(() => import("@/theme/layouts/workspace"));
const RouterGuard = lazy(() => import("@/core/guards/RouterGuard"));
const PrivateRoute = lazy(() => import("@/contexts/PrivateRoute"));
const MyApps = lazy(() => import("@/features/myApps/MyApps"));
// const Onboarding = lazy(() => import("@/features/auth/Onboarding"));
// const AuthorizePage = lazy(() => import("@/features/auth/oauth/AuthorizePage"));

const WorkspaceProfilePage = lazy(() => import("@/pages/workspace/Profile"));
const WorkspaceSettingsPage = lazy(() => import("@/pages/workspace/Settings"));
const WorkspaceHelpCenterPage = lazy(() => import("@/pages/workspace/HelpCenter"));

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
        <AuthLayout />
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
        path: "forgot-password",
        element: (
          <Suspense fallback={<AppLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
      {
        path: "callback",
        element: <AuthCallback />,
      },
    ],
  },
  // {
  //   path: "onboarding/:request_code/*",
  //   element: (
  //     <Suspense fallback={<AppLoader />}>
  //       <Onboarding />
  //     </Suspense>
  //   ),
  // },
  // {
  //   path: "oauth2",
  //   element: (
  //     <Suspense fallback={<AppLoader />}>
  //       <RouterGuard>
  //         <AuthLayout />
  //       </RouterGuard>
  //     </Suspense>
  //   ),
  //   children: [
  //     {
  //       path: "authorize",
  //       element: <AuthorizePage />,
  //     },
  //   ],
  // },
  {
    path: "/:organization_name/workspace/*", // Multi-organization primary application route
    element: (
      <Suspense fallback={<AppLoader />}>
        <RouterGuard>
          <DynamicLayout />
        </RouterGuard>
      </Suspense>
    ),
    children: [
      {
        path: "profile",
        element: <WorkspaceProfilePage />
      },
      {
        path: "settings",
        element: <WorkspaceSettingsPage />
      },
      {
        path: "helpcenter",
        element: <WorkspaceHelpCenterPage />
      },
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
        <RouterGuard>
          <WorkspaceLayout />
        </RouterGuard>
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
    path: "/unauthorized",
    element: (
      <Suspense fallback={<AppLoader />}>
        <UnauthorizedAccess />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
];

const router = createBrowserRouter(routes);

export default router;
