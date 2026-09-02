import React, { useState } from "react";
import { sendContact } from "@/api/backend";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useT } from "@/lib/i18n";

const CONTACT_EMAIL = "concact@dexacv.com";

export default function Contact() {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setError("");
    setSending(true);
    try {
      await sendContact({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "Contact from DexaCV website",
        message: message.trim(),
      });
      setSent(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err) {
      console.error(err);
      setError(t("contact.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Seo title="Contact — DexaCV" description="Get in touch with the DexaCV team." path="/contact" />
      <div className="text-center mb-8">
        <div className="grid place-items-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
          <Mail size={22} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t("contact.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("contact.subtitle")}</p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 inline-flex items-center gap-1.5 text-primary font-medium hover:underline">
          <Mail size={15} /> {CONTACT_EMAIL}
        </a>
      </div>

      {sent ? (
        <div className="text-center border border-border rounded-2xl bg-card p-8">
          <CheckCircle2 className="text-green-600 mx-auto mb-3" size={40} />
          <h2 className="text-xl font-semibold">{t("contact.sentTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-1.5">{t("contact.sentText")}</p>
          <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
            {t("contact.sendAnother")}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="border border-border rounded-2xl bg-card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">{t("contact.name")}</Label>
              <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder={t("contact.namePlaceholder")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">{t("contact.email")}</Label>
              <Input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-subject">{t("contact.subject")}</Label>
            <Input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("contact.subjectPlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-message">{t("contact.message")}</Label>
            <Textarea id="c-message" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("contact.messagePlaceholder")} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {t("contact.send")}
          </Button>
        </form>
      )}
    </div>
  );
}