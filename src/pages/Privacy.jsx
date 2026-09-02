import React from "react";
import { Link } from "react-router-dom";
import { BRAND } from "@/components/Layout";
import Seo from "@/components/Seo";
import MobileSubHeader from "@/components/MobileSubHeader";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Seo title="Privacy Policy — DexaCV" description="How DexaCV handles your data: local-first storage, optional cloud sync, and what we never do with your CV." path="/privacy" />
      <MobileSubHeader title="Privacy Policy" />
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated {new Date().getFullYear()}</p>
      <div className="space-y-5 text-foreground/80 leading-relaxed">
        <Section title="Where your CV is stored">
          Your CV is stored in your own browser, on this device. It is not uploaded to {BRAND}, it is not
          synced between your devices, and clearing your browser data deletes it. Keep your own copy of
          anything you need — exporting a PDF or DOCX is the way to do that.
        </Section>
        <Section title="What does leave your device">
          Four things, each only when you choose them. A profile photo you upload is stored on our
          hosting provider so it can appear on your CV. A LinkedIn export you import is uploaded so it can
          be read and turned into CV fields. Text you send to the AI writing features is passed to our AI
          provider to generate a suggestion. A message you send through the contact form is emailed to us.
          Nothing else is transmitted, and none of it happens unless you press the button that does it.
        </Section>
        <Section title="What we don't do">
          We do not sell your CV information, share it with third parties for advertising, or publish it.
          We do not read your CV to build a profile of you, and we do not use its contents to train models.
        </Section>
        <Section title="Analytics and cookies">
          {BRAND} currently runs no analytics and no advertising or tracking cookies. The only browser
          storage used is what the app needs to work: your CV, your language and theme, and your cookie
          preference itself. Your preference is recorded so that it already applies if optional analytics
          are ever introduced.
        </Section>
        <Section title="Accounts">
          Account features are optional and are not required to build or download a CV. If you create an
          account and later delete it from your account settings, the account record is removed. Your CVs
          are unaffected either way, because they live in your browser rather than in the account.
        </Section>
        <Section title="Contact">
          Questions about your privacy: write to us through the <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
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