import { FEE_LINES } from "@/lib/finance";
import { feeRateText } from "@/lib/simulator";

/** The public fee grid: who pays what, when. Read from FEE_LINES, never typed by hand. */
export default function FeeGridTable() {
  return (
    <div>
      {/* Small screens: one card per fee, so nothing scrolls sideways. */}
      <ul className="divide-y divide-border rounded-3xl border border-border bg-card sm:hidden">
        {FEE_LINES.map((line) => (
          <li key={line.code} className="space-y-1 p-4">
            <p className="text-sm font-semibold text-foreground">
              <span className="mr-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                {line.code}
              </span>
              {line.label}
            </p>
            <p className="financial-number text-sm font-semibold text-foreground">{feeRateText(line)}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Paid by {line.paidBy.toLowerCase()} · {line.when.toLowerCase()}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-3xl border border-border bg-card sm:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">IGUDAR fee grid: who pays what, and when</caption>
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Fee</th>
              <th scope="col" className="px-5 py-3 font-semibold">Paid by</th>
              <th scope="col" className="px-5 py-3 font-semibold">Rate</th>
              <th scope="col" className="px-5 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FEE_LINES.map((line) => (
              <tr key={line.code} className="align-top">
                <th scope="row" className="px-5 py-4 font-semibold text-foreground">
                  <span className="mr-2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                    {line.code}
                  </span>
                  {line.label}
                </th>
                <td className="px-5 py-4 text-muted-foreground">{line.paidBy}</td>
                <td className="financial-number px-5 py-4 font-semibold text-foreground">{feeRateText(line)}</td>
                <td className="px-5 py-4 text-muted-foreground">{line.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
