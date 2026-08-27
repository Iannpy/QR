import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/layout/Hero";
import { QRForm } from "../components/qr/QRForm";
import { QRDisplay } from "../components/qr/QRDisplay";
import { WhatIsQR } from "../components/sections/WhatIsQR";
import { HowToUse } from "../components/sections/HowToUse";
import { UseCases } from "../components/sections/UseCases";
import { ComingSoonModal } from "../components/common/ComingSoonModal";
import { useQRGenerator } from "../hooks/useQRGenerator";
import {
  SITE_URL,
  ROUTE_TO_TYPE,
  TYPE_TO_ROUTE,
  GENERATOR_ROUTE_META,
  type GeneratorRouteType,
} from "../config/seo";
import type { QRType } from "../types";

const VALID_ROUTE_TYPES: GeneratorRouteType[] = ["url", "whatsapp", "wifi", "texto"];

export function GeneratorPage() {
  const { t } = useTranslation();
  const { type: routeType } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const isValidRoute = routeType && VALID_ROUTE_TYPES.includes(routeType as GeneratorRouteType);
  const resolvedRouteType = isValidRoute ? (routeType as GeneratorRouteType) : "url";
  const internalType = ROUTE_TO_TYPE[resolvedRouteType];

  const qrGenerator = useQRGenerator();

  useEffect(() => {
    qrGenerator.setType(internalType);
  }, [internalType]);

  const setTypeViaNavigate = (newType: QRType) => {
    navigate(`/generador-qr/${TYPE_TO_ROUTE[newType]}`);
  };

  const qrGeneratorForForm = {
    ...qrGenerator,
    type: internalType,
    setType: setTypeViaNavigate,
  };

  const meta = GENERATOR_ROUTE_META[resolvedRouteType];
  const canonicalUrl = `${SITE_URL}/generador-qr/${resolvedRouteType}`;

  if (!isValidRoute) {
    return <Navigate to="/generador-qr/url" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <Hero />
          <h2 id="home-section-heading" className="sr-only">
            {t("main.sectionTitle")}
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
            aria-labelledby="home-section-heading"
          >
            <QRForm qrGenerator={qrGeneratorForForm} />
            <QRDisplay qrGenerator={qrGenerator} />
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-20">
            <WhatIsQR />
            <HowToUse />
            <UseCases />
          </div>

          <Footer />
        </div>

        <ComingSoonModal
          isOpen={showComingSoonModal}
          onClose={() => setShowComingSoonModal(false)}
        />
      </div>
    </>
  );
}
