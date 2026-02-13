import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import { SET_APP_CONFIG_STATE } from "../../app/slices/appConfig/appConfigSlice";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// Custom hook to extract navigation items based on the current path
export const GetNavMenuConfig = () => {
  // console.log("%c===EXECUTE GETNAVCONFIG====", "color:green");
  const dispatch = useDispatch<AppDispatch>();
  // const location = useLocation();
  const appConfig = useSelector((state: RootState) => state.app?.appConfig);
  // const rootPath = location.pathname.split('/')[1];
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || '';
  // Safe access to appConfig and its properties
  const featureItems = () => {
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
      return {
        FEATURE: [],
        DISPLAY_TYPE: {
          SHOW_TOP_NAV_MENU: false,
          SHOW_SIDE_NAV_MENU: false
        }
      };
    }
    return {
      FEATURE: [],
      DISPLAY_TYPE: {
        SHOW_TOP_NAV_MENU: false,
        SHOW_SIDE_NAV_MENU: false
      }
    };
  };
  const loadedFeature: any = featureItems()
  // Dispatch action whenever the path changes
  useEffect(() => {
    // console.log("Loaded", loadedFeature);
    console.log("%c====SET APP_SIDEBAR_CONFIG====", "color:green");
    dispatch(SET_APP_CONFIG_STATE(loadedFeature));
  }, [appName]);
};


export const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
};