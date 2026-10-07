import type { Metadata } from "next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import CosplayQuoteClient from "../../components/quote/CosplayQuoteClient";

export const metadata: Metadata = {
  title: "Cotiza tu cosplay",
  description: "Solicita una cotización para importar cosplays, pelucas y accesorios por WhatsApp.",
  alternates: { canonical: "/cotizar-cosplay" },
};

export default function CosplayQuotePage() {
  return <><Header /><CosplayQuoteClient /><Footer /></>;
}
