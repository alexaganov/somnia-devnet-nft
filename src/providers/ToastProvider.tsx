"use client";

import { Toaster } from "@/components/ui/sonner";
import { nanoid } from "nanoid";
import React, { ReactNode } from "react";
import { ExternalToast, toast as sonnerToast } from "sonner";

export type ToastMessageType = Parameters<typeof sonnerToast>[0];

export interface ExtendedToastParams extends ExternalToast {
  message?: ToastMessageType;
}

export const toast = sonnerToast;

export const createToast = (
  message: ToastMessageType,
  defaults?: ExternalToast
) => {
  const id = nanoid();

  return {
    loading: ({ message: localMessage, ...data }: ExtendedToastParams = {}) => {
      toast.loading(localMessage || message, {
        id,
        dismissible: false,
        closeButton: false,
        duration: Infinity,
        ...data,
        ...defaults,
      });
    },
    error: ({ message: localMessage, ...data }: ExtendedToastParams = {}) => {
      toast.error(localMessage || message, {
        id,
        dismissible: true,
        closeButton: true,
        duration: Infinity,
        ...data,
        ...defaults,
      });
    },
    success: ({ message: localMessage, ...data }: ExtendedToastParams = {}) => {
      toast.success(localMessage || message, {
        id,
        dismissible: true,
        closeButton: true,
        duration: 10_000,
        ...data,
        ...defaults,
      });
    },
    dismiss: () => toast.dismiss(id),
  };
};

export const ToastProvider = ({ children }: { children?: ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};
