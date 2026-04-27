import "./globals.css";
import FloatingActions from "../components/layout/FloatingActions";

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
    <html lang="es">
      <body>
        {children}
        <FloatingActions />
      </body>
    </html>
  );
}