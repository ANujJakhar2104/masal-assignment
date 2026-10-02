"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { ApiError, errorMessage, postJson, type FieldErrors } from "@/lib/http";
import { SAMPLE_LEADS } from "@/lib/samples";
import { leadInputSchema, TIMELINES, type VoiceIntake } from "@/lib/schemas";
import { buttonStyles, Field, inputStyles } from "./ui";
import { VoiceNote } from "./voice-note";

type FormValues = Record<
  "name" | "phone" | "location" | "requirement" | "budget" | "timeline" | "message",
  string
>;

const EMPTY: FormValues = {
  name: "",
  phone: "",
  location: "",
  requirement: "",
  budget: "",
  timeline: "",
  message: "",
};

export function LeadForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [filledFrom, setFilledFrom] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sampleIndex, setSampleIndex] = useState(0);

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function applyVoiceIntake(intake: VoiceIntake) {
    setValues((current) => ({
      name: intake.name ?? current.name,
      phone: intake.phone ?? current.phone,
      location: intake.location ?? current.location,
      requirement: intake.requirement ?? current.requirement,
      budget: intake.budget ?? current.budget,
      timeline: intake.timeline ?? current.timeline,
      message: intake.transcript || current.message,
    }));
    setErrors({});
    setFilledFrom("Filled from the recording. Check each field before saving.");
  }

  function applySample() {
    const sample = SAMPLE_LEADS[sampleIndex % SAMPLE_LEADS.length];
    setValues({ ...sample, phone: sample.phone ?? "" });
    setSampleIndex((i) => i + 1);
    setErrors({});
    setFilledFrom(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = leadInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { id } = await postJson<{ id: string }>("/api/leads", parsed.data);
      router.push(`/leads/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.fields) setErrors(error.fields);
      setFormError(errorMessage(error));
      setSubmitting(false);
    }
  }

  const fieldProps = (field: keyof FormValues) => ({
    id: field,
    name: field,
    value: values[field],
    "aria-invalid": Boolean(errors[field]),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      update(field, event.target.value),
    className: inputStyles,
  });

  return (
    <div className="space-y-6">
      <VoiceNote onExtracted={applyVoiceIntake} />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-lg border border-stone-200 bg-white p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-stone-600">{filledFrom ?? "All fields except phone are required."}</p>
          <button type="button" onClick={applySample} className={`${buttonStyles("ghost")} shrink-0`}>
            Try an example
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" error={errors.name?.[0]}>
            <input {...fieldProps("name")} autoComplete="off" />
          </Field>
          <Field
            label="Phone"
            htmlFor="phone"
            hint="Optional. Used for the WhatsApp reply."
            error={errors.phone?.[0]}
          >
            <input {...fieldProps("phone")} type="tel" placeholder="98765 43210" />
          </Field>
          <Field label="Location" htmlFor="location" error={errors.location?.[0]}>
            <input {...fieldProps("location")} placeholder="Area, city" />
          </Field>
          <Field label="Budget" htmlFor="budget" error={errors.budget?.[0]}>
            <input {...fieldProps("budget")} placeholder="₹80 L – 1 Cr" />
          </Field>
          <Field label="Property requirement" htmlFor="requirement" error={errors.requirement?.[0]}>
            <input {...fieldProps("requirement")} placeholder="3BHK apartment near metro" />
          </Field>
          <Field label="Buying timeline" htmlFor="timeline" error={errors.timeline?.[0]}>
            <select {...fieldProps("timeline")}>
              <option value="" disabled>
                Select…
              </option>
              {TIMELINES.map((timeline) => (
                <option key={timeline}>{timeline}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Customer message"
          htmlFor="message"
          hint="Paste their enquiry, a WhatsApp chat, or your notes from the call."
          error={errors.message?.[0]}
        >
          <textarea {...fieldProps("message")} rows={7} />
        </Field>

        <div className="flex items-center gap-3 border-t border-stone-200 pt-5">
          <button type="submit" disabled={submitting} className={buttonStyles("primary")}>
            {submitting ? "Analysing…" : "Save and analyse"}
          </button>
          {submitting && <p className="text-sm text-stone-500">Usually takes 5–15 seconds.</p>}
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </div>
      </form>
    </div>
  );
}
