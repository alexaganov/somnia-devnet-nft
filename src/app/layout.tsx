import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { headers } from "next/headers";
import clsx from "clsx";
import { RootLayout } from "@/components/layout/RootLayout/RootLayout";

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  weight: ["400", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Somnia Devnet Nfts",
  description: "Mint Somnit Devent Nfts Right Now",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en">
      <body
        className={clsx(
          robotoSans.className,
          robotoSans.variable,
          robotoMono.variable,
          "antialiased"
        )}
      >
        <Providers cookies={cookies}>
          <RootLayout>{children}</RootLayout>
        </Providers>
      </body>
    </html>
  );
}
