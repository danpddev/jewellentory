import { formatCop, type Finish, type QuotationPricing } from './pricing';
import { tamsaLogo } from './tamsaLogo';

export type QuotationDocument = {
  clientName: string;
  merchantRegistration: string;
  pieceName: string;
  metalName: string;
  finishes: Record<Finish, boolean>;
  pricing: QuotationPricing;
};

const bogotaCalendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function quotationDates(now: Date) {
  const parts = bogotaCalendar.formatToParts(now);
  const year = Number(parts.find(({ type }) => type === 'year')?.value);
  const month = Number(parts.find(({ type }) => type === 'month')?.value);
  const day = Number(parts.find(({ type }) => type === 'day')?.value);
  return {
    issued: new Date(Date.UTC(year, month - 1, day)),
    expires: new Date(Date.UTC(year, month - 1, day + 30)),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function createQuotationHtml(
  quote: QuotationDocument,
  folio: string,
  now: Date,
  locale: string,
  translate: (key: string, options?: Record<string, string>) => string,
): string {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const number = new Intl.NumberFormat(locale, { maximumSignificantDigits: 20 });
  const { issued, expires } = quotationDates(now);
  const { pricing } = quote;
  const label = (key: string, options?: Record<string, string>) =>
    escapeHtml(translate(`quotation.pdf.${key}`, options));
  const row = (name: string, detail: string, quantity: number, unit: number, subtotal: number) => `
    <tr>
      <td><strong>${escapeHtml(name)}</strong><small>${detail}</small></td>
      <td class="quantity">${number.format(quantity)}</td>
      <td class="money">${formatCop(unit)}</td>
      <td class="money"><strong>${formatCop(subtotal)}</strong></td>
    </tr>`;
  const finishLabels = Object.entries(quote.finishes).map(([finish, enabled]) => `
    <div class="finish">
      <span>${escapeHtml(translate(`quotation.finishesOptions.${finish}`))}</span>
      <strong>${label(enabled ? 'yes' : 'no')}</strong>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8">
  <title>Tamsa-${escapeHtml(folio)}</title>
  <style>
    @page { size: letter portrait; margin: 0.55in; }
    * { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    body { margin: 0; color: #353838; background: #fff; font: 12px/1.5 Arial, Helvetica, sans-serif; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 28px; border-top: 5px solid #149749; padding: 25px 0 22px; break-inside: avoid; }
    h1, h2, p { margin: 0; }
    h1 { margin-bottom: 15px; color: #149749; font-size: 38px; line-height: 1.08; letter-spacing: -1.2px; }
    h2 { margin-bottom: 8px; font-size: 13px; }
    .client { font-size: 16px; font-weight: 700; overflow-wrap: anywhere; }
    .label, small { color: #555d59; }
    .issuer { text-align: right; flex: 0 0 46%; overflow-wrap: anywhere; }
    .issuer svg { width: 145px; height: auto; margin-bottom: 8px; display: inline-block; }
    .issuer strong { display: block; }
    .issuer .folio { margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 4px; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    th { background: #353838; color: #fff; font-size: 11px; font-weight: 700; }
    td, th { padding: 10px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
    td { background: #f3f6f3; border-bottom: 2px solid #fff; }
    tbody tr:nth-child(even) td { background: #edf1ed; }
    td small { display: block; margin-top: 3px; font-size: 10px; }
    .quantity { text-align: center; width: 13%; }
    .money { text-align: right; font-variant-numeric: tabular-nums; width: 20%; }
    .summary { width: 58%; margin: 16px 0 24px auto; break-inside: avoid; }
    .summary-line { display: flex; justify-content: space-between; gap: 10px; padding: 3px 0; }
    .total { margin-top: 7px; padding: 8px 10px; background: #353838; color: #fff; border-left: 5px solid #D4CA30; font-size: 15px; font-weight: 700; }
    .finishes { display: flex; gap: 8px; break-inside: avoid; }
    .finish { flex: 1; padding: 7px 9px; border: 1px solid #e0e7e1; }
    .finish strong { display: block; }
    .closing { break-inside: avoid; }
    .validity { margin-top: 18px; border-bottom: 4px solid #D4CA30; padding: 11px 12px; background: #f3f6f3; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>${label('title')}</h1>
      <p class="label">${label('client')}</p>
      <p class="client">${escapeHtml(quote.clientName)}</p>
    </div>
    <div class="issuer">
      ${tamsaLogo}
      <strong>Daniel Enrique Puerto Daza</strong>
      <p>${label('merchant', { registration: quote.merchantRegistration })}</p>
      <strong class="folio">${label('folio')} ${escapeHtml(folio)}</strong>
      <p>${label('date', { date: date.format(issued) })}</p>
    </div>
  </header>
  <table>
    <thead>
      <tr>
        <th scope="col">${label('description')}</th>
        <th scope="col" class="quantity">${label('quantity')}</th>
        <th scope="col" class="money">${label('unitPrice')}</th>
        <th scope="col" class="money">${label('subtotal')}</th>
      </tr>
    </thead>
    <tbody>
      ${row(quote.pieceName, label('metalDetail', { metal: quote.metalName }), pricing.pieces, pricing.metalUnitCents, pricing.metalSubtotalCents)}
      ${pricing.gems.map((gem) => row(
        gem.name || translate('quotation.gemstone'),
        gem.carats === null
          ? label('manualStoneDetail', { count: number.format(gem.perPiece) })
          : label('stoneDetail', { carats: number.format(gem.carats), count: number.format(gem.perPiece) }),
        gem.quantity,
        gem.unitCents,
        gem.subtotalCents,
      )).join('')}
    </tbody>
  </table>
  <section class="summary">
    <div class="summary-line"><span>${label('piecesSubtotal')}</span><strong>${formatCop(pricing.metalSubtotalCents)}</strong></div>
    <div class="summary-line"><span>${label('gemsSubtotal')}</span><strong>${formatCop(pricing.gemSubtotalCents)}</strong></div>
    <div class="summary-line total"><span>${label('total')}</span><span>${formatCop(pricing.totalCents)}</span></div>
  </section>
  <section class="closing">
    <h2>${label('finishes')}</h2>
    <div class="finishes">${finishLabels}</div>
    <p class="validity"><strong>${label('validity')}</strong> ${label('expiry', { date: date.format(expires) })}</p>
  </section>
</body>
</html>`;
}
