"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import PushNotificationButton from "@/components/PushNotificationButton";
import PageShell from "@/components/ds/PageShell";
import EmptyState from "@/components/ds/EmptyState";
import Button from "@/components/ds/Button";

interface Alert {
  id: string;
  district: string | null;
  maxPrice: number | null;
  minScore: number | null;
  propertyType: string | null;
  email: string;
  active: boolean;
}

const FIELD =
  "w-full min-h-11 rounded-rp border border-rp-line bg-rp-surface px-3 py-2 text-[14px] text-rp-ink focus:border-rp-cobalt focus:outline-none";

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    district: "",
    maxPrice: "",
    minScore: "",
    propertyType: "",
    email: "",
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    const res = await fetch("/api/alerts");
    const data = await res.json();
    setAlerts(data.alerts || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ district: "", maxPrice: "", minScore: "", propertyType: "", email: "" });
      fetchAlerts();
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchAlerts();
  }

  return (
    <PageShell
      eyebrow="Alertas"
      title="Alertas de oportunidades"
      description="Crie alertas por zona, tipo ou preco e receba avisos quando aparece uma oportunidade."
      backHref="/"
      backLabel="Voltar ao início"
      actions={
        <>
          <PushNotificationButton />
          <Button type="button" onClick={() => setShowForm(!showForm)} variant="primary" size="md">
            <Plus size={18} aria-hidden="true" /> Novo alerta
          </Button>
        </>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 border border-rp-line bg-rp-surface p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="alerta-distrito" className="rp-eyebrow mb-1 block text-rp-muted">
                Distrito
              </label>
              <select
                id="alerta-distrito"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className={FIELD}
              >
                <option value="">Todos</option>
                <option value="Lisboa">Lisboa</option>
                <option value="Porto">Porto</option>
                <option value="Braga">Braga</option>
              </select>
            </div>
            <div>
              <label htmlFor="alerta-tipo" className="rp-eyebrow mb-1 block text-rp-muted">
                Tipo de imóvel
              </label>
              <select
                id="alerta-tipo"
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                className={FIELD}
              >
                <option value="">Todos</option>
                <option value="T0">T0</option>
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
                <option value="Moradia">Moradia</option>
                <option value="Terreno">Terreno</option>
                <option value="Garagem">Garagem</option>
              </select>
            </div>
            <div>
              <label htmlFor="alerta-preco" className="rp-eyebrow mb-1 block text-rp-muted">
                Preço máximo (€)
              </label>
              <input
                id="alerta-preco"
                type="number"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                className={FIELD}
                placeholder="Ex: 200000"
              />
            </div>
            <div>
              <label htmlFor="alerta-score" className="rp-eyebrow mb-1 block text-rp-muted">
                Score mínimo
              </label>
              <select
                id="alerta-score"
                value={form.minScore}
                onChange={(e) => setForm({ ...form, minScore: e.target.value })}
                className={FIELD}
              >
                <option value="">Qualquer</option>
                <option value="70">70+</option>
                <option value="80">80+</option>
                <option value="90">90+</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="alerta-email" className="rp-eyebrow mb-1 block text-rp-muted">
                Email para alertas
              </label>
              <input
                id="alerta-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={FIELD}
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" variant="primary" size="md">
              Criar alerta
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-rp-muted">A carregar…</p>
      ) : alerts.length === 0 ? (
        <EmptyState
          title="Nenhum alerta configurado"
          description="Crie um alerta para receber notificações de novas oportunidades."
          action={
            <Button type="button" variant="secondary" size="md" onClick={() => setShowForm(true)}>
              Criar o primeiro alerta
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="flex items-center justify-between gap-4 border border-rp-line bg-rp-surface p-4"
            >
              <div className="min-w-0">
                <h2 className="rp-display text-[18px] leading-snug text-rp-ink">
                  {alert.district || "Todos os distritos"}
                </h2>
                <p className="rp-num mt-1 text-[13px] text-rp-muted">
                  {alert.propertyType && `${alert.propertyType} · `}
                  {alert.maxPrice && `Até ${alert.maxPrice.toLocaleString()}€ · `}
                  {alert.minScore && `Score ${alert.minScore}+ · `}
                  {alert.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(alert.id)}
                aria-label="Eliminar alerta"
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-rp border border-rp-line bg-rp-surface text-rp-anomaly transition-colors duration-[var(--rp-dur-1)] hover:bg-rp-ceramic"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
