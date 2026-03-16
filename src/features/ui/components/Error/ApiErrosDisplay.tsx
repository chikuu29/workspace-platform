import { useState, useEffect } from "react";
import {
    Box,
    Text,
    IconButton,
    Icon,
    DialogRoot,
    DialogBackdrop,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogBody,
} from "@chakra-ui/react";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { AiTwotoneCloseCircle } from "react-icons/ai";
import { TbLockAccess } from "react-icons/tb";

import { List } from "@chakra-ui/react";

const APIErrorScreen = (props: any) => {
    // Extract error message and query fields from the error details
    console.log("Calling OAuthErrorScreen", props);
    const { errors, setErrors, ...rest } = props;
    const { error, message } = errors.data;
    // const [errors, setErrors] = useState<string | null>(null);
    const [errorList, setErrorList] = useState<any[]>([]);

    useEffect(() => {
        if (error) {
            const errorFields = error.query || error.body
            console.log(errorFields);

            const errorMessages = Object.keys(errorFields || {}).map((key) => ({
                field: key,
                message: errorFields[key].msg || "Unknown error",
            }));
            // setErrors(`Authentication failed due to: ${message}`);

            setErrorList(errorMessages);
        }
    }, [errors]);

    const handleRetry = () => {

        setErrors(null); // Clear previous error
        setErrorList([]); // Clear previous error details

    };

    return (
        <DialogRoot open={true}>
            <DialogBackdrop />
            <DialogContent className="dialog-container">
                <DialogHeader className="dialog-header">
                    <Icon as={TbLockAccess} boxSize={6} color="red" />
                    <DialogTitle>OAuth Authentication Failed</DialogTitle>
                </DialogHeader>

                <Text color="gray.500" fontSize="sm" textAlign="center">
                    {message ||
                        "An error occurred while trying to authenticate your account."}
                </Text>
                <DialogBody className="dialog-body">
                    {/* Error details */}
                    {errorList.length > 0 && (
                        <Box
                            p={4}
                            mt={4}
                            border="1px solid"
                            borderColor="red.300"
                            // bg="red.50"
                            borderRadius="md"
                            textAlign="left"
                        >
                            <Text color="red.600" fontWeight="bold" mb={2}>
                                {message}
                            </Text>
                            <List.Root>
                                {errorList.map((error, index) => (
                                    <List.Item key={index}>
                                        <List.Indicator asChild colorPalette="green.500">
                                            <AiTwotoneCloseCircle color="red" />
                                        </List.Indicator>
                                        {`${error.field} - ${error.message}`}
                                    </List.Item>
                                ))}
                            </List.Root>
                        </Box>
                    )}
                </DialogBody>
                {/* <Text color="gray.500" fontSize="sm" textAlign="center">
          If the issue persists, please contact support or try again after some
          time.
        </Text> */}

                <DialogFooter className="dialog-footer">
                    <IconButton
                        variant={"solid"}
                        w={"100%"}
                        colorScheme="red"
                        onClick={handleRetry}
                    >
                        <IoShieldCheckmarkOutline />
                        Retry Authentication
                    </IconButton>
                </DialogFooter>
            </DialogContent>
            {/* CSS for Additional Styling */}
            <style>{`
        .dialog-container {
          text-align: center;
          border-radius: 12px;
          // padding: 20px;
          max-width: 400px;
        
        }
        
        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 20px;
          font-weight: bold;
          // color: #2d3748;
        }

       

        

        
      `}</style>
        </DialogRoot>
    );
};

export default APIErrorScreen;