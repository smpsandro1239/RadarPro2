"use client";

import { useState } from "react";
import { Calendar, Send } from "lucide-react";
import Button from "@/components/ds/Button";

interface VisitBookingProps {
  propertyTitle: string;
  propertyId: string;
  sourceName: string;
  onSuccess?: () => void;
}

const FIELD =
  "min-h-11 w-full rounded-rp border border-rp-line bg-rp-bg px-3 py-2 text-[14px] text-rp-ink transition-[border-color,box-shadow] duration-[var(--rp-dur-2)] ease-[var(--rp-ease-1)] placeholder:text-rp-muted hover:border-rp-ink-2 focus:border-rp-cobalt focus:shadow-[0_0_0_2px_var(--rp-cobalt)] focus:outline-none";

export default function VisitBooking({ propertyTitle, propertyId, sourceName, onSuccess }: VisitBookingProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setStep("success");
    onSuccess?.();
  };

  if (step === "success") {
    return (
      <div className="border border-rp-cobalt bg-rp-surface p-6 text-center shadow-rp-2">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center border border-rp-cobalt bg-rp-ceramic text-rp-cobalt">
          <Send size={22} aria-hidden="true" />
        </div>
        <h3 className="rp-display text-[24px] leading-tight text-rp-ink">Visita agendada!</h3>
        <p className="mt-2 text-[15px] text-rp-ink-2">
          Receberá um email de confirmação em {formData.email}.
        </p>
        <div className="mt-5 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setStep("form");
              setFormData({ name: "", email: "", phone: "", date: "", time: "", message: "" });
            }}
          >
            Agendar outra visita
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-rp-line bg-rp-surface p-5 shadow-rp-1" data-property-id={propertyId}>
      <h3 className="rp-display flex items-center gap-2 text-[24px] leading-tight text-rp-ink">
        <Calendar size={20} className="text-rp-cobalt" aria-hidden="true" />
        Agendar Visita
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-rp-ink-2">
        Marque uma visita para o imóvel: <span className="font-medium text-rp-ink">{propertyTitle}</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="visit-name" className="rp-eyebrow mb-1 block text-rp-muted">
              Nome completo
            </label>
            <input
              id="visit-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="João Silva"
              className={FIELD}
              required
            />
          </div>
          <div>
            <label htmlFor="visit-email" className="rp-eyebrow mb-1 block text-rp-muted">
              Email
            </label>
            <input
              id="visit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="joao@email.com"
              className={FIELD}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="visit-phone" className="rp-eyebrow mb-1 block text-rp-muted">
              Telefone
            </label>
            <input
              id="visit-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+351 912 345 678"
              className={FIELD}
              required
            />
          </div>
          <div>
            <label htmlFor="visit-date" className="rp-eyebrow mb-1 block text-rp-muted">
              Data
            </label>
            <input
              id="visit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={FIELD}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="visit-time" className="rp-eyebrow mb-1 block text-rp-muted">
              Hora
            </label>
            <input
              id="visit-time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className={FIELD}
              required
            />
          </div>
          <div>
            <label htmlFor="visit-source" className="rp-eyebrow mb-1 block text-rp-muted">
              Fonte do anúncio
            </label>
            <input
              id="visit-source"
              type="text"
              value={sourceName}
              readOnly
              className={`${FIELD} cursor-default text-rp-muted`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="visit-message" className="rp-eyebrow mb-1 block text-rp-muted">
            Mensagem (opcional)
          </label>
          <textarea
            id="visit-message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            placeholder="Alguma informação adicional..."
            className={`${FIELD} min-h-[88px] resize-y`}
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "A agendar..." : "Agendar Visita"}
        </Button>
      </form>
    </div>
  );
}
