"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Raven Support business ID
const SUPPORT_BUSINESS_ID = "f2939e5f-9367-4110-9113-60748fc2cddb";

export function RavenWidget() {
  const [widgetReady, setWidgetReady] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in and has businesses
    const loadBusinessId = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Use the support business ID
      // In production, this would be your dedicated support business
      setBusinessId(SUPPORT_BUSINESS_ID);

      // Set RAVEN_CONFIG before widget loads
      (window as unknown as { RAVEN_CONFIG: { businessId: string; apiUrl: string } }).RAVEN_CONFIG = {
        businessId: SUPPORT_BUSINESS_ID,
        apiUrl: API_URL,
      };

      setWidgetReady(true);
    };

    loadBusinessId();
  }, []);

  if (!widgetReady || !businessId) {
    return null;
  }

  return (
    <Script
      src={`${API_URL}/static/raven-widget.js`}
      strategy="afterInteractive"
    />
  );
}
