import React from "react";
import { Link } from "react-router-dom";
import { BRAND } from "@/components/Layout";
import Seo from "@/components/Seo";
import MobileSubHeader from "@/components/MobileSubHeader";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Seo title="Terms of Service — DexaCV" description="DexaCV's terms of service: build and preview your CV for free, and pay a one-time €0.99 for each PDF or DOCX download." path="/terms" />
      <MobileSubHeader title="Terms of Service" />
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated {new Date().getFullYear()}</p>
      <div className="space-y-5 text-foreground/80 leading-relaxed">
        <Section title="The service">
          {BRAND} is an online CV builder. Creating, customizing and previewing your CV is free and does not require an account. Downloading a finished CV as a PDF or DOCX file costs a one-time €0.99 per download, and exported files never carry a watermark.
        </Section>
        <Section title="Your responsibility">
          You are responsible for the accuracy of the information you enter and for ensuring your CV content does not infringe the rights of others.
        </Section>
        <Section title="Acceptable use">
          You agree not to use {BRAND} to create misleading, fraudulent or unlawful content, or to attempt to disrupt the service.
        </Section>
        <Section title="No warranty">
          The service is provided "as is". We work hard to keep it reliable, but we do not guarantee uninterrupted availability or that exported files will meet every third-party requirement.
        </Section>
        <Section title="Payments">
          Each CV download is charged as a single €0.99 payment. There is no subscription and no recurring charge: you pay only when you choose to export a file, and the price is shown before you confirm. Payments are processed by our payment provider — we never store your card details.
        </Section>
        <Section title="Refunds">
          Because a download is delivered immediately, you agree that delivery begins as soon as you confirm payment. If a download fails or the file you receive is unusable, contact us and we will re-deliver it or refund that payment.
        </Section>
        <Section title="Changes to pricing">
          We may change the price of a download in the future. Any new price applies only to downloads made after the change, and the current price is always shown before you pay.
        </Section>
      </div>
      <Link to="/" className="text-primary text-sm hover:underline mt-8 inline-block">← Back home</Link>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-semibold text-foreground mb-1">{title}</h2>
      <p>{children}</p>
    </div>
  );
}