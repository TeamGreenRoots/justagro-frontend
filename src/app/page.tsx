"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getDashboardPath } from "@/lib/auth";

import Nav           from "@/components/landing/Nav";
import Hero          from "@/components/landing/Hero";
import TrustBar      from "@/components/landing/TrustBar";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorks    from "@/components/landing/HowItWorks";
import PaymentSection from "@/components/landing/PaymentSection";
import AISection     from "@/components/landing/AISection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection  from "@/components/landing/StatsSection";
import UseCases      from "@/components/landing/UseCases";
import CTASection    from "@/components/landing/CTASection";
import Footer        from "@/components/landing/Footer";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) router.replace(getDashboardPath(user.role));
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans">
      <Nav />
      <Hero />
      <TrustBar />
      <ProblemSection />
      <HowItWorks />
      <PaymentSection />
      <AISection />
      <FeaturesSection />
      <StatsSection />
      <UseCases />
      <CTASection />
      <Footer />
    </main>
  );
}

