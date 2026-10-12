"use client";

import { useTranslations } from "next-intl";
import { FEE_GRID, FEE_LINES, LIMITS, TAX, earlyExitFeeMad, feeLinesForTicket, type FeeLine } from "@/lib/finance";
import { useFormat } from "@/lib/i18n/use-format";
import type { Formatters } from "@/lib/i18n/format";

/** Ticket the "this means" column is worked out for: the minimum, so every figure is the smallest case. */
export const EXAMPLE_TICKET_MAD = LIMITS.MIN_TICKET_MAD;

type T = ReturnType<typeof useTranslations<"pricing.table">>;

/** Rate column of the public fee grid, in plain words (`pricing.table.rate.<code>`). */
export function rateText(line: FeeLine, t: T, f: Formatters): string {
  switch (line.code) {
    case "S1":
    case "S2":
      return t(`rate.${line.code}`, { rate: f.percent(line.rate) });
    case "D1":
      return t("rate.D1", { rate: f.percent(line.rate, 0) });
    case "D2":
      return t("rate.D2", { rate: f.percent(line.rate, 2), ttc: f.percent(line.rate * (1 + TAX.TVA_ON_FEES), 2) });
    case "D3":
      return t("rate.D3", { rate: f.percent(line.rate) });
    case "D4":
      return t("rate.D4", { rate: f.percent(line.rate) });
    case "D5":
      return t("rate.D5", { rate: f.percent(line.rate, 0), hurdle: f.percent(FEE_GRID.D5_HURDLE, 0) });
    default: {
      const d = FEE_GRID.D6_ANALYTICS_MAD;
      return t("rate.D6", {
        individual: f.mad(d.individual, { decimals: 0 }),
        premium: f.mad(d.premium, { decimals: 0 }),
        b2b: f.mad(d.b2b, { decimals: 0 }),
      });
    }
  }
}

/** What a fee means in money for the example ticket. Computed from the engine, never typed by hand. */
export function ticketMeaning(line: FeeLine, t: T, f: Formatters, ticketMad: number = EXAMPLE_TICKET_MAD): string {
  const withAmount = feeLinesForTicket(ticketMad).find((l) => l.code === line.code);
  const amount = withAmount?.amountMad ?? null;
  switch (line.code) {
    case "S1":
    case "S2":
      return t("meaning.notCharged");
    case "D1":
      return f.mad(amount ?? 0, { decimals: 0 });
    case "D2": {
      const ht = amount ?? 0;
      return t("meaning.D2", { ht: f.mad(ht), ttc: f.mad(ht * (1 + TAX.TVA_ON_FEES)) });
    }
    case "D3":
      return t("meaning.D3");
    case "D4":
      return t("meaning.D4", { amount: f.mad(earlyExitFeeMad(ticketMad)) });
    case "D5":
      return t("meaning.D5");
    default:
      return t("meaning.D6");
  }
}

const codeChip = "me-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground";

/**
 * Public fee grid: who pays what, when, and what each line means at the minimum ticket.
 * Small screens get one card per fee so nothing scrolls sideways. Promotions are not shown (off by default).
 */
export default function PricingTable() {
  const t = useTranslations("pricing.table");
  const f = useFormat();
  const ticket = f.mad(EXAMPLE_TICKET_MAD, { decimals: 0 });
  const label = (line: FeeLine) => t(`lines.${line.code}.label`);
  const paidBy = (line: FeeLine) => t(`lines.${line.code}.paidBy`);
  const when = (line: FeeLine) => t(`lines.${line.code}.when`);
  return (
    <div>
      <ul className="divide-y divide-border rounded-3xl border border-border bg-card sm:hidden" aria-label={t("ariaLabel")}>
        {FEE_LINES.map((line) => (
          <li key={line.code} data-testid="fee-row" className="space-y-2 p-5">
            <p className="text-base font-semibold text-foreground">
              <span className={codeChip}>{line.code}</span>
              {label(line)}
            </p>
            <p className="financial-number text-sm font-semibold text-foreground">{rateText(line, t, f)}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("mobile.paidBy", { who: paidBy(line).toLowerCase(), when: when(line) })}
            </p>
            <p className="financial-number rounded-2xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">
              {t("mobile.means", { ticket, meaning: ticketMeaning(line, t, f) })}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-3xl border border-border bg-card sm:block">
        <table className="w-full text-start text-sm">
          <caption className="sr-only">{t("caption", { ticket })}</caption>
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-4 text-start font-semibold">{t("headers.fee")}</th>
              <th scope="col" className="px-5 py-4 text-start font-semibold">{t("headers.paidBy")}</th>
              <th scope="col" className="px-5 py-4 text-start font-semibold">{t("headers.rate")}</th>
              <th scope="col" className="px-5 py-4 text-start font-semibold">{t("headers.when")}</th>
              <th scope="col" className="px-5 py-4 text-start font-semibold">{t("headers.means", { ticket })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FEE_LINES.map((line) => (
              <tr key={line.code} data-testid="fee-row" className="align-top">
                <th scope="row" className="px-5 py-5 text-start font-semibold text-foreground">
                  <span className={codeChip}>{line.code}</span>
                  {label(line)}
                </th>
                <td className="px-5 py-5 text-muted-foreground">{paidBy(line)}</td>
                <td className="financial-number px-5 py-5 font-semibold text-foreground">{rateText(line, t, f)}</td>
                <td className="px-5 py-5 text-muted-foreground">{when(line)}</td>
                <td className="financial-number px-5 py-5 font-semibold text-foreground">{ticketMeaning(line, t, f)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
