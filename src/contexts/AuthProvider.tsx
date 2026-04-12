import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, setLoading } from "../app/slices/auth/authSlice";
import { GETAPI } from "../app/api";
import type { AppDispatch, RootState } from '../app/store';
import { fetchAppConfig } from "@/app/slices/appConfig/appConfigSlice";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  // isLoading/isHydrated consumed by RouterGuard inside the router tree.
  // AuthProvider only needs isHydrated to avoid duplicate fetches.
  const isHydrated = useSelector((state: RootState) => state.auth.isHydrated);

  useEffect(() => {
    const fetchData = async () => {
      try {
        GETAPI({
          path: "/auth/me",
          isPrivateApi: true,
          enableCache: false,
          cacheTTL: 120
        }).subscribe(
          (res: any) => {
            if (res.success) {
              dispatch(login(res));
              dispatch(fetchAppConfig());
            } else {
              dispatch(setLoading(false));
            }
          }
        );
      } catch (error) {
        console.log("Error", error);
        dispatch(setLoading(false));
      }
    };

    if (!isHydrated) {
      fetchData();
    }
  }, [dispatch, isHydrated]);

  // Always render children immediately.
  // The RouterGuard inside the router tree already reads `isLoading` from Redux
  // and shows a full-screen Loader while the session check is in-flight.
  //
  // WHY: Blocking children here means RouterProvider never mounts, so React.lazy
  // routes throw their Suspense promises during a synchronous render pass (the
  // initial mount), which React 18 treats as a fatal error:
  //   "A component suspended while responding to synchronous input."
  // This manifests consistently on Mac/Linux cold starts where Vite has not yet
  // pre-bundled the lazy chunks, but may be hidden on Windows with warm caches.
  return <>{children}</>;
};
