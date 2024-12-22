"use client";

import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";
import AccountInfo from "./AccountInfo";

export const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="pt-header-height h-full">
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

          <AccountInfo />
        </div>
      </header>

      {children}
    </div>
  );
};
