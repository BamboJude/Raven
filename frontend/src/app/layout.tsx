import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { RavenWidget } from "@/components/RavenWidget";

export const metadata: Metadata = {
  title: "Raven Support - AI Chatbot pour votre entreprise",
  description:
    "Raven Support est une plateforme de chatbot IA pour les entreprises au Cameroun. Automatisez vos conversations WhatsApp et site web.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
        <RavenWidget />
      </body>
    </html>
  );
}
