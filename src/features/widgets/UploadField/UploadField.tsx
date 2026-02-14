import {
  Steps,
  Box,
  Button,
  Flex,
  Input,
  useDisclosure,
  Table,
  Image,
  IconButton,
  Text,
  VStack,
  HStack,
  Heading,
  Field,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import React from "react";
import { useRef, useState } from "react";
import { FieldError, useFormContext } from "react-hook-form";
import {
  FaCamera,
  FaTimes,
  FaDownload,
  FaEye,
  FaTrash,
  FaRedo,
  FaCheck,
} from "react-icons/fa";
import { FcOldTimeCamera, FcStackOfPhotos, FcVideoCall } from "react-icons/fc";
import { POSTAPI } from "../../../app/api";

import { LuUpload } from "react-icons/lu";

interface UPLOAD {
  name: string;
  text: string;
  accept?: string;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  capture?: "user" | "environment";
  liveCameraAllow?: boolean;
  errors: FieldError;
  defaultApiConfig: any;
  multiple: boolean;
}

const UploadField = ({
  name,
  text,
  accept = "image/*",
  disabled = false,
  hidden = false,
  required = false,
  capture = "environment",
  liveCameraAllow = false,
  multiple = false,
  defaultApiConfig,
  errors,
}: UPLOAD) => {
  if (hidden) return null;
  console.log("===UPLOAD WiDGET===");

  const { open, onOpen, onClose } = useDisclosure();
  const methods = useFormContext();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const toast = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [liveCameraActive, setLiveCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<any[]>(
    methods.watch(name) || []
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileChange");
    console.log(event.target.files);

    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles((pre) => [...pre, ...files]);

    const previewURLs = files.map((file) => URL.createObjectURL(file));
    // setPreviews(previewURLs);
    setPreviews((pre) => [...pre, ...previewURLs]);
  };

  const handleModalConfirm = () => {
    if (selectedFiles.length > 0) {
      const uploadURL = defaultApiConfig["uploadURL"]
        ? defaultApiConfig["uploadURL"]
        : null;
      if (uploadURL) {
        console.log("SELECTED FILE", selectedFiles);
        const proxyUrl = location.origin + "/api";
        POSTAPI({
          path: uploadURL,
          isPrivateApi: true,
          data: {
            process_name: name,
            proxyUrl: proxyUrl,
          },
          files: selectedFiles,
        }).subscribe((response) => {
          console.log("Uplaod Success", response);
          if (response.success && response.uploadFiles.length > 0) {
            const updatedFiles = [...uploadedFiles, ...response.uploadFiles];
            setUploadedFiles(updatedFiles);
            methods.setValue(name, updatedFiles, {
              shouldValidate: true,
            });
            setSelectedFiles([]);
            onClose();
          } else {
            console.log("Uplaod Failed");
          }
        });
      } else {
        console.log("UPLOAD URL IS NOT DEFIND");
      }
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadedFiles([]);
    // setFileNames("");
    methods.setValue(name, null, { shouldValidate: true });
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);

    const updatedNames = updatedFiles.map((file) => file.name).join(", ");
    // setFileNames(updatedNames);
  };

  const handleUploadedRemoveFile = (index: number) => {

    const confirmRemove = window.confirm(
      "Are you sure you want to remove this file? This action cannot be undone."
    );
    if (confirmRemove) {
      const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(updatedFiles);
    }
    // const updatedPreviews = previews.filter((_, i) => i !== index);
    // setSelectedFiles(updatedFiles);
    // setPreviews(updatedPreviews);

    // const updatedNames = updatedFiles.map((file) => file.name).join(", ");
    // setFileNames(updatedNames);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    console.log("event", event);
    const files = event.dataTransfer.files
      ? Array.from(event.dataTransfer.files)
      : [];
    console.log(files);

    if (files.length > 0) {
      handleFileChange({ target: { files: files } } as any);
      console.log("Files added.", `${files.length} file(s) added successfully.`);
    }
  };
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input click
    }
  };

  const startCamere = async () => {
    try {
      setCapturedImage(null);
      setLiveCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStream(stream);
    } catch (error) {
      setLiveCameraActive(false);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        console.log("Camera Access Denied. We couldn't access your camera.");
      } else {
        console.log("Error. An error occurred while trying to access your camera.");
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        // Set canvas size to match video resolution
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the current video frame onto the canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // Convert the canvas content to a data URL (base64 image)
        canvas.toBlob((blob) => {
          if (blob) {
            console.log(blob);

            const blobUrl = URL.createObjectURL(blob);
            setCapturedImage(blobUrl);
          }
        });
        stopCamera();
        // canvas.to
        // const imageData = canvas.toDataURL("image/jpeg");
        // console.log(imageData);

        // setCapturedImage(imageData);
      }
    }
  };
  const cancelCapture = () => {
    // Clears the captured image
    setLiveCameraActive(false);
    setCapturedImage(null);
    stopCamera();
  };

  const stopCamera = () => {
    console.log("StopCamere", stream);

    if (stream) {
      console.log("Strem", stream.getTracks());

      // Stop all video tracks
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Clear the video source
      }
    }
  };

  async function convertBlobUrlToBlob(capturedImage: any) {
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    return blob;
  }
  const confirmPhoto = async () => {
    console.log("images", capturedImage);
    const blob = await convertBlobUrlToBlob(capturedImage);
    console.log(blob);

    if (capturedImage) {
      const file = new File([blob], "capturedphoto.jpeg", {
        type: "image/png",
      });
      handleFileChange({ target: { files: [file] } } as any);
      setLiveCameraActive(false);
    }
  };



  return (
    <>
      <Box
        m={2}
        p={3}
        boxShadow="2xl"
        borderRadius="lg"
        borderWidth="2px"
        bg={useColorModeValue("white", "gray.950")}
      >
        <Field.Root
          invalid={!!errors}
          required={required}
          disabled={disabled}
        >
          <Field.Label
            htmlFor={name}
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="bold"
            color="gray.600"
          >
            {text}
          </Field.Label>
          <Flex direction="row" align="center" gap={2} width="100%">
            <Input
              onClick={onOpen}
              flex="1"
              value={String(uploadedFiles.length > 0
                ? `${uploadedFiles.length} file(s) selected`
                : "")}
              placeholder="Selected file(s) will be displayed here"
              readOnly
            />
            <Input
              type="hidden"
              {...methods.register(name, {
                value: uploadedFiles,
                required: required ? `${text} Field Is Required` : false,
              })}
            />
            <Button
              onClick={onOpen}
              variant="outline"
              // colorScheme="teal"
              marginEnd={0}
              aria-label="Select or Capture File"
            >
              <FaCamera />
            </Button>
            <Button
              onClick={handleClear}
              // colorScheme="red"
              variant="outline"
              aria-label="Clear"
            >
              <FaTimes />
            </Button>
          </Flex>
          <Field.ErrorText>{errors?.message?.toString()}</Field.ErrorText>
        </Field.Root>
      </Box>
      {/* Modal for file selection */}
      <Dialog.Root open={open} size='xl' placement='center' onOpenChange={e => {
        if (!e.open) {
          onClose();
        }
      }}>
        <Portal>

          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>Select or Capture File</Dialog.Header>
              <Dialog.Body>
                {/* Drag and Drop Area inside the modal */}
                {!liveCameraActive && (
                  <Box
                    mt={4}
                    p={4}
                    border="2px dashed"
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                    borderRadius="md"
                    minHeight="120px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    textAlign="center"
                    flexDirection={"column"}
                    onClick={handleButtonClick}
                  >
                    <FaCamera
                      size={40}
                      color={useColorModeValue("gray.600", "gray.300")}
                    />
                    <Text
                      mt={2}
                      fontSize="sm"
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Drag & Drop your files here, or click to select
                    </Text>
                  </Box>
                )}
                {liveCameraAllow && (
                  <>
                    {liveCameraActive && (
                      <VStack gap={4}>
                        {!capturedImage && (
                          <Box>
                            <Heading
                              size="md"
                              display="flex"
                              alignItems="center"
                              justifyContent={"center"}
                              mb={3}
                            >
                              <FcVideoCall style={{ marginRight: "8px" }} /> Live
                              Camera
                            </Heading>
                            {/* Live video feed */}

                            <Box style={{ width: "100%", maxHeight: "400px" }} asChild><video ref={videoRef} autoPlay /></Box>
                          </Box>
                        )}

                        <canvas
                          ref={canvasRef}
                          style={{ display: "none" }}
                        ></canvas>

                        {capturedImage && (
                          <Box>
                            <Heading
                              size="md"
                              display="flex"
                              alignItems="center"
                              justifyContent={"center"}
                              mb={3}
                            >
                              <FcStackOfPhotos style={{ marginRight: "8px" }} />{" "}
                              Captured Image
                            </Heading>
                            <Image
                              src={capturedImage}
                              alt="Captured"
                              borderRadius="md"
                            />
                          </Box>
                        )}
                        <HStack gap={4} width="100%">
                          {!capturedImage ? (
                            <Button
                              flex="1"
                              // colorScheme="teal"
                              onClick={capturePhoto}><FaCamera />Capture Photo
                            </Button>
                          ) : (
                            <>
                              <Button
                                flex="1"
                                // colorScheme="teal"
                                onClick={startCamere}><FaRedo />Retake
                              </Button>

                              <Button
                                flex="1"
                                colorPalette="green"
                                onClick={confirmPhoto}
                                // Disable "Confirm" if no photo is captured
                                disabled={!capturedImage}><FaCheck />Confirm
                              </Button>
                            </>
                          )}

                          <Button flex="1" onClick={cancelCapture}><FaTimes />Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                    {!liveCameraActive && (
                      <Button
                        width="100%"
                        mt={2}
                        onClick={startCamere}
                        variant="outline"
                        colorPalette="blue"><FcOldTimeCamera />Start Live Camera Photo
                      </Button>
                    )}
                  </>
                )}
                {/* File input */}
                <Input
                  type="file"
                  accept={accept}
                  capture={capture}
                  onChange={handleFileChange}
                  multiple={multiple}
                  mt={4}
                  ref={fileInputRef}
                  display="none"
                />

                {/* Previews and selected files table */}
                {selectedFiles.length > 0 && (
                  <Box
                    border="2px solid"
                    borderRadius="md"
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                    mt={6}
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      top="-16px"
                      left="50%"
                      style={{ transform: "translate(-50%)" }}
                    >
                      <Text
                        textTransform="uppercase"
                        bg={useColorModeValue("red.300", "red.700")}
                        px={3}
                        py={1}
                        color={useColorModeValue("gray.900", "gray.300")}
                        fontSize="sm"
                        fontWeight="600"
                        rounded="xl"
                      >
                        Preview
                      </Text>
                    </Box>
                    <Table.ScrollArea>
                      <Table.Root mt={4} size="sm">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Preview</Table.ColumnHeader>
                            <Table.ColumnHeader>File Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Size (KB)</Table.ColumnHeader>
                            <Table.ColumnHeader>Actions</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {selectedFiles.map((file, index) => {
                            const fileUrl = URL.createObjectURL(file);
                            const isImage = file.type.startsWith("image/");
                            return (
                              <Table.Row key={index}>
                                <Table.Cell>
                                  {isImage ? (
                                    <Image
                                      src={fileUrl}
                                      alt={`Preview ${file.name}`}
                                      boxSize="50px"
                                      objectFit="cover"
                                    />
                                  ) : (
                                    <Box
                                      w="50px"
                                      h="50px"
                                      display="flex"
                                      justifyContent="center"
                                      alignItems="center"
                                      bg={useColorModeValue("gray.100", "gray.700")}
                                      borderRadius="md"
                                    >
                                      <Text
                                        color={useColorModeValue(
                                          "gray.600",
                                          "gray.300"
                                        )}
                                      >
                                        {file.name.split(".").pop()?.toUpperCase()}
                                      </Text>
                                    </Box>
                                  )}
                                </Table.Cell>
                                <Table.Cell>{file.name}</Table.Cell>
                                <Table.Cell>{(file.size / 1024).toFixed(2)}</Table.Cell>
                                <Table.Cell>
                                  <Flex gap={2}>
                                    <IconButton
                                      aria-label="Download"
                                      size="sm"
                                      variant="outline"
                                      colorPalette="blue"
                                      asChild><FaDownload /></IconButton>
                                    <IconButton
                                      aria-label="View"
                                      size="sm"
                                      variant="outline"
                                      colorPalette="green"
                                      onClick={() => window.open(fileUrl, "_blank")}><FaEye /></IconButton>
                                    <IconButton
                                      aria-label="Remove"
                                      size="sm"
                                      colorPalette="red"
                                      variant="outline"
                                      onClick={() => handleRemoveFile(index)}><FaTrash /></IconButton>
                                  </Flex>
                                </Table.Cell>
                              </Table.Row>
                            );
                          })}
                        </Table.Body>
                      </Table.Root>
                    </Table.ScrollArea>
                  </Box>
                )}
                {/* Uploaded  files table */}
                {uploadedFiles.length > 0 && (
                  <Box
                    border="2px solid"
                    borderRadius="md"
                    borderColor={useColorModeValue("gray.300", "gray.600")}
                    mt={5}
                    position="relative"
                  >
                    <Box
                      position="absolute"
                      top="-16px"
                      left="50%"
                      style={{ transform: "translate(-50%)" }}
                    >
                      <Text
                        textTransform="uppercase"
                        bg={useColorModeValue("green.300", "green.700")}
                        px={3}
                        py={1}
                        color={useColorModeValue("gray.900", "gray.300")}
                        fontSize="sm"
                        fontWeight="600"
                        rounded="xl"
                      >
                        Uploaded Files
                      </Text>
                    </Box>
                    <Table.ScrollArea>
                      <Table.Root mt={4} size="sm">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Upload File</Table.ColumnHeader>
                            <Table.ColumnHeader>File Name</Table.ColumnHeader>
                            <Table.ColumnHeader>Size (KB)</Table.ColumnHeader>
                            <Table.ColumnHeader>Actions</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {uploadedFiles.map((file: any, index: number) => {
                            const fileUrl =
                              location.origin + "/api/" + file.accessObjectPath;
                            const isImage = file.mimeType.startsWith("image/");
                            return (
                              <Table.Row key={index}>
                                <Table.Cell>
                                  {isImage ? (
                                    <Image
                                      src={fileUrl}
                                      alt={`Preview ${file.name}`}
                                      boxSize="50px"
                                      objectFit="cover"
                                    />
                                  ) : (
                                    <Box
                                      w="50px"
                                      h="50px"
                                      display="flex"
                                      justifyContent="center"
                                      alignItems="center"
                                      bg={useColorModeValue("gray.100", "gray.700")}
                                      borderRadius="md"
                                    >
                                      <Text
                                        color={useColorModeValue(
                                          "gray.600",
                                          "gray.300"
                                        )}
                                      >
                                        {file.originalName
                                          .split(".")
                                          .pop()
                                          ?.toUpperCase()}
                                      </Text>
                                    </Box>
                                  )}
                                </Table.Cell>
                                <Table.Cell>{file.originalName}</Table.Cell>
                                <Table.Cell>{(file.size / 1024).toFixed(2)}</Table.Cell>
                                <Table.Cell>
                                  <Flex gap={2}>
                                    <IconButton
                                      aria-label="Download"
                                      size="sm"
                                      colorPalette="blue"
                                      variant="outline"
                                      asChild><FaDownload /></IconButton>
                                    <IconButton
                                      aria-label="View"
                                      size="sm"
                                      variant="outline"
                                      colorPalette="green"
                                      onClick={() => window.open(fileUrl, "_blank")}><FaEye /></IconButton>
                                    <IconButton
                                      aria-label="Remove"
                                      size="sm"
                                      variant="outline"
                                      colorPalette="red"
                                      onClick={() => handleUploadedRemoveFile(index)}><FaTrash /></IconButton>
                                  </Flex>
                                </Table.Cell>
                              </Table.Row>
                            );
                          })}
                        </Table.Body>
                      </Table.Root>
                    </Table.ScrollArea>
                  </Box>
                )}
              </Dialog.Body>
              <Dialog.Footer>
                {selectedFiles.length > 0 && (
                  <Button
                    flex="1"
                    colorPalette="green"
                    // variant="outline"
                    onClick={handleModalConfirm}
                    variant="solid"
                    bgGradient="linear(to-r, green.400, teal.500, blue.500)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(to-r, green.300, teal.400, blue.400)",
                      boxShadow: "xl",
                    }}><LuUpload />Confirm & Upload
                  </Button>
                )}

                <Button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  colorPalette="red"
                  variant="outline"><FaTimes />Cancel
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>

        </Portal>
      </Dialog.Root>
    </>
  );
};

export default React.memo(UploadField);
