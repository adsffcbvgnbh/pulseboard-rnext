import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseBoard",
  description: "Metrics, tasks, and server telemetry dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
