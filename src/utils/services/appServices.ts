import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router";
import { AppDispatch, RootState } from "../../app/store";
import { SET_APP_CONFIG_STATE } from "../../app/slices/appConfig/appConfigSlice";
import { useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

// Custom hook to extract navigation items based on the current path
export const GetNavMenuConfig = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appCode } = useParams();
  const appConfig = useSelector((state: RootState) => state.app?.appConfig);
  const [searchParams] = useSearchParams();
  const appParam = searchParams.get("app");

  const appName = useMemo(() => appCode || appParam || "", [appCode, appParam]);

  // Safe access to appConfig and its properties
  const loadedFeature = useMemo(() => {
    if (appConfig && appConfig.config && appConfig.config.featueListBaseOnURL) {
      const feature: any = appConfig.config.featueListBaseOnURL[appName];
      if (feature) {
        const {
          MENU: FEATURE = [],
          SHOW_TOP_NAV_MENU = false,
          SHOW_SIDE_NAV_MENU = false
        } = feature;
        return {
          FEATURE,
          DISPLAY_TYPE: {
            SHOW_TOP_NAV_MENU,
            SHOW_SIDE_NAV_MENU
          }
        };
      }
    }
    return {
      FEATURE: [],
      DISPLAY_TYPE: {
        SHOW_TOP_NAV_MENU: false,
        SHOW_SIDE_NAV_MENU: false
      }
    };
  }, [appConfig, appName]);

  // Dispatch action whenever the loaded feature changes
  useEffect(() => {
    console.log("%c====SET APP_SIDEBAR_CONFIG====", "color:green", appName);
    dispatch(SET_APP_CONFIG_STATE(loadedFeature));
  }, [dispatch, loadedFeature, appName]);
};


export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
};