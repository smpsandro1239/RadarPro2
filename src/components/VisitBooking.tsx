"use client";

import { useState } from "react";
import { Calendar, Phone, MapPin, Send } from "lucide-react";

interface VisitBookingProps {
  propertyTitle: string;
  propertyId: string;
  sourceName: string;
  onSuccess?: () => void;
}

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
      <div className="border rounded-2xl p-6 text-center bg-green-50">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send size={24} className="text-green-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">Visita agendada!</h3>
        <p className="text-secondary mb-4">
          Receberá um email de confirmação em {formData.email}.
        </p>
        <button
          onClick={() => {
            setStep("form");
            setFormData({ name: "", email: "", phone: "", date: "", time: "", message: "" });
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition"
        >
          Agendar outra visita
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl p-6">
      <h3 className="font-bold text-lg mb-4">Agendar Visita</h3>
      <p className="text-secondary text-sm mb-6">
        Marque uma visita para o imóvel: <span className="font-medium">{propertyTitle}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Nome completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="João Silva"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="joao@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Telefone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+351 912 345 678"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Hora</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Fonte do anúncio</label>
            <input
              type="text"
              value={sourceName}
              readOnly
              className="w-full px-4 py-2 border rounded-lg text-sm text-slate-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Mensagem (opcional)</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            placeholder="Alguma informação adicional..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "A agendar..." : "Agendar Visita"}
        </button>
      </form>
    </div>
  );
}
