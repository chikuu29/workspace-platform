import MyTable from "@/features/ui/components/Tables/MyTables";


import RevenuAnalytics from "./RevenuAnalytics";

export default function GymView(params: any) {
  console.log("===CALLING GYMVIEW===", params);
  return (
    <>

      <RevenuAnalytics />

      {/* <ResponsiveTable></ResponsiveTable> */}

      <MyTable></MyTable>

      {/* <GymRecord></GymRecord> */}

    </>
  );
}
