import { useEffect, useState, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router"
import ViewRenderer from "./renderer/ViewRenderer"
import { GETAPI } from "@/app/api"
import { Box, Container, HStack, Stack, VStack } from "@chakra-ui/react"
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton"

const LoadingState = () => (
    <Container maxW="6xl" py={10}>
        <VStack gap={8} align="stretch">
            <HStack gap={4}>
                <SkeletonCircle size="12" />
                <VStack align="stretch" flex="1" gap={2}>
                    <Skeleton height="6" width="30%" />
                    <Skeleton height="4" width="20%" />
                </VStack>
            </HStack>
            <Stack gap={6}>
                <Skeleton height="300px" borderRadius="xl" />
                <SkeletonText noOfLines={6} gap={4} />
                <Box pt={4}>
                    <Skeleton height="200px" borderRadius="xl" />
                </Box>
            </Stack>
        </VStack>
    </Container>
)

const WorkspacePage = () => {
    console.log("========WorkspacePage========s")
    const { tenant, appCode, view: UITemplateID } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const appParam = searchParams.get("app")

    const app = useMemo(() => appCode || appParam, [appCode, appParam])
    const [config, setConfig] = useState(null)

    useEffect(() => {
        const getUITemplate = async () => {
            GETAPI({
                path: `app/ui_template`,
                params: {
                    pageName: UITemplateID,
                    appName: app
                },
                isPrivateApi: true,
                enableCache: false,
            }).subscribe(async (res: any) => {
                if (res.success && res["result"].length > 0) {
                    setConfig(res["result"][0]);
                } else {
                    // Redirect to 404 if template not found
                    navigate("/404", { replace: true })
                }
            });
        };

        if (UITemplateID && app) {
            getUITemplate();
        }
    }, [UITemplateID, app, navigate]);

    if (!config) return <LoadingState />

    return <ViewRenderer config={config} />
}

export default WorkspacePage
