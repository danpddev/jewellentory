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
import { useAppStore } from '@/src/store/useAppStore';
import { Trash } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

type SelectedGem = {
  id: string;
  gemId: string;
  carats: string;
};

export default function QuotationScreen() {
  const { t } = useTranslation();
  const store = useAppStore();

  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [metal, setMetal] = useState('gold');
  const [metalWeight, setMetalWeight] = useState('1');
  const [resinType, setResinType] = useState('economyResin');
  
  const defaultManHours = store.laborRates.design + store.laborRates.manual;
  const [manHours, setManHours] = useState(defaultManHours.toString());
  
  const [settingType, setSettingType] = useState('normal');
  const [usePlatinum, setUsePlatinum] = useState(false);
  const [useRhodium, setUseRhodium] = useState(false);
  const [useSandblasting, setUseSandblasting] = useState(false);

  const [selectedGems, setSelectedGems] = useState<SelectedGem[]>([]);

  useEffect(() => {
    // Keep man hours updated if rates change and user hasn't edited (simplified)
    setManHours((store.laborRates.design + store.laborRates.manual).toString());
  }, [store.laborRates.design, store.laborRates.manual]);

  const addGemRow = () => {
    setSelectedGems([...selectedGems, { id: Date.now().toString(), gemId: store.gemstones[0]?.id || '', carats: '1' }]);
  };

  const updateGemRow = (id: string, field: 'gemId' | 'carats', value: any) => {
    setSelectedGems(selectedGems.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const removeGemRow = (id: string) => {
    setSelectedGems(selectedGems.filter(g => g.id !== id));
  };

  const totalEstimation = useMemo(() => {
    let total = 0;
    
    // Metal
    const weight = parseFloat(metalWeight) || 0;
    const metalPrice = metal === 'gold' ? store.metals.gold : store.metals.silver;
    total += weight * metalPrice;

    // Resin
    total += resinType === 'economyResin' ? store.consumables.economyResin : store.consumables.premiumResin;

    // Labor
    const hours = parseFloat(manHours) || 0;
    // Assuming manHours is the quantity of hours, or is it a flat value? 
    // Wait, the requirement says "sum of preconfigured Design and Polishing rates". We treat it as flat or rate? 
    // We treat it as flat value if the user enters the total labor cost, or we multiply by hours.
    total += hours;

    // Settings
    const stonesCount = selectedGems.length;
    const settingCost = settingType === 'normal' ? store.settings.normal : store.settings.complex;
    total += stonesCount * settingCost;

    // Finishes
    if (usePlatinum) total += store.finishes.platinum;
    if (useRhodium) total += store.finishes.rhodium;
    if (useSandblasting) total += store.finishes.sandblasting;

    // Profit
    const markup = store.profit.markup || 0;
    total = total * (1 + markup / 100);

    // Gemstones
    selectedGems.forEach(g => {
      const gemDef = store.gemstones.find(x => x.id === g.gemId);
      if (gemDef) {
        total += gemDef.pricePerCarat * (parseFloat(g.carats) || 0);
      }
    });

    return total;
  }, [store, metal, metalWeight, resinType, manHours, settingType, usePlatinum, useRhodium, useSandblasting, selectedGems]);

  return (
    <ScrollView style={{ backgroundColor: '#F8F9FA' }}>
      <Box className='px-6'>
        <VStack space="xl">
          <Heading size="xl" color="#059669">{t('quotation.title')}</Heading>
          
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
              <InputField placeholder={t('quotation.name')} value={name} onChangeText={setName} />
            </Input>

            <Input variant="outline" size="md">
              <InputField placeholder={t('quotation.clientName')} value={clientName} onChangeText={setClientName} />
            </Input>
          </VStack>

          <Divider my="$2" />

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.metal')}</Text>
            <HStack space="md">
              <Select flex={1} onValueChange={setMetal}>
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
              <Input variant="outline" size="md" flex={1}>
                <InputField placeholder="Gramos" keyboardType="numeric" value={metalWeight} onChangeText={setMetalWeight} />
              </Input>
            </HStack>
          </VStack>

          <Divider my="$2" />

          <VStack space="md">
            <VStack justifycontent="space-between" alignitems="center">
              <Text size="sm" bold>{t('quotation.gemstone')}</Text>
            </VStack>
            
            {selectedGems.map((g, index) => (
              <HStack key={g.id} space="sm" alignitems="center">
                <Select flex={2} onValueChange={(val) => updateGemRow(g.id, 'gemId', val)}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Gema" value={store.gemstones.find(x => x.id === g.gemId)?.name || ''} />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      {store.gemstones.map(gem => (
                        <SelectItem key={gem.id} label={gem.name} value={gem.id} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <Input variant="outline" size="md" flex={1}>
                  <InputField placeholder={t('quotation.carats')} keyboardType="decimal-pad" value={g.carats} onChangeText={(val) => updateGemRow(g.id, 'carats', val)} />
                </Input>
                <Button size="sm" flex={0.3} action="negative" variant="outline" onPress={() => removeGemRow(g.id)}>
                  <ButtonIcon as={Trash} />
                </Button>
              </HStack>
            ))}
            <VStack justifycontent="space-between" alignitems="center">
              <Button size="sm" onPress={addGemRow} bg="#d1b82a">
                <ButtonText>{t('quotation.addGemstone')}</ButtonText>
              </Button>
            </VStack>
            {selectedGems.length > 0 && (
              <Text size="xs" color="$textLight500">
                Costo de engaste estimado: ${selectedGems.length * (settingType === 'normal' ? store.settings.normal : store.settings.complex)}
              </Text>
            )}
          </VStack>

          <Divider my="$2" />

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.resinType')}</Text>
            <Select onValueChange={setResinType}>
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
              <InputField keyboardType="numeric" value={manHours} onChangeText={setManHours} />
            </Input>
          </VStack>

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.settingType')}</Text>
            <Select onValueChange={setSettingType}>
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

          <Divider my="$2" />

          <VStack space="md">
            <Text size="sm" bold>{t('quotation.finishes')}</Text>
            <HStack justifycontent="space-between" alignitems="center">
              <Text size="sm">{t('quotation.finishesOptions.platinum')}</Text>
              <Switch size="sm" value={usePlatinum} onValueChange={setUsePlatinum} />
            </HStack>
            <HStack justifycontent="space-between" alignitems="center">
              <Text size="sm">{t('quotation.finishesOptions.rhodium')}</Text>
              <Switch size="sm" value={useRhodium} onValueChange={setUseRhodium} />
            </HStack>
            <HStack justifycontent="space-between" alignitems="center">
              <Text size="sm">{t('quotation.finishesOptions.sandblasting')}</Text>
              <Switch size="sm" value={useSandblasting} onValueChange={setUseSandblasting} />
            </HStack>
          </VStack>

          <Box mt="$6" p="$4" bg="#059669" borderradius="$md">
            <VStack space="sm" alignitems="center">
              <Text color="white" size="md" bold>{t('quotation.totalEstimation')}</Text>
              <Text color="white" size="3xl" bold>${totalEstimation.toFixed(2)}</Text>
            </VStack>
          </Box>
          <Box h={40} />
        </VStack>
      </Box>
    </ScrollView>
  );
}
