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
  Badge,
  Progress,
  Center,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React, { useRef, useState, useCallback, memo, useMemo, useEffect } from "react";
import { FieldError, useFormContext } from "react-hook-form";
import {
  Upload,
  Camera,
  X,
  Eye,
  Download,
  Trash2,
  RotateCcw,
  Check,
  File as FileIcon,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { POSTAPI } from "../../app/api";
import { ruleEngine } from "../engine/logicEngine";

interface UPLOAD {
  name: string;
  text: string;
  accept?: string;
  disabled?: boolean;
  hidden?: boolean;
  mandatory?: boolean;
  capture?: "user" | "environment";
  liveCameraAllow?: boolean;
  errors: FieldError;
  defaultApiConfig: any;
  multiple: boolean;
  oneLiner?: boolean;
  description?: string;
  events?: any;
  enableClear?: boolean;
}

// Optimized Sub-component for individual file display
const FileItem = memo(({
  file,
  onRemove,
  onView,
  status = "pending",
  isUploaded = false
}: {
  file: any,
  onRemove: () => void,
  onView?: () => void,
  status?: string,
  isUploaded?: boolean
}) => {
  const bg = useColorModeValue("whiteAlpha.500", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const fileName = isUploaded ? file.originalName : file.name;
  const fileSize = (file.size / 1024).toFixed(1);
  const isImg = file.type?.startsWith("image/") || ["jpg", "jpeg", "png", "gif"].some(ext => fileName.toLowerCase().endsWith(ext));

  return (
    <Flex
      p={3}
      borderRadius="xl"
      bg={bg}
      align="center"
      gap={3}
      borderWidth="1.5px"
      borderColor={isUploaded ? "green.200" : borderColor}
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "sm" }}
    >
      <Center boxSize="40px" borderRadius="lg" bg={isUploaded ? "green.100" : "indigo.50"} color={isUploaded ? "green.600" : "indigo.500"}>
        {isImg ? <ImageIcon size={20} /> : <FileIcon size={20} />}
      </Center>

      <VStack align="stretch" gap={0} flex="1">
        <Text fontSize="xs" fontWeight="bold" truncate maxW="220px">{fileName}</Text>
        <HStack gap={2}>
          <Text fontSize="2xs" color="fg.subtle">{fileSize} KB</Text>
          <Badge size="xs" colorPalette={isUploaded ? "green" : "indigo"} variant="subtle" borderRadius="full" fontSize="8px">
            {isUploaded ? "UPLOADED" : "PENDING"}
          </Badge>
        </HStack>
      </VStack>

      <HStack gap={1}>
        {onView && (
          <IconButton size="xs" variant="ghost" onClick={onView} _hover={{ bg: "whiteAlpha.300" }}>
            <Eye />
          </IconButton>
        )}
        <IconButton size="xs" variant="ghost" colorPalette="red" onClick={onRemove} _hover={{ bg: "red.50", color: "red.600" }}>
          <Trash2 />
        </IconButton>
      </HStack>
    </Flex>
  );
});

const UploadField = ({
  name,
  text,
  accept = "image/*",
  disabled = false,
  hidden = false,
  mandatory = false,
  capture = "environment",
  liveCameraAllow = false,
  multiple = false,
  defaultApiConfig,
  errors,
  oneLiner = false,
  description,
  events,
  enableClear = true,
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
  const [isDragging, setIsDragging] = useState(false);

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
            accept,
            max_size_bytes: defaultApiConfig?.maxSizeBytes ?? defaultApiConfig?.max_size_bytes,
            max_files: defaultApiConfig?.maxFiles ?? defaultApiConfig?.max_files ?? (multiple ? 10 : 1),
            proxyUrl: proxyUrl,
          },
          files: selectedFiles,
        }).subscribe((response) => {
          if (response.success && response.uploadFiles.length > 0) {
            const updatedFiles = [...uploadedFiles, ...response.uploadFiles];
            setUploadedFiles(updatedFiles);
            methods.setValue(name, updatedFiles, { shouldValidate: true });
            if (events) ruleEngine.processEvents(events, updatedFiles, 'change', methods);
            setSelectedFiles([]);
            setPreviews([]);
            onClose();
          }
        });
      }
    }
  }, [selectedFiles, defaultApiConfig, name, uploadedFiles, methods, onClose, events]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles([]);
    setPreviews([]);
    setUploadedFiles([]);
    methods.setValue(name, null, { shouldValidate: true });
    if (events) ruleEngine.processEvents(events, null, 'change', methods);
  }, [methods, name, events]);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });
    setPreviews((prev) => {
      const oldUrl = prev[index];
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleUploadedRemoveFile = useCallback((index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    methods.setValue(name, updatedFiles, { shouldValidate: true });
    if (events) ruleEngine.processEvents(events, updatedFiles, 'change', methods);
  }, [uploadedFiles, methods, name, events]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (files.length > 0) {
      const input = { target: { files: files as any } } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(input);
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
      const file = new File([blob], `captured_${Date.now()}.jpeg`, { type: "image/jpeg" });
      const input = { target: { files: [file] as any } } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(input);
      setLiveCameraActive(false);
      setCapturedImage(null);
    }
  };

  // Cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const labelWidth = oneLiner ? { base: "full", md: "35%" } : "full";
  const contentWidth = oneLiner ? { base: "full", md: "65%" } : "full";

  return (
    <Box w="full" py={2} px={1}>
      <Field.Root invalid={!!errors} required={mandatory} disabled={disabled}>
        <Flex
          direction={oneLiner ? { base: "column", md: "row" } : "column"}
          align={oneLiner ? { base: "stretch", md: "center" } : "stretch"}
          gap={oneLiner ? 4 : 2}
          w="full"
        >
          {text && (
            <Box w={labelWidth}>
              <Field.Label fontSize="sm" fontWeight="semibold" color="fg.muted">
                {text}
              </Field.Label>
              {description && !oneLiner && (
                <Text fontSize="xs" color="fg.subtle">
                  {description}
                </Text>
              )}
            </Box>
          )}

          <Box w={contentWidth}>
            <HStack gap={2} w="full" align="center">
              <Box flex="1" position="relative">
                <Box w="full" onClick={onOpen} cursor="pointer">
                  <Input
                    readOnly
                    value={uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) uploaded` : ""}
                    placeholder="Click to upload files..."
                    size="md"
                    borderRadius="xl"
                    borderWidth="1.5px"
                    bg={useColorModeValue("white", "whiteAlpha.100")}
                    _focus={{ borderColor: "indigo.500", boxShadow: "0 0 0 1px var(--chakra-colors-indigo-500)" }}
                  />
                  <Center position="absolute" right="3" top="50%" transform="translateY(-50%)" color="gray.400">
                    <Camera size={18} />
                  </Center>
                </Box>
              </Box>

              {enableClear && uploadedFiles.length > 0 && !disabled && (
                <IconButton
                  size="sm"
                  variant="ghost"
                  color="fg.muted"
                  onClick={handleClear}
                  _hover={{ bg: "transparent", color: "red.500" }}
                >
                  <X />
                </IconButton>
              )}
            </HStack>
            <Field.ErrorText fontSize="xs" color="red.500" mt={1}>
              {errors?.message?.toString()}
            </Field.ErrorText>
          </Box>
        </Flex>
      </Field.Root>

      <Dialog.Root open={open} size="md" placement="center" onOpenChange={e => { if (!e.open) { stopCamera(); onClose(); } }}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(8px)" />
          <Dialog.Positioner p={4}>
            <Dialog.Content
              borderRadius="2xl"
              boxShadow="2xl"
              overflow="hidden"
              border="2px solid"
              borderColor={useColorModeValue("indigo.500", "indigo.400")}
              bg={useColorModeValue("white", "rgba(15, 23, 42, 0.98)")}
              backdropFilter="blur(24px)"
              position="relative"
            >
              <IconButton
                variant="subtle"
                size="sm"
                onClick={onClose}
                borderRadius="full"
                position="absolute"
                right="4"
                top="4"
                zIndex="docked"
                colorPalette="indigo"
              >
                <X />
              </IconButton>

              <Dialog.Header borderBottomWidth="1px" p={5} bg={useColorModeValue("gray.50", "whiteAlpha.50")}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" fontSize="lg" color={useColorModeValue("indigo.700", "indigo.300")}>Upload Documents</Text>
                </Flex>
              </Dialog.Header>

              <Dialog.Body p={6}>
                {!liveCameraActive ? (
                  <VStack gap={6} align="stretch">
                    {/* Dropzone Area */}
                    <Box
                      w="full"
                      h="160px"
                      border="2px dashed"
                      borderColor={isDragging ? "indigo.500" : useColorModeValue("indigo.200", "whiteAlpha.300")}
                      borderRadius="2xl"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      bg={isDragging ? useColorModeValue("indigo.50", "whiteAlpha.200") : useColorModeValue("indigo.50/30", "whiteAlpha.50")}
                      transition="all 0.2s"
                      _hover={{ borderColor: "indigo.500", bg: useColorModeValue("indigo.50", "whiteAlpha.100"), transform: "scale(1.01)" }}
                      cursor="pointer"
                      onClick={handleButtonClick}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      position="relative"
                    >
                      <VStack gap={2}>
                        <Center boxSize="50px" borderRadius="full" bg="indigo.100" color="indigo.600" _dark={{ bg: "indigo.900/40" }}>
                          <Upload size={24} />
                        </Center>
                        <VStack gap={0}>
                          <Text fontWeight="bold" fontSize="sm">Click or Drag to Upload</Text>
                          <Text fontSize="xs" color="fg.subtle">Max size 10MB per file</Text>
                        </VStack>
                      </VStack>
                    </Box>

                    {liveCameraAllow && !capturedImage && (
                      <Button
                        w="full"
                        variant="subtle"
                        size="md"
                        borderRadius="xl"
                        onClick={startCamere}
                        colorPalette="indigo"
                      >
                        <Camera /> Take a Photo
                      </Button>
                    )}

                    {(selectedFiles.length > 0 || uploadedFiles.length > 0) && (
                      <VStack w="full" align="stretch" gap={3}>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="2xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                            FILES ({selectedFiles.length + uploadedFiles.length})
                          </Text>
                          {selectedFiles.length > 0 && <Badge size="sm" variant="subtle" colorPalette="orange">PENDING</Badge>}
                        </Flex>

                        <VStack gap={2} align="stretch" maxH="220px" overflowY="auto" pr={1} className="custom-scroll">
                          {selectedFiles.map((file, i) => (
                            <FileItem
                              key={`sel-${i}`}
                              file={file}
                              onRemove={() => handleRemoveFile(i)}
                            />
                          ))}
                          {uploadedFiles.map((file, i) => (
                            <FileItem
                              key={`up-${i}`}
                              file={file}
                              isUploaded
                              onRemove={() => handleUploadedRemoveFile(i)}
                              onView={() => window.open(location.origin + "/api/" + file.accessObjectPath, "_blank")}
                            />
                          ))}
                        </VStack>
                      </VStack>
                    )}
                  </VStack>
                ) : (
                  <VStack gap={5}>
                    <Box
                      w="full"
                      borderRadius="2xl"
                      overflow="hidden"
                      bg="black"
                      position="relative"
                      aspectRatio={4 / 3}
                      boxShadow="inner"
                    >
                      {capturedImage ? (
                        <Image src={capturedImage} boxSize="full" objectFit="contain" />
                      ) : (
                        <video ref={videoRef} autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </Box>
                    <HStack w="full" gap={3}>
                      {!capturedImage ? (
                        <Button flex="1" size="lg" colorPalette="blue" borderRadius="xl" onClick={capturePhoto} boxShadow="0 4px 12px rgba(66, 153, 225, 0.4)">
                          <Camera /> Capture
                        </Button>
                      ) : (
                          <>
                          <Button flex="1" size="lg" variant="outline" borderRadius="xl" onClick={startCamere}><RotateCcw /> Retake</Button>
                          <Button flex="1" size="lg" colorPalette="green" borderRadius="xl" onClick={confirmPhoto} boxShadow="0 4px 12px rgba(72, 187, 120, 0.4)">
                            <Check /> Use Photo
                          </Button>
                        </>
                      )}
                      <Button variant="outline" onClick={() => { stopCamera(); setLiveCameraActive(false); setCapturedImage(null); }} size="lg">Cancel</Button>
                    </HStack>
                  </VStack>
                )}
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" p={5} bg={useColorModeValue("indigo.50/30", "whiteAlpha.50")}>
                <HStack gap={3} w="full">
                  <Button variant="ghost" flex="1" onClick={onClose} borderRadius="xl">Cancel</Button>
                  {selectedFiles.length > 0 && (
                    <Button flex="2" colorPalette="indigo" size="lg" borderRadius="xl" onClick={handleModalConfirm} fontWeight="extrabold" boxShadow="0 8px 20px -4px var(--chakra-colors-indigo-500)">
                      <Upload /> Upload {selectedFiles.length} {selectedFiles.length === 1 ? "File" : "Files"}
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
