"use client";

import { useState } from "react";
import PageShell from "@/components/ds/PageShell";
import Button from "@/components/ds/Button";

const FIELD =
  "w-full min-h-11 rounded-rp border border-rp-line bg-rp-surface px-4 py-2 text-[15px] text-rp-ink focus:border-rp-cobalt focus:outline-none";

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
    <PageShell
      eyebrow="Crédito"
      title="Calculadora de crédito habitação"
      description="Estime a prestação mensal, IMT e custos associados à compra de casa em Portugal."
      backHref="/"
      backLabel="Voltar ao início"
    >
      <form
        className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        onSubmit={(e) => {
          e.preventDefault();
          calculate();
        }}
      >
        <div className="space-y-4 border border-rp-line bg-rp-surface p-6">
          <div>
            <label htmlFor="credito-preco" className="rp-eyebrow mb-1 block text-rp-muted">
              Preço do imóvel (€)
            </label>
            <input
              id="credito-preco"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={FIELD}
              placeholder="Ex: 200000"
            />
          </div>
          <div>
            <label htmlFor="credito-entrada" className="rp-eyebrow mb-1 block text-rp-muted">
              Entrada (€)
            </label>
            <input
              id="credito-entrada"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              className={FIELD}
              placeholder="Ex: 40000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="credito-taxa" className="rp-eyebrow mb-1 block text-rp-muted">
                Taxa de juro anual (%)
              </label>
              <input
                id="credito-taxa"
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="credito-prazo" className="rp-eyebrow mb-1 block text-rp-muted">
                Prazo (anos)
              </label>
              <input
                id="credito-prazo"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className={FIELD}
              />
            </div>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Calcular
          </Button>
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <div className="border border-rp-line bg-rp-surface p-6 shadow-rp-2">
                <p className="rp-eyebrow text-rp-muted">Prestação mensal estimada</p>
                <p className="rp-num mt-3 text-[40px] leading-none text-rp-ink">
                  {result.monthlyPayment.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€
                </p>
              </div>

              <div className="border border-rp-line bg-rp-surface p-6">
                <h2 className="rp-display text-[20px] leading-tight text-rp-ink">Resumo do crédito</h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                    <dt className="text-[13px] text-rp-muted">Montante do crédito</dt>
                    <dd className="rp-num text-[14px] text-rp-ink">{result.loanAmount.toLocaleString()}€</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                    <dt className="text-[13px] text-rp-muted">Total pago (capital + juros)</dt>
                    <dd className="rp-num text-[14px] text-rp-ink">
                      {result.totalPaid.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}€
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-[13px] text-rp-muted">Total de juros</dt>
                    <dd className="rp-num text-[14px] text-rp-anomaly">
                      {result.totalInterest.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}€
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border border-rp-line bg-rp-surface p-6">
                <h2 className="rp-display text-[20px] leading-tight text-rp-ink">Custos de aquisição</h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                    <dt className="text-[13px] text-rp-muted">IMT</dt>
                    <dd className="rp-num text-[14px] text-rp-ink">
                      {result.imt.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b border-rp-line pb-2">
                    <dt className="text-[13px] text-rp-muted">Imposto de Selo (0,8%)</dt>
                    <dd className="rp-num text-[14px] text-rp-ink">
                      {result.stampDuty.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="rp-eyebrow text-rp-ink">Total de impostos</dt>
                    <dd className="rp-num text-[14px] font-medium text-rp-ink">
                      {result.totalCost.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="max-w-[60ch] text-[13px] leading-relaxed text-rp-muted">
                * Valores estimados. O IMT pode variar consoante o tipo de imóvel, localização e regime fiscal.
                Consulte um profissional para valores exatos.
              </p>
            </div>
          ) : (
            <div className="border border-dashed border-rp-line bg-rp-surface px-6 py-14 text-center">
              <p className="rp-display text-[22px] leading-tight text-rp-ink">
                A prestação aparece aqui
              </p>
              <p className="mx-auto mt-2 max-w-[46ch] text-[15px] leading-relaxed text-rp-muted">
                Preenche o preço, a entrada, a taxa e o prazo para estimar a prestação, os juros e os impostos.
              </p>
            </div>
          )}
        </div>
      </form>
    </PageShell>
  );
}
