"use client";

import { useState, useEffect } from "react";
import { Bell, Trash2, Plus } from "lucide-react";

interface Alert {
  id: string;
  district: string | null;
  maxPrice: number | null;
  minScore: number | null;
  propertyType: string | null;
  email: string;
  active: boolean;
}

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
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold">Alertas de Oportunidades</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus size={18} /> Novo alerta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border rounded-xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Distrito</label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Todos</option>
                <option value="Lisboa">Lisboa</option>
                <option value="Porto">Porto</option>
                <option value="Braga">Braga</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de imóvel</label>
              <select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
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
              <label className="block text-sm font-medium mb-1">Preço máximo (€)</label>
              <input
                type="number"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ex: 200000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Score mínimo</label>
              <select
                value={form.minScore}
                onChange={(e) => setForm({ ...form, minScore: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Qualquer</option>
                <option value="70">70+</option>
                <option value="80">80+</option>
                <option value="90">90+</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Email para alertas</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition"
          >
            Criar alerta
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-secondary">A carregar...</p>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-secondary">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nenhum alerta configurado.</p>
          <p className="text-sm">Crie um alerta para receber notificações de novas oportunidades.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{alert.district || "Todos os distritos"}</div>
                <div className="text-sm text-secondary">
                  {alert.propertyType && `${alert.propertyType} · `}
                  {alert.maxPrice && `Até ${alert.maxPrice.toLocaleString()}€ · `}
                  {alert.minScore && `Score ${alert.minScore}+ · `}
                  {alert.email}
                </div>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
