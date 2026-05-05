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
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useFormStore } from "../store/useFormStore";
import { ActionEngine } from "../action-engine/ActionEngine";
import { useDispatch, useSelector } from "react-redux";
import { startLoading, stopLoading } from "@/app/slices/loader/appLoaderSlice";
import { useNavigate } from "react-router";
import { useModalStore } from "@/core/store/useModalStore";
import { RootState } from "@/app/store";
import { useBreadcrumbActionsStore } from "@/core/store/useBreadcrumbActionsStore";

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
      {buttons.map((btn: any, idx: number) => {
        const isSubmit = btn.event === "submit";
        const customStyles = btn?.styles || {};
        const defaultShadow = isSubmit
          ? "0 12px 24px -18px rgba(59, 130, 246, 0.8)"
          : "0 12px 22px -20px rgba(15, 23, 42, 0.35)";

        return (
          <Button
            key={btn.name || idx}
            onClick={isSubmit ? undefined : () => onActionButtonClick(btn)}
            type={isSubmit ? "submit" : "button"}
            form={isSubmit ? formId : undefined}
            size="sm"
            loading={isEventInProgress && pendingEventName === btn.event}
            disabled={isEventInProgress}
            borderRadius={customStyles.borderRadius || "sm"}
            minW={{ base: "full", sm: "120px", md: "auto" }}
            justifyContent="center"
            gap="2"
            variant={customStyles.variant || (isSubmit ? "solid" : "subtle")}
            colorPalette={customStyles.colorPalette || (isSubmit ? "blue" : "gray")}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: customStyles.boxShadow || defaultShadow,
              ...customStyles._hover,
            }}
            {...customStyles}
          >
            {btn.iconName && <AsyncLoadIcon iconName={btn.iconName} />}
            <Text fontWeight="inherit" whiteSpace="nowrap">
              {btn.text}
            </Text>
          </Button>
        );
      })}
    </Flex>
  ),
);

const FormView = ({ config, publishActionsToBreadcrumb = true }: any) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);
  const setBreadcrumbActions = useBreadcrumbActionsStore((s) => s.setActions);
  const clearBreadcrumbActions = useBreadcrumbActionsStore((s) => s.clearActions);
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
        iconName: "LuSave",
        event: "submit",
        position: "top",
        styles: {
          variant: "action",
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
          borderColor={borderColor}
          bg={"app.card.bg"}
          boxShadow={accentGlow}
          position="relative"
          overflow="hidden"
          backdropFilter="blur(18px)"
        >
          <Box
            position="absolute"
            inset="-40% auto auto 70%"
            w={{ base: "180px", md: "260px" }}
            h={{ base: "180px", md: "260px" }}
            borderRadius="full"
            bg="rgba(59,130,246,0.14)"
            filter="blur(40px)"
            pointerEvents="none"
          />
          <Flex
            direction={{ base: "column", xl: "row" }}
            justify="space-between"
            align="stretch"
            gap="6"
            position="relative"
            zIndex={1}
          >
            <VStack align="stretch" gap="5" flex="1">
              <HStack gap="3" flexWrap="wrap">
                <Badge
                  colorPalette="blue"
                  px="3.5"
                  py="1.5"
                  rounded="full"
                  textTransform="uppercase"
                  fontSize="10px"
                  letterSpacing="widest"
                  bg={metaBg}
                  color="app.text.accent"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  Form View
                </Badge>
                <Badge
                  variant="outline"
                  px="3.5"
                  py="1.5"
                  rounded="full"
                  fontSize="xs"
                  color="app.text.muted"
                  borderColor={borderColor}
                >
                  {tabs.length} section{tabs.length === 1 ? "" : "s"}
                </Badge>
                <Badge
                  variant="outline"
                  px="3.5"
                  py="1.5"
                  rounded="full"
                  fontSize="xs"
                  color="app.text.muted"
                  borderColor={borderColor}
                >
                  {totalFields} field{totalFields === 1 ? "" : "s"}
                </Badge>
              </HStack>

              <VStack gap="2" align="start" maxW="3xl">
                <Heading
                  size={{ base: "xl", md: "2xl" }}
                  fontWeight="extrabold"
                  letterSpacing="tight"
                  color={headingColor}
                >
                  {title}
                </Heading>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color="app.text.muted"
                  lineHeight="tall"
                  maxW="2xl"
                >
                  {description}
                </Text>
              </VStack>
            </VStack>
            {visibleActionButtons.length > 0 && !publishActionsToBreadcrumb && (
              <Box
                w={{ base: "full", xl: "auto" }}
                minW={{ xl: "320px" }}
                p="3"
                borderRadius="2xl"
                // bg={headerPanelBg}
                border="1px solid"
                borderColor={borderColor}
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
                    {visibleActionButtons.map((btn: any, idx: number) => {
                      const isSubmit = btn.event === "submit";
                      const customStyles = btn?.styles || {};
                      const defaultShadow = isSubmit
                        ? "0 16px 30px -18px rgba(59, 130, 246, 0.7)"
                        : "0 14px 28px -22px rgba(15, 23, 42, 0.35)";

                      return (
                        <Button
                          key={btn.name || idx}
                          onClick={
                            isSubmit
                              ? undefined
                              : () => handleActionButtonClick(btn)
                          }
                          type={isSubmit ? "submit" : "button"}
                          form={isSubmit ? formId : undefined}
                          size={'md'}
                          loading={
                            isEventInProgress && pendingEventName === btn.event
                          }
                          disabled={isEventInProgress}
                          // h={customStyles.h || "54px"}
                          // minH="54px"
                          // px={customStyles.px || "6"}
                          borderRadius={customStyles.borderRadius || "sm"}
                          // fontWeight="700"
                          // letterSpacing="0.01em"
                          flex={{
                            base: "1 1 100%",
                            sm: "1 1 calc(50% - 0.375rem)",
                            xl: "0 0 auto",
                          }}
                          minW={{ xl: "160px" }}
                          justifyContent="center"
                          gap="2.5"

                          variant={
                            customStyles.variant ||
                            (isSubmit ? "solid" : "subtle")
                          }
                          colorPalette={
                            customStyles.colorPalette ||
                            (isSubmit ? "blue" : "gray")
                          }
                          // boxShadow={customStyles.boxShadow || defaultShadow}
                          _hover={{
                            transform: "translateY(-1px)",
                            boxShadow: customStyles.boxShadow || defaultShadow,
                            ...customStyles._hover,
                          }}
                          {...customStyles}
                        >
                          {btn.iconName && (
                            // <Box
                            //   display="inline-flex"
                            //   alignItems="center"
                            //   justifyContent="center"
                            //   boxSize="4"
                            // >
                            <AsyncLoadIcon iconName={btn.iconName} />

                            // </Box>
                          )}
                          <Text fontWeight="inherit">{btn.text}</Text>
                        </Button>
                      );
                    })}
                  </Flex>
                </VStack>
              </Box>
            )}

          </Flex>
        </Box>

        <Box
          // rounded="3xl"
          borderBottomRadius={"3xl"}
          shadow={accentGlow}
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          backdropFilter="blur(14px)"
          position="relative"
          // bg={cardBg}
          bg={"app.card.bg"}
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
