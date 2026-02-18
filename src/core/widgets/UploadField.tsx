import {
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
  Field,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React, { useRef, useState, useCallback, memo } from "react";
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
import { LuUpload, LuCamera, LuX, LuEye, LuDownload, LuTrash2, LuRotateCcw, LuCheck } from "react-icons/lu";
import { POSTAPI } from "../../app/api";

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
  oneLiner?: boolean;
  description?: string;
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
  oneLiner = false,
  description,
}: UPLOAD) => {
  if (hidden) return null;

  const { open, onOpen, onClose } = useDisclosure();
  const methods = useFormContext();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [liveCameraActive, setLiveCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<any[]>(
    methods.watch(name) || []
  );

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles((pre) => [...pre, ...files]);
    const previewURLs = files.map((file) => URL.createObjectURL(file));
    setPreviews((pre) => [...pre, ...previewURLs]);
  }, []);

  const handleModalConfirm = useCallback(() => {
    if (selectedFiles.length > 0) {
      const uploadURL = defaultApiConfig?.uploadURL;
      if (uploadURL) {
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
          if (response.success && response.uploadFiles.length > 0) {
            const updatedFiles = [...uploadedFiles, ...response.uploadFiles];
            setUploadedFiles(updatedFiles);
            methods.setValue(name, updatedFiles, { shouldValidate: true });
            setSelectedFiles([]);
            setPreviews([]);
            onClose();
          }
        });
      }
    }
  }, [selectedFiles, defaultApiConfig, name, uploadedFiles, methods, onClose]);

  const handleClear = useCallback(() => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadedFiles([]);
    methods.setValue(name, null, { shouldValidate: true });
  }, [methods, name]);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadedRemoveFile = useCallback((index: number) => {
    if (window.confirm("Are you sure you want to remove this file?")) {
      const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(updatedFiles);
      methods.setValue(name, updatedFiles, { shouldValidate: true });
    }
  }, [uploadedFiles, methods, name]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (files.length > 0) {
      handleFileChange({ target: { files: files as any } } as any);
    }
  }, [handleFileChange]);

  const handleButtonClick = () => fileInputRef.current?.click();

  const startCamere = async () => {
    try {
      setCapturedImage(null);
      setLiveCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStream(stream);
    } catch (error) {
      setLiveCameraActive(false);
      console.error("Camera error:", error);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) setCapturedImage(URL.createObjectURL(blob));
        });
        stopCamera();
      }
    }
  };

  const confirmPhoto = async () => {
    if (capturedImage) {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "captured_photo.jpeg", { type: "image/jpeg" });
      handleFileChange({ target: { files: [file] as any } } as any);
      setLiveCameraActive(false);
      setCapturedImage(null);
    }
  };

  const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
  const contentWidth = oneLiner ? { base: "full", md: "65%" } : "full";

  return (
    <Box w="full" py={2} px={1}>
      <Field.Root invalid={!!errors} required={required} disabled={disabled}>
        <Flex
          direction={oneLiner ? { base: "column", md: "row" } : "column"}
          align={oneLiner ? { base: "stretch", md: "center" } : "stretch"}
          gap={oneLiner ? 4 : 2}
          w="full"
        >
          {text && (
            <Box w={labelWidth}>
              <Field.Label
                fontSize="sm"
                fontWeight="semibold"
                color="fg.muted"
                transition="color 0.2s"
                _invalid={{ color: "red.500" }}
                mb={oneLiner ? 0 : 1}
              >
                {text}
              </Field.Label>
              {description && (
                <Text fontSize="xs" color="fg.subtle" mb={oneLiner ? 0 : 1}>
                  {description}
                </Text>
              )}
            </Box>
          )}

          <Box w={contentWidth}>
            <Flex gap={2} align="center">
              <Input
                onClick={onOpen}
                flex="1"
                value={uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) uploaded` : ""}
                placeholder="Click to upload files"
                readOnly
                size="md"
                bg={useColorModeValue("white", "whiteAlpha.50")}
                borderRadius="lg"
                borderWidth="1.5px"
                borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                _hover={{ borderColor: useColorModeValue("gray.300", "whiteAlpha.400") }}
                cursor="pointer"
              />
              <IconButton
                aria-label="Upload"
                variant="outline"
                size="md"
                borderRadius="lg"
                onClick={onOpen}
                _hover={{ bg: "blue.50", color: "blue.500", borderColor: "blue.200" }}
              >
                <LuCamera />
              </IconButton>
              {uploadedFiles.length > 0 && (
                <IconButton
                  aria-label="Clear All"
                  variant="outline"
                  size="md"
                  borderRadius="lg"
                  colorPalette="red"
                  onClick={handleClear}
                >
                  <LuX />
                </IconButton>
              )}
            </Flex>
            <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
              {errors?.message?.toString()}
            </Field.ErrorText>
          </Box>
        </Flex>
      </Field.Root>

      <Dialog.Root open={open} size="xl" placement="center" onOpenChange={e => { if (!e.open) { stopCamera(); onClose(); } }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner p={4}>
            <Dialog.Content borderRadius="xl" boxShadow="2xl">
              <Dialog.Header borderBottomWidth="1px" pb={4}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" fontSize="lg">Upload Documents</Text>
                  <IconButton variant="ghost" size="sm" onClick={onClose}><LuX /></IconButton>
                </Flex>
              </Dialog.Header>
              <Dialog.Body py={6}>
                {!liveCameraActive ? (
                  <VStack gap={6}>
                    <Box
                      w="full"
                      h="160px"
                      border="2px dashed"
                      borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                      borderRadius="xl"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                      transition="all 0.2s"
                      _hover={{ borderColor: "blue.400", bg: useColorModeValue("blue.50", "whiteAlpha.100") }}
                      cursor="pointer"
                      onClick={handleButtonClick}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <LuUpload size={32} color="var(--chakra-colors-blue-500)" />
                      <Text mt={3} fontWeight="medium" fontSize="sm">Drag & drop or Click to upload</Text>
                      <Text fontSize="xs" color="fg.subtle">Supports: {accept}</Text>
                    </Box>

                    {liveCameraAllow && (
                      <Button w="full" variant="outline" size="lg" borderRadius="xl" onClick={startCamere}>
                        <LuCamera /> Use Camera
                      </Button>
                    )}

                    {(selectedFiles.length > 0 || uploadedFiles.length > 0) && (
                      <VStack w="full" align="stretch" gap={3}>
                        <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
                          File List ({selectedFiles.length + uploadedFiles.length})
                        </Text>
                        <VStack gap={2} align="stretch" maxH="200px" overflowY="auto" pr={2}>
                          {selectedFiles.map((file, i) => (
                            <Flex key={`sel-${i}`} p={2} borderRadius="md" bg="bg.subtle" align="center" gap={3} borderWidth="1px">
                              <Box boxSize="40px" borderRadius="md" bg="blue.100" />
                              <VStack align="stretch" gap={0} flex="1">
                                <Text fontSize="xs" fontWeight="semibold" truncate maxW="200px">{file.name}</Text>
                                <Text fontSize="2xs" color="fg.subtle">{(file.size / 1024).toFixed(1)} KB • Pending</Text>
                              </VStack>
                              <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => handleRemoveFile(i)}><LuTrash2 /></IconButton>
                            </Flex>
                          ))}
                          {uploadedFiles.map((file, i) => (
                            <Flex key={`up-${i}`} p={2} borderRadius="md" bg="green.50" _dark={{ bg: "green.900/20" }} align="center" gap={3} borderWidth="1px" borderColor="green.200">
                              <Box boxSize="40px" borderRadius="md" overflow="hidden">
                                <Image src={location.origin + "/api/" + file.accessObjectPath} boxSize="full" objectFit="cover" />
                              </Box>
                              <VStack align="stretch" gap={0} flex="1">
                                <Text fontSize="xs" fontWeight="semibold" truncate maxW="200px">{file.originalName}</Text>
                                <Text fontSize="2xs" color="green.600">{(file.size / 1024).toFixed(1)} KB • Uploaded</Text>
                              </VStack>
                              <HStack gap={1}>
                                <IconButton size="xs" variant="ghost" onClick={() => window.open(location.origin + "/api/" + file.accessObjectPath, "_blank")}><LuEye /></IconButton>
                                <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => handleUploadedRemoveFile(i)}><LuTrash2 /></IconButton>
                              </HStack>
                            </Flex>
                          ))}
                        </VStack>
                      </VStack>
                    )}
                  </VStack>
                ) : (
                  <VStack gap={4}>
                    <Box w="full" borderRadius="xl" overflow="hidden" bg="black" position="relative" aspectRatio={4 / 3}>
                      {capturedImage ? (
                        <Image src={capturedImage} boxSize="full" objectFit="contain" />
                      ) : (
                        <video ref={videoRef} autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </Box>
                    <HStack w="full" gap={3}>
                      {!capturedImage ? (
                        <Button flex="1" size="lg" colorPalette="blue" borderRadius="xl" onClick={capturePhoto}><LuCamera /> Capture</Button>
                      ) : (
                        <>
                          <Button flex="1" size="lg" variant="outline" borderRadius="xl" onClick={startCamere}><LuRotateCcw /> Retake</Button>
                          <Button flex="1" size="lg" colorPalette="green" borderRadius="xl" onClick={confirmPhoto}><LuCheck /> Confirm</Button>
                        </>
                      )}
                      <Button variant="ghost" onClick={() => { stopCamera(); setLiveCameraActive(false); setCapturedImage(null); }} size="lg">Cancel</Button>
                    </HStack>
                  </VStack>
                )}
              </Dialog.Body>
              <Dialog.Footer borderTopWidth="1px" pt={4}>
                <HStack gap={3} w="full">
                  <Button variant="ghost" flex="1" colorPalette="red" onClick={onClose}>Close</Button>
                  {selectedFiles.length > 0 && (
                    <Button flex="2" colorPalette="blue" size="lg" borderRadius="xl" onClick={handleModalConfirm}>
                      <LuUpload /> Upload Files
                    </Button>
                  )}
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <input type="file" ref={fileInputRef} style={{ display: "none" }} multiple={multiple} accept={accept} onChange={handleFileChange} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </Box>
  );
};

export default memo(UploadField);
