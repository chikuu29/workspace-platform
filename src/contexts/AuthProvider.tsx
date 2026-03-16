import { ReactNode, useEffect } from "react";
import { Center, VStack } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { login, setLoading } from "../app/slices/auth/authSlice";
import { GETAPI } from "../app/api";
import type { AppDispatch, RootState } from '../app/store';
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAppConfig } from "@/app/slices/appConfig/appConfigSlice";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
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

  return (
    <>
      {isLoading ? (
        <Center w="100vw" h="100vh" bg="bg.default">
          <VStack gap={4}>
            <Skeleton height="40px" width="200px" borderRadius="md" />
            <Skeleton height="20px" width="150px" borderRadius="md" />
          </VStack>
        </Center>
      ) : (
        children
      )}
    </>
  );
};
