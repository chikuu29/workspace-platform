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
  Trash2,
  RotateCcw,
  Check,
  File as FileIcon,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  Presentation,
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
  previewUrl,
  isUploaded = false
}: {
  file: any,
  onRemove: () => void,
  onView?: () => void,
  previewUrl?: string,
  isUploaded?: boolean
}) => {
  const bg = useColorModeValue("white", "whiteAlpha.100");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.200");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const uploadedBorderColor = useColorModeValue("green.300", "green.500");

  const fileName = isUploaded ? file.originalName : file.name;
  const fileSize = file.size ? `${(file.size / 1024).toFixed(1)} KB` : "";
  const lowerName = fileName?.toLowerCase() ?? "";
  const extension = lowerName.split(".").pop() ?? "";
  const isImg = file.type?.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension);
  const imageUrl = isImg
    ? previewUrl || (isUploaded && file.accessObjectPath ? `${location.origin}/api/${file.accessObjectPath}` : undefined)
    : undefined;

  const fileAccent = useMemo(() => {
    if (extension === "pdf") return { bg: "red.50", color: "red.600", icon: FileText };
    if (["doc", "docx", "odt", "rtf"].includes(extension)) return { bg: "blue.50", color: "blue.600", icon: FileText };
    if (["xls", "xlsx", "csv"].includes(extension)) return { bg: "green.50", color: "green.600", icon: FileSpreadsheet };
    if (["ppt", "pptx"].includes(extension)) return { bg: "orange.50", color: "orange.600", icon: Presentation };
    if (["zip", "rar", "7z"].includes(extension)) return { bg: "yellow.50", color: "yellow.700", icon: FileArchive };
    if (["json", "xml", "html", "css", "js", "ts", "tsx"].includes(extension)) return { bg: "purple.50", color: "purple.600", icon: FileCode };
    return { bg: isUploaded ? "green.100" : "indigo.50", color: isUploaded ? "green.600" : "indigo.500", icon: FileIcon };
  }, [extension, isUploaded]);

  const FileTypeIcon = fileAccent.icon;

  return (
    <Flex
      p={2.5}
      borderRadius="lg"
      bg={bg}
      align="center"
      gap={3}
      borderWidth="1px"
      borderColor={isUploaded ? uploadedBorderColor : borderColor}
      boxShadow="0 1px 2px rgba(15, 23, 42, 0.06)"
      transition="background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease"
      cursor={onView ? "pointer" : "default"}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
      onClick={onView}
      onKeyDown={(event) => {
        if (onView && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onView();
        }
      }}
      _hover={{
        bg: hoverBg,
        borderColor: isUploaded ? uploadedBorderColor : "indigo.300",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.10)",
        transform: "translateY(-1px)"
      }}
      _focusVisible={{ outline: "2px solid", outlineColor: "indigo.400", outlineOffset: "2px" }}
    >
      <Center boxSize="56px" borderRadius="md" bg={fileAccent.bg} color={fileAccent.color} overflow="hidden" flexShrink={0}>
        {imageUrl ? (
          <Image src={imageUrl} alt={fileName} boxSize="full" objectFit="cover" />
        ) : (
          <FileTypeIcon size={22} />
        )}
      </Center>

      <VStack align="stretch" gap={1} flex="1" minW={0}>
        <Text fontSize="sm" fontWeight="semibold" truncate color="fg">
          {fileName}
        </Text>
        <HStack gap={2}>
          {fileSize && <Text fontSize="2xs" color="fg.subtle">{fileSize}</Text>}
          {extension && (
            <Badge size="xs" colorPalette="gray" variant="surface" borderRadius="sm" fontSize="8px">
              {extension.toUpperCase()}
            </Badge>
          )}
          <Badge size="xs" colorPalette={isUploaded ? "green" : "indigo"} variant="subtle" borderRadius="full" fontSize="8px">
            {isUploaded ? "UPLOADED" : "PENDING"}
          </Badge>
        </HStack>
      </VStack>

      <HStack gap={1}>
        <IconButton
          aria-label={`Remove ${fileName}`}
          size="xs"
          variant="ghost"
          colorPalette="red"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          _hover={{ bg: "red.50", color: "red.600" }}
        >
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
  const { getValues, register, setValue, trigger, unregister } = methods;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [liveCameraActive, setLiveCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<any[]>(() => getValues(name) || []);
  const uploadedFileCount = uploadedFiles.length;
  const selectedFileCount = selectedFiles.length;
  const hasFiles = uploadedFileCount > 0 || selectedFileCount > 0;
  const selectedFileCountRef = useRef(selectedFileCount);
  const mandatoryRef = useRef(mandatory);
  const disabledRef = useRef(disabled);
  const textRef = useRef(text);
  selectedFileCountRef.current = selectedFileCount;
  mandatoryRef.current = mandatory;
  disabledRef.current = disabled;
  textRef.current = text;
  const previousSelectedFileCountRef = useRef(selectedFileCount);

  useEffect(() => {
    register(name, {
      validate: (value) => {
        if (!mandatoryRef.current || disabledRef.current) return true;
        const hasStoredFiles = Array.isArray(value) ? value.length > 0 : !!value;
        return hasStoredFiles || selectedFileCountRef.current > 0 || `${textRef.current} is required`;
      },
    });

    return () => {
      unregister(name);
    };
  }, [name, register, unregister]);

  useEffect(() => {
    if (previousSelectedFileCountRef.current !== selectedFileCount) {
      previousSelectedFileCountRef.current = selectedFileCount;
      trigger(name);
    }
  }, [name, selectedFileCount, trigger]);

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
            setValue(name, updatedFiles, { shouldValidate: true });
            if (events) ruleEngine.processEvents(events, updatedFiles, 'change', methods);
            setSelectedFiles([]);
            setPreviews([]);
            onClose();
          }
        });
      }
    }
  }, [selectedFiles, defaultApiConfig, name, uploadedFiles, methods, onClose, events, setValue]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles([]);
    setPreviews([]);
    setUploadedFiles([]);
    setValue(name, [], { shouldValidate: true });
    if (events) ruleEngine.processEvents(events, null, 'change', methods);
  }, [methods, name, events, setValue]);

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
    setValue(name, updatedFiles, { shouldValidate: true });
    if (events) ruleEngine.processEvents(events, updatedFiles, 'change', methods);
  }, [uploadedFiles, methods, name, events, setValue]);

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
              <Field.Label fontSize="md" fontWeight="semibold" >
                {text}  <Field.RequiredIndicator />
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
                    value={uploadedFileCount > 0 ? `${uploadedFileCount} file(s) uploaded` : ""}
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

              {enableClear && uploadedFileCount > 0 && !disabled && (
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
            <Field.ErrorText fontSize="md" color="red.500" mt={1}>
              <Field.ErrorIcon /> {errors?.message?.toString()}
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

                    {hasFiles && (
                      <VStack w="full" align="stretch" gap={3}>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="2xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                            FILES ({selectedFileCount + uploadedFileCount})
                          </Text>
                          {selectedFiles.length > 0 && <Badge size="sm" variant="subtle" colorPalette="orange">PENDING</Badge>}
                        </Flex>

                        <VStack gap={2} align="stretch" maxH="220px" overflowY="auto" pr={1} className="custom-scroll">
                          {selectedFiles.map((file, i) => (
                            <FileItem
                              key={`sel-${i}`}
                              file={file}
                              previewUrl={previews[i]}
                              onRemove={() => handleRemoveFile(i)}
                              onView={() => window.open(previews[i], "_blank")}
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
                        <Button flex="1" size="md" colorPalette="blue" borderRadius="md" onClick={capturePhoto} boxShadow="0 4px 12px rgba(66, 153, 225, 0.4)">
                          <Camera /> Capture
                        </Button>
                      ) : (
                          <>
                          <Button flex="1" size="md" variant="solid" borderRadius="md" onClick={startCamere}><RotateCcw /> Retake</Button>
                          <Button flex="1" size="md" colorPalette="green" borderRadius="md" onClick={confirmPhoto} >
                            <Check /> Use Photo
                          </Button>
                        </>
                      )}
                      <Button variant="solid" size="md" colorPalette="red" onClick={() => { stopCamera(); setLiveCameraActive(false); setCapturedImage(null); }} >Cancel</Button>
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
