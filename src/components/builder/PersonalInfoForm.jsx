import React from "react";
import { Field, TextInput } from "./Fields";
import PhotoUpload from "./PhotoUpload";
import { useT } from "@/lib/i18n";

export default function PersonalInfoForm({ cv, onChange }) {
  const t = useT();
  const pi = cv.personal_info || {};
  const set = (patch) => onChange({ ...pi, ...patch });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("builder.field.fullName")}>
          <TextInput value={pi.full_name} onChange={(e) => set({ full_name: e.target.value })} placeholder={t("builder.ph.fullName")} />
        </Field>
        <Field label={t("builder.field.professionalTitle")}>
          <TextInput value={pi.professional_title} onChange={(e) => set({ professional_title: e.target.value })} placeholder={t("builder.ph.professionalTitle")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("builder.field.email")}>
          <TextInput type="email" value={pi.email} onChange={(e) => set({ email: e.target.value })} placeholder={t("builder.ph.email")} />
        </Field>
        <Field label={t("builder.field.phone")}>
          <TextInput value={pi.phone} onChange={(e) => set({ phone: e.target.value })} placeholder={t("builder.ph.phone")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("builder.field.location")}>
          <TextInput value={pi.location} onChange={(e) => set({ location: e.target.value })} placeholder={t("builder.ph.location")} />
        </Field>
        <Field label={t("builder.field.website")}>
          <TextInput value={pi.website} onChange={(e) => set({ website: e.target.value })} placeholder={t("builder.ph.website")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("builder.field.linkedin")}>
          <TextInput value={pi.linkedin} onChange={(e) => set({ linkedin: e.target.value })} placeholder={t("builder.ph.linkedin")} />
        </Field>
        <Field label={t("builder.field.github")}>
          <TextInput value={pi.github} onChange={(e) => set({ github: e.target.value })} placeholder={t("builder.ph.github")} />
        </Field>
      </div>
      <Field label={t("builder.field.photo")}>
        <PhotoUpload value={pi.photo} onChange={(photo) => set({ photo })} />
      </Field>
    </div>
  );
}