"use client";

import { useEffect, useRef, useState } from "react";

type ImageChangeMode = "append" | "replace";

export function useImagePreviews(defaultMax = 6) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageFilesRef = useRef<File[]>([]);
  const previewUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    imageFilesRef.current = imageFiles;
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
    };
  }, []);

  function revokePreviewUrls() {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
  }

  function handleImageChange(
    fileList: FileList | null,
    maxImages = defaultMax,
    mode: ImageChangeMode = "replace",
  ) {
    if (!fileList || fileList.length === 0) {
      if (mode === "replace") {
        revokePreviewUrls();
        imageFilesRef.current = [];
        setImageFiles([]);
        setImagePreviews([]);
      }
      return;
    }

    const incoming = Array.from(fileList);

    if (mode === "replace") {
      revokePreviewUrls();
      const files = incoming.slice(0, maxImages);
      const urls = files.map((file) => URL.createObjectURL(file));
      previewUrlsRef.current = urls;
      imageFilesRef.current = files;
      setImageFiles(files);
      setImagePreviews(urls);
      return;
    }

    const mergedFiles = [...imageFilesRef.current, ...incoming].slice(0, maxImages);
    const addedFiles = mergedFiles.slice(imageFilesRef.current.length);
    const newUrls = addedFiles.map((file) => URL.createObjectURL(file));
    const urls = [...previewUrlsRef.current, ...newUrls];

    previewUrlsRef.current = urls;
    imageFilesRef.current = mergedFiles;
    setImageFiles(mergedFiles);
    setImagePreviews(urls);
  }

  return {
    handleImageChange,
    imageFiles,
    imagePreviews,
  };
}
