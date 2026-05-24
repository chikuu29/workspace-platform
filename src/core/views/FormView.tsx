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
        {...buttonProps}
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

interface FormBreadcrumbActionsProps {
  buttons: any[];
  formId: string;
  isEventInProgress: boolean;
  pendingEventName: string | null;
  onActionButtonClick: (button: any) => void;
}

const FormBreadcrumbActions = React.memo(
  ({
    buttons,
    formId,
    isEventInProgress,
    pendingEventName,
    onActionButtonClick,
  }: FormBreadcrumbActionsProps) => (
    <Flex
      gap="2"
      wrap="wrap"
      align="center"
      justify={{ base: "stretch", md: "flex-end" }}
      w="full"
    >
      {buttons.map((btn: any, idx: number) => (
        <FormActionButton
          key={btn.name || idx}
          button={btn}
          idx={idx}
          formId={formId}
          isEventInProgress={isEventInProgress}
          pendingEventName={pendingEventName}
          onActionButtonClick={onActionButtonClick}
          isBreadcrumb={true}
        />
      ))}
    </Flex>
  ),
);

const FormView = ({ config, publishActionsToBreadcrumb = true }: any) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);
  const setBreadcrumbActions = useNavActionStore((s) => s.setActions);
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

  const breadcrumbActions = useMemo(
    () => (
      <FormBreadcrumbActions
        buttons={visibleActionButtons}
        formId={formId}
        isEventInProgress={isEventInProgress}
        pendingEventName={pendingEventName}
        onActionButtonClick={handleActionButtonClick}
      />
    ),
    [
      formId,
      handleActionButtonClick,
      isEventInProgress,
      pendingEventName,
      visibleActionButtons,
    ],
  );

  useEffect(() => {
    if (!publishActionsToBreadcrumb) return;

    if (visibleActionButtons.length === 0) {
      clearBreadcrumbActions();
      return;
    }

    setBreadcrumbActions(breadcrumbActions);
    return () => clearBreadcrumbActions();
  }, [
    breadcrumbActions,
    clearBreadcrumbActions,
    publishActionsToBreadcrumb,
    setBreadcrumbActions,
    visibleActionButtons.length,
  ]);

  if (!tabs.length) return null;
  return (
    <Box position="relative">
      <Box {...layoutStyles}>
        <Box
          mb="3"
          p={{ base: "5", md: "6" }}
          borderTopRadius="3xl"
          border="1px solid"
          borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
          bg={useColorModeValue("white", "app.card.bg")}
          boxShadow={accentGlow}
          position="relative"
          overflow="hidden"
          backdropFilter="blur(18px)"
        >
          <style>{`
            @keyframes float-shape-1 {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(3deg); }
              100% { transform: translateY(0px) rotate(0deg); }
            }
            @keyframes drift-float {
              0% { transform: translate(0, 0) rotate(0deg); }
              33% { transform: translate(6px, -8px) rotate(4deg); }
              66% { transform: translate(-4px, 4px) rotate(-3deg); }
              100% { transform: translate(0, 0) rotate(0deg); }
            }
            @keyframes pulse-scale {
              0% { transform: scale(1); }
              50% { transform: scale(1.12); }
              100% { transform: scale(1); }
            }
            @keyframes rotate-slow {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes sideways-sway {
              0% { transform: translateX(0px); }
              50% { transform: translateX(10px); }
              100% { transform: translateX(0px); }
            }
            @keyframes complex-float {
              0% { transform: translateY(0px) scale(1) rotate(0deg); }
              50% { transform: translateY(-10px) scale(0.95) rotate(-5deg); }
              100% { transform: translateY(0px) scale(1) rotate(0deg); }
            }
            @keyframes shine-pulse {
              0% { transform: scale(1) rotate(0deg); opacity: 0.08; }
              50% { transform: scale(1.25) rotate(15deg); opacity: 0.16; }
              100% { transform: scale(1) rotate(0deg); opacity: 0.08; }
            }
          `}</style>

          {/* Dynamic Concentric Circular Radar Overlay */}
          <Box
            position="absolute"
            right="-20px"
            top="-20px"
            color="app.text.accent/5"
            zIndex={0}
            pointerEvents="none"
            css={{
              animation: "rotate-slow 60s infinite linear",
            }}
          >
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="20" strokeDasharray="40 20" />
              <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="10" strokeDasharray="10 5" />
            </svg>
          </Box>

          {/* Scattered Background Shape Textures */}
          {[
            {
              id: "shield-security",
              path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
              size: 64,
              top: "-10px",
              right: "8%",
              opacity: 0.08,
              animation: "pulse-scale 9s infinite ease-in-out"
            },
            {
              id: "gear-operations",
              path: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
              size: 72,
              bottom: "-20px",
              left: "20%",
              opacity: 0.07,
              animation: "rotate-slow 28s infinite linear"
            },
            {
              id: "computer-terminal",
              path: "M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12m-2 4h20m-3-4v4m-14-4v4",
              size: 56,
              top: "25%",
              left: "4%",
              opacity: 0.08,
              animation: "drift-float 12s infinite ease-in-out"
            },
            {
              id: "database-analytics",
              path: "M12 5c5.52 0 10-1.79 10-4S17.52 1 12 1 2 2.79 2 5s4.48 4 10 4zm0 6c5.52 0 10-1.79 10-4S17.52 7 12 7 2 8.79 2 11s4.48 4 10 4zm0 6c5.52 0 10-1.79 10-4S17.52 13 12 13 2 14.79 2 17s4.48 4 10 4z",
              size: 60,
              bottom: "5px",
              right: "32%",
              opacity: 0.06,
              animation: "float-shape-1 18s infinite ease-in-out"
            },
            {
              id: "key-occupancy",
              path: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l1.5 1.5M15.5 7.5L14 6",
              size: 48,
              top: "-5px",
              left: "38%",
              opacity: 0.09,
              animation: "sideways-sway 14s infinite ease-in-out"
            },
            {
              id: "lock-privacy",
              path: "M19 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2zm-12 0V7a5 5 0 0 1 10 0v4",
              size: 50,
              top: "35%",
              right: "22%",
              opacity: 0.08,
              animation: "complex-float 15s infinite ease-in-out"
            },
            {
              id: "building-block",
              path: "M3 21h18M3 21V8a2 2 0 0 1 2-2h3m10 13V4a2 2 0 0 0-2-2h-3m-6 20V12a2 2 0 0 1 2-2h2m0 0v12",
              size: 68,
              top: "-15px",
              left: "15%",
              opacity: 0.07,
              animation: "drift-float 16s infinite ease-in-out"
            },
            {
              id: "receipt-billing",
              path: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1zm12 4H8m8 4H8m8 4H8",
              size: 54,
              bottom: "-10px",
              right: "5%",
              opacity: 0.08,
              animation: "float-shape-1 10s infinite ease-in-out"
            },
            {
              id: "star-premium",
              path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
              size: 40,
              top: "15%",
              right: "45%",
              opacity: 0.08,
              animation: "shine-pulse 7s infinite ease-in-out"
            },
            {
              id: "chakra-mandala",
              path: "M12 2v20M2 12h20M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
              size: 80,
              bottom: "-30px",
              right: "18%",
              opacity: 0.07,
              animation: "rotate-slow 45s infinite linear"
            },
            {
              id: "code-brackets",
              path: "m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16",
              size: 52,
              top: "45%",
              left: "12%",
              opacity: 0.08,
              animation: "drift-float 11s infinite ease-in-out"
            }
          ].map((shape) => (
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
            <VStack align="stretch" gap={4} flex="1">
              <HStack gap={4} align="center">
                <Box
                  w="4px"
                  h="40px"
                  borderRadius="full"
                  bgGradient="linear(to-b, blue.500, purple.500)"
                  flexShrink={0}
                />
                <VStack align="start" gap={1.5}>
                  <Heading
                    size="lg"
                    fontWeight="900"
                    letterSpacing="tight"
                    color="app.text.primary"
                  >
                    {title}
                  </Heading>
                  <HStack gap={3} flexWrap="wrap">
                    <Badge
                      variant="subtle"
                      colorPalette="blue"
                      size="sm"
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      fontWeight="bold"
                    >
                      Form View
                    </Badge>
                    <Badge
                      variant="outline"
                      size="sm"
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      fontWeight="600"
                      color="gray.500"
                    >
                      {tabs.length} section{tabs.length === 1 ? "" : ""}
                    </Badge>
                    <Badge
                      variant="outline"
                      size="sm"
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      fontWeight="600"
                      color="gray.500"
                    >
                      {totalFields} field{totalFields === 1 ? "" : "s"}
                    </Badge>
                    {config.appMeta?.version && (
                      <Badge
                        variant="subtle"
                        colorPalette="blue"
                        size="sm"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontWeight="bold"
                      >
                        v{config.appMeta.version}
                      </Badge>
                    )}
                    {config.appMeta?.owner && (
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
                    )}
                  </HStack>
                </VStack>
              </HStack>
              {description && (
                <Text
                  fontSize="sm"
                  color="app.text.muted"
                  lineHeight="tall"
                  pl={5}
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
