"use client";

import React from "react";
import ImageCrop from "./image-crop.client";

export default function ImageCropWrapper(props: { initialSrc?: string; width?: number; height?: number }) {
  return <ImageCrop {...props} />;
}
