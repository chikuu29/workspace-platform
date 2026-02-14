import { Steps, Container } from "@chakra-ui/react";
import LandingPageNavBar from "../../components/navbar/LandingNavBar";
import LandingPageFooter from "../../components/footer/LandingPageFooter";
import FixedPlugin from "../../components/fixedPlugin/FixedPlugin";
import { Outlet } from "react-router";

const LandingLayout: React.FC = () => {
  return (
    <>
      <Container maxW="container.xl">
        <LandingPageNavBar />
        <Outlet />
        <FixedPlugin />
        <LandingPageFooter />
      </Container>
    </>
  );
}

export default LandingLayout;
