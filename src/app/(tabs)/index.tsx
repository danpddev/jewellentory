import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Select, SelectBackdrop, SelectContent, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { createQuotationHtml, quotationDates, type QuotationDocument } from '@/src/quotation/document';
import { exportQuotationPdf } from '@/src/quotation/exportPdf';
import { reserveQuotationFolio } from '@/src/quotation/folio';
import { calculateQuotation, formatCop, type Finish, type SelectedGem } from '@/src/quotation/pricing';
import { useAppStore } from '@/src/store/useAppStore';
import { FileText, Trash } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView } from 'react-native';

export default function QuotationScreen() {
  const { t, i18n } = useTranslation();
  const store = useAppStore();

  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [metal, setMetal] = useState<'gold' | 'silver'>('gold');
  const [metalWeight, setMetalWeight] = useState('1');
  const [pieceQuantity, setPieceQuantity] = useState('1');
  const [resinType, setResinType] = useState<'economyResin' | 'premiumResin'>('economyResin');
  
  const defaultManHours = store.laborRates.design + store.laborRates.manual;
  const [manHours, setManHours] = useState(defaultManHours.toString());
  
  const [settingType, setSettingType] = useState<'normal' | 'complex'>('normal');
  const [finishes, setFinishes] = useState<Record<Finish, boolean>>({
    platinum: false,
    rhodium: false,
    engraving: false,
    sandblasting: false,
  });

  const [selectedGems, setSelectedGems] = useState<SelectedGem[]>([]);
  const gemRowId = useRef(0);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const exportInProgress = useRef(false);
  const lastDocument = useRef<{ signature: string; folio: string } | null>(null);

  useEffect(() => {
    // Keep man hours updated if rates change and user hasn't edited (simplified)
    setManHours((store.laborRates.design + store.laborRates.manual).toString());
  }, [store.laborRates.design, store.laborRates.manual]);

  const addGemRow = () => {
    const gem: SelectedGem = {
      id: String(++gemRowId.current),
      gemId: store.gemstones[0]?.id ?? '',
      carats: '1',
      gemNumber: '1',
    };
    setSelectedGems((rows) => [...rows, gem]);
  };

  const updateGemRow = (id: string, changes: Partial<Omit<SelectedGem, 'id'>>) => {
    setSelectedGems((rows) => rows.map((gem) => gem.id === id ? { ...gem, ...changes } : gem));
  };

  const removeGemRow = (id: string) => {
    setSelectedGems((rows) => rows.filter((gem) => gem.id !== id));
  };

  const pricing = calculateQuotation(store, {
    metal, metalWeight, pieceQuantity, laborCost: manHours, resinType, settingType, finishes, selectedGems,
  });

  async function handleExport() {
    if (exportInProgress.current) return;
    const registration = store.quotation.merchantRegistration.trim();
    if (!clientName.trim() || !registration || !pricing.valid) {
      const error = !clientName.trim()
        ? 'missingClient'
        : !registration ? 'missingRegistration' : 'invalidAmounts';
      setExportError(error);
      return;
    }

    exportInProgress.current = true;
    setExporting(true);
    setExportError('');
    try {
      const now = new Date();
      const locale = i18n.resolvedLanguage === 'es' ? 'es-CO' : 'en';
      const quote: QuotationDocument = {
        clientName: clientName.trim(),
        merchantRegistration: registration,
        pieceName: name.trim() || (category ? t(`quotation.categories.${category}`) : t('quotation.genericPiece')),
        metalName: t(`quotation.metals.${metal}`),
        finishes,
        pricing,
      };
      const signature = JSON.stringify([locale, quotationDates(now).issued, quote]);
      if (lastDocument.current?.signature !== signature) {
        lastDocument.current = { signature, folio: await reserveQuotationFolio() };
      }
      const { folio } = lastDocument.current;
      const html = createQuotationHtml(quote, folio, now, locale, t);
      await exportQuotationPdf(html, folio, t('quotation.exportPdf'));
    } catch (error) {
      console.warn('Quotation PDF export failed', error);
      setExportError('exportFailed');
    } finally {
      exportInProgress.current = false;
      setExporting(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: '#F8F9FA' }} keyboardShouldPersistTaps="handled">
      <Box className="px-6 py-5">
        <VStack space="xl">
          <Heading size="xl" className="text-[#149749]">{t('quotation.title')}</Heading>
          
          <VStack space="md">
            <Text size="sm" bold>{t('quotation.jewelryCategory')}</Text>
            <Select onValueChange={setCategory}>
              <SelectTrigger variant="outline" size="md">
                <SelectInput placeholder={t('quotation.jewelryCategory')} value={category ? t(`quotation.categories.${category}`) : t('quotation.jewelryCategory')} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectItem label={t('quotation.categories.rings')} value="rings" />
                  <SelectItem label={t('quotation.categories.earrings')} value="earrings" />
                  <SelectItem label={t('quotation.categories.bracelets')} value="bracelets" />
                  <SelectItem label={t('quotation.categories.pendants')} value="pendants" />
                </SelectContent>
              </SelectPortal>
            </Select>

            <Input variant="outline" size="md">
              <InputField aria-label={t('quotation.name')} placeholder={t('quotation.name')} maxLength={120} value={name} onChangeText={setName} />
            </Input>

            <Input variant="outline" size="md">
              <InputField aria-label={t('quotation.clientName')} placeholder={t('quotation.clientName')} maxLength={120} value={clientName} onChangeText={setClientName} />
            </Input>

            <VStack space="xs">
              <Text size="sm" bold>{t('quotation.pieceQuantity')}</Text>
              <Input variant="outline" size="md">
                <InputField aria-label={t('quotation.pieceQuantity')} keyboardType="number-pad" value={pieceQuantity} onChangeText={setPieceQuantity} />
              </Input>
            </VStack>
          </VStack>

          <Divider />

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.metal')}</Text>
            <HStack space="md">
              <Select className="flex-1" onValueChange={(value) => setMetal(value as typeof metal)}>
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder={t('quotation.metal')} value={t(`quotation.metals.${metal}`) || metal} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectItem label={t('quotation.metals.gold')} value="gold" />
                    <SelectItem label={t('quotation.metals.silver')} value="silver" />
                  </SelectContent>
                </SelectPortal>
              </Select>
              <Input variant="outline" size="md" className="flex-1">
                <InputField aria-label={t('quotation.weightPerPiece')} placeholder={t('quotation.weightPerPiece')} keyboardType="decimal-pad" value={metalWeight} onChangeText={setMetalWeight} />
              </Input>
            </HStack>
          </VStack>

          <Divider />

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.gemsPerPiece')}</Text>
            
            {selectedGems.map((gem) => {
              const pricingMode = gem.pricingMode ?? 'carat';
              const manual = pricingMode === 'manual';
              const amountLabel = t(manual ? 'quotation.manualGemPrice' : 'quotation.carats');
              const quantityLabel = t('quotation.gemNumber');
              return (
                <VStack key={gem.id} space="sm" className="rounded-lg border border-outline-200 bg-white p-3">
                  <HStack space="sm" className="items-center">
                    {(['carat', 'manual'] as const).map((mode) => {
                      const selected = mode === pricingMode;
                      return (
                        <Button
                          key={mode}
                          size="sm"
                          variant={selected ? 'solid' : 'outline'}
                          className={selected ? 'flex-1 bg-[#17683a] px-2' : 'flex-1 border-[#149749] px-2'}
                          accessibilityState={{ selected }}
                          onPress={() => updateGemRow(gem.id, { pricingMode: mode })}
                        >
                          <ButtonText className={selected ? 'text-white' : 'text-[#17683a]'}>
                            {t(`quotation.gemPricingMode.${mode}`)}
                          </ButtonText>
                        </Button>
                      );
                    })}
                    <Button size="sm" accessibilityLabel={t('quotation.remove')} className="px-2" action="negative" variant="outline" onPress={() => removeGemRow(gem.id)}>
                      <ButtonIcon as={Trash} />
                    </Button>
                  </HStack>

                  {manual ? (
                    <Input variant="outline" size="md">
                      <InputField
                        aria-label={t('quotation.manualGemName')}
                        placeholder={t('quotation.manualGemName')}
                        value={gem.manualName ?? ''}
                        maxLength={120}
                        onChangeText={(value) => updateGemRow(gem.id, { manualName: value })}
                      />
                    </Input>
                  ) : (
                    <Select selectedValue={gem.gemId} onValueChange={(gemId) => updateGemRow(gem.id, { gemId })}>
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder={t('quotation.gemstone')} value={store.gemstones.find((entry) => entry.id === gem.gemId)?.name ?? ''} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          {store.gemstones.map((entry) => (
                            <SelectItem key={entry.id} label={entry.name} value={entry.id} />
                          ))}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  )}

                  <HStack space="sm" className="items-end">
                    <VStack space="xs" className="flex-[2]">
                      <Text size="xs">{amountLabel}</Text>
                      <Input variant="outline" size="md">
                        <InputField
                          key={pricingMode}
                          aria-label={amountLabel}
                          keyboardType="decimal-pad"
                          value={manual ? gem.manualUnitPrice ?? '' : gem.carats}
                          onChangeText={(value) => updateGemRow(gem.id, manual ? { manualUnitPrice: value } : { carats: value })}
                        />
                      </Input>
                    </VStack>
                    <VStack space="xs" className="flex-1">
                      <Text size="xs">{quantityLabel}</Text>
                      <Input variant="outline" size="md">
                        <InputField
                          aria-label={quantityLabel}
                          keyboardType="number-pad"
                          value={gem.gemNumber}
                          onChangeText={(gemNumber) => updateGemRow(gem.id, { gemNumber })}
                        />
                      </Input>
                    </VStack>
                  </HStack>
                </VStack>
              );
            })}
            <Button size="sm" variant="outline" className="self-start border-[#149749]" onPress={addGemRow}>
              <ButtonText className="text-[#17683a]">{t('quotation.addGemstone')}</ButtonText>
            </Button>
            {selectedGems.length > 0 && (
              <Text size="xs">
                {t('quotation.settingPerPiece')} {formatCop(Math.round(pricing.settingCost * 100))}
              </Text>
            )}
          </VStack>

          <Divider />

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.resinType')}</Text>
            <Select onValueChange={(value) => setResinType(value as typeof resinType)}>
              <SelectTrigger variant="outline" size="md">
                <SelectInput placeholder={t('quotation.resinType')} value={t(`quotation.resins.${resinType.replace('Resin', '')}`) || resinType} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectItem label={t('quotation.resins.economy')} value="economyResin" />
                  <SelectItem label={t('quotation.resins.premium')} value="premiumResin" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.manHours')} ($)</Text>
            <Input variant="outline" size="md">
              <InputField aria-label={t('quotation.manHours')} keyboardType="decimal-pad" value={manHours} onChangeText={setManHours} />
            </Input>
          </VStack>

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.settingType')}</Text>
            <Select onValueChange={(value) => setSettingType(value as typeof settingType)}>
              <SelectTrigger variant="outline" size="md">
                <SelectInput placeholder={t('quotation.settingType')} value={t(`quotation.settings.${settingType}`) || settingType} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectItem label={t('quotation.settings.normal')} value="normal" />
                  <SelectItem label={t('quotation.settings.complex')} value="complex" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <Divider />

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.finishes')}</Text>
            {(Object.keys(finishes) as Finish[]).map((finish) => {
              const label = t(`quotation.finishesOptions.${finish}`);
              return (
                <HStack key={finish} className="items-center justify-between">
                  <Text size="sm">{label}</Text>
                  <Switch
                    accessibilityLabel={label}
                    size="sm"
                    value={finishes[finish]}
                    onValueChange={(enabled) => setFinishes((values) => ({ ...values, [finish]: enabled }))}
                  />
                </HStack>
              );
            })}
          </VStack>

          <VStack space="md">
            <VStack space="xs" className="rounded-lg border-l-4 border-[#D4CA30] bg-[#353838] p-4">
              <HStack className="justify-between" space="sm">
                <Text size="sm" className="text-white">{t('quotation.pdf.piecesSubtotal')}</Text>
                <Text size="sm" className="text-white">{formatCop(pricing.metalSubtotalCents)}</Text>
              </HStack>
              <HStack className="justify-between" space="sm">
                <Text size="sm" className="text-white">{t('quotation.pdf.gemsSubtotal')}</Text>
                <Text size="sm" className="text-white">{formatCop(pricing.gemSubtotalCents)}</Text>
              </HStack>
              <Text size="sm" bold className="mt-2 text-white">{t('quotation.pdf.total')}</Text>
              <Text size="2xl" bold className="text-white">{formatCop(pricing.totalCents)}</Text>
            </VStack>
            <Button className="bg-[#17683a]" onPress={handleExport} isDisabled={exporting}>
              <ButtonIcon as={FileText} />
              <ButtonText>{t(exporting ? 'quotation.exporting' : Platform.OS === 'web' ? 'quotation.savePdf' : 'quotation.exportPdf')}</ButtonText>
            </Button>
            {exportError ? (
              <Text accessibilityLiveRegion="polite" size="sm" className="text-red-700">
                {t(`quotation.errors.${exportError}`)}
              </Text>
            ) : null}
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
}
