"use client";

import { useEffect, useRef, useState } from "react";

type ImageChangeMode = "append" | "replace";

export const ADD_LISTING_IMAGE_CAP = 100;

export function useImagePreviews(defaultMax = ADD_LISTING_IMAGE_CAP) {
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

  function commit(files: File[], urls: string[]) {
    previewUrlsRef.current = urls;
    imageFilesRef.current = files;
    setImageFiles(files);
    setImagePreviews(urls);
  }

  function handleImageChange(
    fileList: FileList | null,
    maxImages = defaultMax,
    mode: ImageChangeMode = "replace",
  ) {
    if (!fileList || fileList.length === 0) {
      if (mode === "replace") {
        revokePreviewUrls();
        commit([], []);
      }
      return;
    }

    const incoming = Array.from(fileList);

    if (mode === "replace") {
      revokePreviewUrls();
      const files = incoming.slice(0, maxImages);
      const urls = files.map((file) => URL.createObjectURL(file));
      commit(files, urls);
      return;
    }

    const mergedFiles = [...imageFilesRef.current, ...incoming].slice(0, maxImages);
    const addedFiles = mergedFiles.slice(imageFilesRef.current.length);
    const newUrls = addedFiles.map((file) => URL.createObjectURL(file));
    commit(mergedFiles, [...previewUrlsRef.current, ...newUrls]);
  }

  function setCoverIndex(index: number) {
    if (index <= 0 || index >= imageFilesRef.current.length) return;
    const files = [...imageFilesRef.current];
    const urls = [...previewUrlsRef.current];
    const [file] = files.splice(index, 1);
    const [url] = urls.splice(index, 1);
    files.unshift(file);
    urls.unshift(url);
    commit(files, urls);
  }

  function removeImage(index: number) {
    if (index < 0 || index >= imageFilesRef.current.length) return;
    const files = [...imageFilesRef.current];
    const urls = [...previewUrlsRef.current];
    const [removedUrl] = urls.splice(index, 1);
    files.splice(index, 1);
    if (removedUrl) URL.revokeObjectURL(removedUrl);
    commit(files, urls);
  }

  return {
    handleImageChange,
    imageFiles,
    imagePreviews,
    removeImage,
    setCoverIndex,
  };
}
