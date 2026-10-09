"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatMad, scenarioLabel, type SimulationResult } from "@/lib/finance";
import { cumulativeSeries } from "@/lib/simulator";

const W = 640;
const H = 300;
const M = { top: 28, right: 16, bottom: 40, left: 16 };

/**
 * Year-by-year cumulative cash. Inline SVG, no chart library. Ink is the projection
 * (your position vs your ticket), green is money actually received.
 * Bars grow from the "ticket" floor; the dashed line is break-even.
 */
export function CumulativeCashChart({ result }: { result: SimulationResult }) {
  const reduce = useReducedMotion();
  const key = result.input.scenarioKey === "custom" ? "base" : result.input.scenarioKey;
  const ticket = result.input.ticketMad;
  const series = cumulativeSeries(result);

  const minV = -ticket;
  const maxV = Math.max(...series.map((p) => p.positionMad), 0) * 1.12 || ticket * 0.1;
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const y = (v: number) => M.top + plotH - ((v - minV) / (maxV - minV)) * plotH;
  const slot = plotW / series.length;
  const barW = Math.min(56, slot * 0.5);
  const cx = (i: number) => M.left + slot * i + slot / 2;
  const floorY = y(minV);
  const zeroY = y(0);
  const transition = { duration: reduce ? 0 : 0.2, ease: "easeOut" as const };

  const linePoints = series.map((p, i) => `${cx(i)},${y(p.positionMad)}`).join(" ");
  const last = series[series.length - 1];

  return (
    <section aria-labelledby="sim-chart-title" className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 id="sim-chart-title" className="text-lg font-bold text-foreground">
        Your cash, year by year
      </h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        {scenarioLabel(key)} scenario, indicative. Year 0 is your ticket going out; the sale happens in year{" "}
        {result.input.holdYears}.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-labelledby="sim-chart-svg-title"
        className="h-auto w-full"
      >
        <title id="sim-chart-svg-title">
          Cumulative cash position by year, {scenarioLabel(key)} scenario: starts at {formatMad(-ticket)} and ends at{" "}
          {formatMad(last.positionMad)} after the sale in year {result.input.holdYears}.
        </title>

        {/* break-even */}
        <line
          x1={M.left}
          x2={W - M.right}
          y1={zeroY}
          y2={zeroY}
          className="stroke-muted-foreground"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text x={W - M.right} y={zeroY - 6} textAnchor="end" className="fill-muted-foreground text-[11px]">
          Break-even: your {formatMad(ticket, { decimals: 0 })} back
        </text>

        {/* ticket floor */}
        <line x1={M.left} x2={W - M.right} y1={floorY} y2={floorY} className="stroke-border" strokeWidth={1} />

        {series.map((p, i) => {
          if (p.year === 0) return null;
          const distToDate = p.receivedToDateMad - (p.year === result.input.holdYears ? p.exitMad : 0);
          const distTop = y(minV + distToDate);
          const top = y(p.positionMad);
          return (
            <g key={p.year}>
              {/* money received from yearly distributions */}
              <motion.rect
                x={cx(i) - barW / 2}
                width={barW}
                rx={3}
                className="fill-success"
                initial={false}
                animate={{ y: distTop, height: Math.max(floorY - distTop, 0) }}
                transition={transition}
              />
              {/* sale proceeds, stacked on top, same colour but lighter */}
              {p.exitMad > 0 && (
                <motion.rect
                  x={cx(i) - barW / 2}
                  width={barW}
                  rx={3}
                  className="fill-success/45"
                  initial={false}
                  animate={{ y: top, height: Math.max(distTop - top, 0) }}
                  transition={transition}
                />
              )}
            </g>
          );
        })}

        {/* ink line: where you stand against your ticket */}
        <polyline
          points={linePoints}
          fill="none"
          className="stroke-foreground"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {series.map((p, i) => (
          <circle key={p.year} cx={cx(i)} cy={y(p.positionMad)} r={4} className="fill-card stroke-foreground" strokeWidth={2} />
        ))}

        {/* labels */}
        <text x={cx(0)} y={y(series[0].positionMad) + 22} textAnchor="middle" className="financial-number fill-foreground text-[11px] font-semibold">
          {formatMad(series[0].positionMad, { decimals: 0 })}
        </text>
        <text x={cx(series.length - 1)} y={y(last.positionMad) - 12} textAnchor="end" className="financial-number fill-foreground text-[12px] font-semibold">
          {formatMad(last.positionMad, { decimals: 0 })} net
        </text>
        {series.map((p, i) => (
          <text key={p.year} x={cx(i)} y={H - 16} textAnchor="middle" className="fill-muted-foreground text-[12px]">
            {p.year === 0 ? "Year 0" : p.year === result.input.holdYears ? `Year ${p.year} · sale` : `Year ${p.year}`}
          </text>
        ))}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-5 bg-foreground" aria-hidden="true" /> Your position against your ticket
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-success" aria-hidden="true" /> Cash received
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-success/45" aria-hidden="true" /> Your share of the sale
        </li>
      </ul>

      <table className="sr-only">
        <caption>Cumulative cash by year</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Received this year</th>
            <th scope="col">Position against your ticket</th>
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.year}>
              <th scope="row">{p.year}</th>
              <td>{formatMad(p.receivedMad)}</td>
              <td>{formatMad(p.positionMad)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
