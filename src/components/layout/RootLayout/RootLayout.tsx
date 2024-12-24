"use client";

import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";
import AccountInfo from "./AccountInfo";
import SomniaNetworkStatus from "./SomniaNetworkStatus";
import { Separator } from "@/components/ui/separator";

export const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="pt-header-height min-h-full">
      <header className="fixed z-10 top-0 backdrop-blur-xl bg-header-bg w-full left-0">
        <div className="container justify-between flex items-center h-header-height">
          <Link className="flex-shrink-0" href="/">
            <Image
              height={28}
              width={134}
              alt="Somnia Logo"
              src="/somnia-logo-light.svg"
            />
          </Link>

          <div className="flex gap-4 w-full justify-end items-center">
            <SomniaNetworkStatus className="flex-shrink-0" />

            <Separator orientation="vertical" className="h-4" />

            <AccountInfo />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
};
