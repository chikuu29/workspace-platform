import React, { memo } from "react";
import GymManagementDashboard from "./GymManagementDashboard";

const GymView = memo(() => <GymManagementDashboard />);

GymView.displayName = "GymView";
export default GymView;
