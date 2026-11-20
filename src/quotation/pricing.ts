import type { AppState } from '../store/useAppStore';

export type SelectedGem = {
  id: string;
  gemId: string;
  carats: string;
  gemNumber: string;
  pricingMode?: 'carat' | 'manual';
  manualName?: string;
  manualUnitPrice?: string;
};

export type Finish = 'platinum' | 'rhodium' | 'sandblasting' | 'engraving';

type QuotationInputs = {
  metal: keyof AppState['metals'];
  metalWeight: string;
  resinType: keyof AppState['consumables'];
  laborCost: string;
  settingType: keyof AppState['settings'];
  finishes: Record<Finish, boolean>;
  pieceQuantity: string;
  selectedGems: SelectedGem[];
};

export function readAmount(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}

export function calculateQuotation(store: AppState, inputs: QuotationInputs) {
  const pieceQuantity = readAmount(inputs.pieceQuantity);
  const metalWeight = readAmount(inputs.metalWeight);
  const laborCost = readAmount(inputs.laborCost || '0');
  const taxRate = readAmount(store.quotation.taxRate || '0');
  const transport = readAmount(store.quotation.transport || '0');
  const engraving = readAmount(store.quotation.engraving || '0');
  const validQuantity = Number.isSafeInteger(pieceQuantity) && pieceQuantity > 0;
  const pieces = validQuantity ? pieceQuantity : 0;
  const gems = inputs.selectedGems.map((gem) => {
    const perPiece = readAmount(gem.gemNumber);
    const validCount = Number.isSafeInteger(perPiece) && perPiece > 0;
    const quantity = (validCount ? perPiece : 0) * pieces;
    const manual = gem.pricingMode === 'manual';
    const definition = manual ? undefined : store.gemstones.find((entry) => entry.id === gem.gemId);
    const carats = manual ? null : readAmount(gem.carats);
    const unitPrice = manual
      ? readAmount(gem.manualUnitPrice ?? '')
      : (definition?.pricePerCarat ?? 0) * (carats || 0);
    const unitCents = Number.isFinite(unitPrice) ? Math.round(unitPrice * 100) : 0;
    const validPrice = Number.isFinite(unitPrice) && unitPrice >= 0 && Number.isSafeInteger(unitCents);
    const validSource = carats === null || (Boolean(definition) && Number.isFinite(carats) && carats > 0);
    return {
      name: manual ? gem.manualName?.trim() ?? '' : definition?.name ?? '',
      carats,
      quantity,
      perPiece,
      unitCents,
      subtotalCents: unitCents * quantity,
      valid: validCount && validPrice && validSource,
    };
  });

  const stonesPerPiece = gems.reduce((sum, gem) => sum + (gem.perPiece || 0), 0);
  const settingCost = stonesPerPiece * store.settings[inputs.settingType];
  const finishCost = (inputs.finishes.platinum ? store.finishes.platinum : 0)
    + (inputs.finishes.rhodium ? store.finishes.rhodium : 0)
    + (inputs.finishes.sandblasting ? store.finishes.sandblasting : 0)
    + (inputs.finishes.engraving ? engraving || 0 : 0);

  const productionCost = (metalWeight || 0) * store.metals[inputs.metal]
    + store.consumables[inputs.resinType] + (laborCost || 0) + settingCost + finishCost + (transport || 0);
  const metalUnitCents = Math.round(productionCost * (1 + store.profit.markup / 100) * (1 + (taxRate || 0) / 100) * 100);
  const metalSubtotalCents = metalUnitCents * pieces;
  const gemSubtotalCents = gems.reduce((sum, gem) => sum + gem.subtotalCents, 0);
  const totalCents = metalSubtotalCents + gemSubtotalCents;

  return {
    pieces,
    gems,
    settingCost,
    metalUnitCents,
    metalSubtotalCents,
    gemSubtotalCents,
    totalCents,
    valid: validQuantity && metalWeight > 0
      && [metalWeight, laborCost, taxRate, transport].every(Number.isFinite)
      && (!inputs.finishes.engraving || Number.isFinite(engraving))
      && gems.every((gem) => gem.valid && Number.isSafeInteger(gem.quantity))
      && metalUnitCents >= 0 && Number.isSafeInteger(totalCents) && totalCents > 0,
  };
}

export type QuotationPricing = ReturnType<typeof calculateQuotation>;

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCop(cents: number): string {
  return cop.format(cents / 100);
}
