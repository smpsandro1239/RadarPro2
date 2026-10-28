"use client";

import { useState } from "react";

export default function CreditoPage() {
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("3.5");
  const [years, setYears] = useState("30");
  const [result, setResult] = useState<{
    loanAmount: number;
    monthlyPayment: number;
    totalPaid: number;
    totalInterest: number;
    imt: number;
    stampDuty: number;
    totalCost: number;
  } | null>(null);

  function calculate() {
    const priceNum = parseFloat(price);
    const downNum = parseFloat(downPayment) || 0;
    const rateNum = parseFloat(rate) / 100;
    const yearsNum = parseInt(years);
    if (!priceNum || !yearsNum) return;

    const loanAmount = priceNum - downNum;
    const monthlyRate = rateNum / 12;
    const numPayments = yearsNum * 12;
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    const totalPaid = monthlyPayment * numPayments;
    const totalInterest = totalPaid - loanAmount;

    // IMT calculation (simplified for mainland Portugal, 2026)
    let imt = 0;
    if (priceNum <= 101917) {
      imt = priceNum * 0.01;
    } else if (priceNum <= 138450) {
      imt = priceNum * 0.02 - 1019.17;
    } else if (priceNum <= 190086) {
      imt = priceNum * 0.05 - 5178.67;
    } else if (priceNum <= 324058) {
      imt = priceNum * 0.07 - 9000.39;
    } else if (priceNum <= 648022) {
      imt = priceNum * 0.08 - 12240.97;
    } else {
      imt = priceNum * 0.06;
    }

    const stampDuty = priceNum * 0.008;

    setResult({
      loanAmount,
      monthlyPayment,
      totalPaid,
      totalInterest,
      imt: Math.round(imt * 100) / 100,
      stampDuty: Math.round(stampDuty * 100) / 100,
      totalCost: Math.round((imt + stampDuty) * 100) / 100,
    });
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-6 py-12">
      <a href="/" className="text-primary hover:underline mb-6 inline-block">
        ← Voltar
      </a>
      <h1 className="text-4xl font-extrabold mb-4">Calculadora de Crédito Habitação</h1>
      <p className="text-secondary mb-8">
        Estime a prestação mensal, IMT e custos associados à compra de casa em Portugal.
      </p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Preço do imóvel (€)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: 200000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Entrada (€)</label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Ex: 40000"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Taxa de juro anual (%)</label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prazo (anos)</label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={calculate}
          className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition"
        >
          Calcular
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <div className="text-sm text-secondary mb-1">Prestação mensal estimada</div>
            <div className="text-4xl font-extrabold text-primary">
              {result.monthlyPayment.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 space-y-3">
            <h2 className="font-bold mb-2">Resumo do crédito</h2>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Montante do crédito</span>
              <span className="font-medium">{result.loanAmount.toLocaleString()}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Total pago (capital + juros)</span>
              <span className="font-medium">{result.totalPaid.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Total de juros</span>
              <span className="font-medium text-red-500">{result.totalInterest.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}€</span>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 space-y-3">
            <h2 className="font-bold mb-2">Custos de aquisição</h2>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">IMT</span>
              <span className="font-medium">{result.imt.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Imposto de Selo (0,8%)</span>
              <span className="font-medium">{result.stampDuty.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2">
              <span>Total de impostos</span>
              <span>{result.totalCost.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€</span>
            </div>
          </div>

          <p className="text-xs text-secondary">
            * Valores estimados. O IMT pode variar consoante o tipo de imóvel, localização e regime fiscal.
            Consulte um profissional para valores exatos.
          </p>
        </div>
      )}
    </main>
  );
}
