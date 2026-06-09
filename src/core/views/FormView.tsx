import React, { useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { UIEngine } from "../renderer/UIEngine";
import "../widgets";
import AsyncLoadIcon from "@/core/utils/hooks/AsyncLoadIcon";
import { useFormStore } from "../store/useFormStore";
import { ActionEngine } from "../action-engine/ActionEngine";
import { useDispatch, useSelector } from "react-redux";
import { startLoading, stopLoading } from "@/app/slices/loader/appLoaderSlice";
import { useNavigate } from "react-router";
import { useModalStore } from "@/core/store/useModalStore";
import { RootState } from "@/app/store";
import { useNavActionStore } from "@/core/store/useNavActionStore";

interface FormActionButtonProps {
  button: any;
  idx: number;
  formId: string;
  isEventInProgress: boolean;
  pendingEventName: string | null;
  onActionButtonClick: (button: any) => void;
  isBreadcrumb?: boolean;
}

const FormActionButton = React.memo(
  ({
    button,
    idx,
    formId,
    isEventInProgress,
    pendingEventName,
    onActionButtonClick,
    isBreadcrumb = false,
  }: FormActionButtonProps) => {
    const isSubmit = button.event === "submit";
    const customStyles = button?.styles || {};

    const defaultShadow = isBreadcrumb
      ? isSubmit
        ? "0 12px 24px -18px rgba(59, 130, 246, 0.8)"
        : "0 12px 22px -20px rgba(15, 23, 42, 0.35)"
      : isSubmit
        ? "0 16px 30px -18px rgba(59, 130, 246, 0.7)"
        : "0 14px 28px -22px rgba(15, 23, 42, 0.35)";

    const handleClick = useCallback(() => {
      if (!isSubmit) {
        onActionButtonClick(button);
      }
    }, [isSubmit, onActionButtonClick, button]);

    const buttonProps = isBreadcrumb
      ? {
        minW: { base: "full", sm: "120px", md: "auto" },
      }
      : {
        flex: {
          base: "1 1 100%",
          sm: "1 1 calc(50% - 0.375rem)",
          xl: "0 0 auto",
        },
        minW: { xl: "160px" },
      };

    return (
      <Button
        onClick={isSubmit ? undefined : handleClick}
        type={isSubmit ? "submit" : "button"}
        form={isSubmit ? formId : undefined}
        size="md"
        h="40px"
        px={6}
        loading={isEventInProgress && pendingEventName === button.event}
        disabled={isEventInProgress}
        borderRadius={customStyles.borderRadius || "sm"}
        justifyContent="center"
        gap="2"
        variant={customStyles.variant || (isSubmit ? "solid" : "subtle")}
        colorPalette={customStyles.colorPalette || (isSubmit ? "blue" : "gray")}
        _hover={{
          transform: "translateY(-1px)",
          boxShadow: customStyles.boxShadow || defaultShadow,
          ...customStyles._hover,
        }}

        // {...buttonProps}
        {...customStyles}
      >
        {button.iconName && <AsyncLoadIcon iconName={button.iconName} />}
        <Text fontWeight="inherit" whiteSpace="nowrap">
          {button.text}
        </Text>
      </Button>
    );
  },
);



const FormView = ({ config, publishActionsToBreadcrumb = true }: any) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);
  const setNavActionConfig = useNavActionStore((s) => s.setNavActionConfig);
  const clearBreadcrumbActions = useNavActionStore((s) => s.clearActions);
  const organizationName = useSelector(
    (state: RootState) => state.organizations?.organization?.name ?? "GHOST_ORG"
  );

  const layoutStyles = config?.UI_TYPE?.layoutStyles || {};
  const borderColor = useColorModeValue(
    "rgba(99, 102, 241, 0.16)",
    "rgba(255, 255, 255, 0.08)",
  );
  const headingColor = useColorModeValue(
    "app.text.primary",
    "app.text.primary",
  );

  const metaBg = useColorModeValue(
    "rgba(255,255,255,0.7)",
    "rgba(255,255,255,0.05)",
  );
  const accentGlow = useColorModeValue(
    "0 24px 60px -36px rgba(59, 130, 246, 0.42)",
    "0 24px 60px -40px rgba(2, 6, 23, 0.85)",
  );
  const tabs = useMemo(
    () => config?.UI_VIEW?.schema?.forms?.tabs || [],
    [config],
  );

  const actionEventConfig = useMemo(
    () => config?.ACTIONS?.events || {},
    [config],
  );

  const actionButtons = useMemo(() => {
    const buttons =
      config?.ACTIONS?.ACTION_BUTTONS || config?.ACTIONS?.BUTTONS || [];
    const showSave = config?.ACTIONS?.showSaveButton;

    if (showSave) {
      const submitButton = {
        name: "save_submit_generated",
        text: "Save",
        iconName: "CloudCheck",
        event: "submit",
        position: "top",
        styles: {
          variant: "solid",
          bg: "gradient_blue"
        },
      };
      return [...buttons, submitButton];
    }

    return buttons;
  }, [config]);

  const [isEventInProgress, setIsEventInProgress] = React.useState(false);
  const [pendingEventName, setPendingEventName] = React.useState<string | null>(
    null,
  );
  const formId = React.useId();
  const title = config?.UI_TYPE?.title || "Information Portal";
  const description =
    config?.UI_TYPE?.description ||
    "Complete the form details and use the actions panel to save or trigger related events.";
  const visibleActionButtons = useMemo(
    () => actionButtons.filter((button: any) => !button?.hidden),
    [actionButtons],
  );
  const totalFields = useMemo(
    () =>
      tabs.reduce(
        (count: number, tab: any) => count + (tab?.widgets?.length || 0),
        0,
      ),
    [tabs],
  );

  const executeFormEvent = useCallback(
    async (eventName: string, payload: any) => {
      console.log("Executing form event:", eventName, payload);
      if (isEventInProgress) {
        return {
          success: false,
          message: "Please wait, an action is already in progress.",
        };
      }

      setIsEventInProgress(true);
      setPendingEventName(eventName);
      dispatch(startLoading(`Processing ${eventName}...`));
      console.log("actionEventConfig:", actionEventConfig);

      try {
        const actionToExecute = actionEventConfig?.[eventName];
        if (!actionToExecute) {
          console.warn(`No action configuration found for event: ${eventName}`);
          return { success: false, message: `No action config for '${eventName}'` };
        }

        const actionContext = {
          navigate,
          openModal,
          organizationName,
          payload,
        };

        await ActionEngine.execute(actionToExecute, actionContext);
        return { success: true };
      } catch (error) {
        console.error("ActionEngine Execution Error", error);
        return { success: false, error };
      } finally {
        setIsEventInProgress(false);
        setPendingEventName(null);
        dispatch(stopLoading());
      }
    },
    [actionEventConfig, dispatch, isEventInProgress, navigate, openModal, organizationName],
  );

  const handleFormSubmit = useCallback(
    async (data: any) => {
      console.log("Form submitted:", data);

      if (isEventInProgress) return;
      await executeFormEvent("submit", data);
    },
    [executeFormEvent, isEventInProgress],
  );

  const handleActionButtonClick = useCallback(
    async (button: any) => {
      console.log("Form button clicked:", button.name);

      if (!button?.event || button.event === "submit" || isEventInProgress)
        return;

      await executeFormEvent(button.event, useFormStore.getState().values);
    },
    [executeFormEvent, isEventInProgress],
  );

  const navActionsConfig = useMemo(() => {
    return visibleActionButtons.map((btn: any, idx: number) => {
      const isSubmit = btn.event === "submit";
      const customStyles = btn?.styles || {};

      const defaultShadow = isSubmit
        ? "0 12px 24px -18px rgba(59, 130, 246, 0.8)"
        : "0 12px 22px -20px rgba(15, 23, 42, 0.35)";

      return {
        id: btn.name || `btn-${idx}`,
        label: btn.text,
        icon: btn.iconName ? <AsyncLoadIcon iconName={btn.iconName} /> : undefined,
        onClick: isSubmit ? undefined : () => handleActionButtonClick(btn),
        type: isSubmit ? "submit" : "button",
        form: isSubmit ? formId : undefined,
        loading: isEventInProgress && pendingEventName === btn.event,
        disabled: isEventInProgress,
        borderRadius: customStyles.borderRadius || "sm",
        variant: customStyles.variant || (isSubmit ? "solid" : "subtle"),
        colorPalette: customStyles.colorPalette || (isSubmit ? "blue" : "gray"),
        _hover: {
          transform: "translateY(-1px)",
          boxShadow: customStyles.boxShadow || defaultShadow,
          ...customStyles._hover,
        },
        ...customStyles,
      };
    });
  }, [
    visibleActionButtons,
    formId,
    isEventInProgress,
    pendingEventName,
    handleActionButtonClick,
  ]);

  useEffect(() => {
    if (!publishActionsToBreadcrumb) return;

    if (visibleActionButtons.length === 0) {
      clearBreadcrumbActions();
      return;
    }

    setNavActionConfig(navActionsConfig);
    return () => clearBreadcrumbActions();
  }, [
    navActionsConfig,
    clearBreadcrumbActions,
    publishActionsToBreadcrumb,
    setNavActionConfig,
    visibleActionButtons.length,
  ]);

  if (!tabs.length) return null;
  return (
    <Box position="relative">
      <Box {...layoutStyles}>
        <Box
          mb="3"
          p={{ base: "4", md: "5" }}
          borderTopRadius="3xl"
          border="1px solid"
          borderColor={useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)")}
          bg={useColorModeValue("rgba(255, 255, 255, 0.75)", "rgba(15, 23, 42, 0.65)")}
          boxShadow={accentGlow}
          position="relative"
          overflow="hidden"
          backdropFilter="blur(20px)"
        >
          <style>{`
            @keyframes rotate-slow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pulse-scale {
              0% { transform: scale(1); }
              50% { transform: scale(1.08); }
              100% { transform: scale(1); }
            }
            @keyframes float-shape-1 {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-6px) rotate(2deg); }
              100% { transform: translateY(0px) rotate(0deg); }
            }
          `}</style>

          {/* Dynamic Concentric Circular Radar Overlay */}
          <Box
            position="absolute"
            right="-30px"
            top="-30px"
            color={useColorModeValue("blue.500/4", "blue.400/4")}
            zIndex={0}
            pointerEvents="none"
            css={{
              animation: "rotate-slow 80s infinite linear",
            }}
          >
            <svg width="240" height="240" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="8" strokeDasharray="24 12" />
              <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="4" strokeDasharray="8 4" />
              <circle cx="100" cy="100" r="20" stroke="currentColor" strokeWidth="2" />
            </svg>
          </Box>

          {/* Scattered Background Shape Textures */}
          {([
            {
              id: "shield-security",
              path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
              size: 56,
              top: "-5px",
              right: "25%",
              opacity: 0.03,
              animation: "pulse-scale 12s infinite ease-in-out"
            },
            {
              id: "database-analytics",
              path: "M12 5c5.52 0 10-1.79 10-4S17.52 1 12 1 2 2.79 2 5s4.48 4 10 4zm0 6c5.52 0 10-1.79 10-4S17.52 7 12 7 2 8.79 2 11s4.48 4 10 4zm0 6c5.52 0 10-1.79 10-4S17.52 13 12 13 2 14.79 2 17s4.48 4 10 4z",
              size: 52,
              bottom: "8px",
              right: "42%",
              opacity: 0.03,
              animation: "float-shape-1 16s infinite ease-in-out"
            },
            {
              id: "chakra-mandala",
              path: "M12 2v20M2 12h20M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
              size: 84,
              bottom: "-20px",
              right: "8%",
              opacity: 0.04,
              animation: "rotate-slow 60s infinite linear"
            }
          ] as Array<{ id: string; path: string; size: number; top?: string; left?: string; right?: string; bottom?: string; opacity: number; animation: string }>).map((shape) => (
            <Box
              key={shape.id}
              position="absolute"
              top={shape.top}
              left={shape.left}
              right={shape.right}
              bottom={shape.bottom}
              width={`${shape.size}px`}
              height={`${shape.size}px`}
              opacity={shape.opacity}
              color={useColorModeValue("blue.600", "purple.300")}
              pointerEvents="none"
              zIndex={0}
              css={{
                animation: shape.animation,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={shape.path} />
              </svg>
            </Box>
          ))}

          <Flex
            direction={{ base: "column", xl: "row" }}
            justify="space-between"
            align={{ base: "stretch", xl: "center" }}
            gap="6"
            position="relative"
            zIndex={1}
          >
            <VStack align="stretch" gap={3} flex="1">
              <VStack align="start" gap={2}>
                <Heading
                  size="lg"
                  fontWeight="900"
                  letterSpacing="tight"
                  color="app.text.primary"
                >
                  {title}
                </Heading>

                <HStack gap={2} flexWrap="wrap">
                  <Badge
                    bg={useColorModeValue("blue.500/10", "blue.500/15")}
                    color={useColorModeValue("blue.600", "blue.400")}
                    border="1px solid"
                    borderColor={useColorModeValue("blue.500/20", "blue.500/30")}
                    size="sm"
                    borderRadius="md"
                    px={2.5}
                    py={0.5}
                    fontWeight="bold"
                  >
                    Form View
                  </Badge>
                  <Badge
                    bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                    color={useColorModeValue("gray.600", "gray.400")}
                    border="1px solid"
                    borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                    size="sm"
                    borderRadius="md"
                    px={2.5}
                    py={0.5}
                    fontWeight="600"
                  >
                    {tabs.length} section{tabs.length === 1 ? "" : "s"}
                  </Badge>
                  <Badge
                    bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                    color={useColorModeValue("gray.600", "gray.400")}
                    border="1px solid"
                    borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                    size="sm"
                    borderRadius="md"
                    px={2.5}
                    py={0.5}
                    fontWeight="600"
                  >
                    {totalFields} field{totalFields === 1 ? "" : "s"}
                  </Badge>
                  {config.appMeta?.version && (
                    <Badge
                      bg={useColorModeValue("purple.500/10", "purple.500/15")}
                      color={useColorModeValue("purple.600", "purple.400")}
                      border="1px solid"
                      borderColor={useColorModeValue("purple.500/20", "purple.500/30")}
                      size="sm"
                      borderRadius="md"
                      px={2.5}
                      py={0.5}
                      fontWeight="bold"
                    >
                      v{config.appMeta.version}
                    </Badge>
                  )}
                  {/* {config.appMeta?.owner && (
                    <HStack gap={1.5} align="center" color="gray.500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ display: "inline-block" }}
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <Text fontSize="xs" fontWeight="600">
                        Owner: {config.appMeta.owner}
                      </Text>
                    </HStack>
                  )} */}
                </HStack>
              </VStack>

              {description && (
                <Text
                  fontSize="sm"
                  color="app.text.muted"
                  lineHeight="tall"
                  maxW="3xl"
                >
                  {description}
                </Text>
              )}
            </VStack>

            {visibleActionButtons.length > 0 && !publishActionsToBreadcrumb && (
              <Box
                w={{ base: "full", xl: "auto" }}
                minW={{ xl: "320px" }}
                p="3"
                borderRadius="2xl"
                border="1px solid"
                borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                backdropFilter="blur(14px)"
                display="flex"
                alignItems="stretch"
              >
                <VStack align="stretch" gap="3" justify="center" w="full">
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="widest"
                    color="app.text.muted"
                    px="2"
                  >
                    Actions
                  </Text>
                  <Flex
                    gap="3"
                    wrap="wrap"
                    align="stretch"
                    justify={{
                      base: "stretch",
                      md: "flex-start",
                      xl: "flex-end",
                    }}
                  >
                    {visibleActionButtons.map((btn: any, idx: number) => (
                      <FormActionButton
                        key={btn.name || idx}
                        button={btn}
                        idx={idx}
                        formId={formId}
                        isEventInProgress={isEventInProgress}
                        pendingEventName={pendingEventName}
                        onActionButtonClick={handleActionButtonClick}
                        isBreadcrumb={false}
                      />
                    ))}
                  </Flex>
                </VStack>
              </Box>
            )}

          </Flex>
        </Box>

        <Box
          borderBottomRadius={"3xl"}
          shadow={accentGlow}
          border="1px solid"
          borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
          overflow="hidden"
          backdropFilter="blur(14px)"
          position="relative"
          bg={useColorModeValue("white", "app.card.bg")}
        >
          <Box
            h="1px"
            bgGradient="to-r"
            gradientFrom="transparent"
            gradientVia="blue.400"
            gradientTo="transparent"
            opacity="0.7"
          />
          <UIEngine
            config={tabs}
            tabs={tabs}
            onSubmit={handleFormSubmit}
            formId={formId}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default FormView;
