import { Viewport } from "next";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

export const metadata = {
  title: 'AkashChat',
  description: 'This application is running on NVIDIA GPUs leased from the Akash Supercloud',
}

export const viewport: Viewport = {
  themeColor: 'system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </Head>
      <body>
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        {children}
      </body>
    </html>
  );
}
