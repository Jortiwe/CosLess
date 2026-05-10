import { Suspense } from "react";
import "./globals.css";
import FloatingActions from "../components/layout/FloatingActions";
import RouteLoadingScreen from "../components/layout/RouteLoadingScreen";

export const metadata = {
  title: "CosLess",
  description: "Tienda de cosplay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <Suspense fallback={null}>
          <RouteLoadingScreen />
        </Suspense>

        {children}
        <FloatingActions />
      </body>
    </html>
  );
}