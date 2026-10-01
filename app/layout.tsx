import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import FloatingActions from "../components/layout/FloatingActions";
import RouteLoadingScreen from "../components/layout/RouteLoadingScreen";

export const metadata: Metadata = {
  metadataBase: new URL("https://cosless.store"),
  title: {
    default: "CosLess | Tienda de cosplay en Bolivia",
    template: "%s | CosLess",
  },
  description:
    "Tienda online de cosplay en Bolivia: lentes de contacto, pelucas, accesorios, cosplays y alquiler.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: "https://cosless.store",
    siteName: "CosLess",
    title: "CosLess | Tienda de cosplay en Bolivia",
    description:
      "Lentes, pelucas, accesorios, cosplays y alquiler para completar tu personaje.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CosLess | Tienda de cosplay en Bolivia",
    description:
      "Lentes, pelucas, accesorios, cosplays y alquiler para completar tu personaje.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
