import "./globals.css";

export const metadata = {
  title: "PulseBoard",
  description: "Metrics, tasks, and server telemetry dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
