import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Gemstone, useAppStore } from '@/src/store/useAppStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const store = useAppStore();

  const [newGemName, setNewGemName] = useState('');
  const [newGemPrice, setNewGemPrice] = useState('');

  const handleAddGemstone = () => {
    if (newGemName && newGemPrice) {
      store.addGemstone({
        id: Date.now().toString(),
        name: newGemName,
        pricePerCarat: parseFloat(newGemPrice) || 0,
      });
      setNewGemName('');
      setNewGemPrice('');
    }
  };

  const renderInput = (label: string, value: number, onChange: (val: number) => void) => (
    <HStack space="md" alignitems="center" justifycontent="space-between" className='py-2'>
      <Text flex={1} size="sm">{label}</Text>
      <Input variant="outline" size="md" flex={1}>
        <InputField
          keyboardType="numeric"
          value={value.toString()}
          onChangeText={(text) => onChange(parseFloat(text) || 0)}
        />
      </Input>
    </HStack>
  );

  return (
    <ScrollView style={{ backgroundColor: '#F8F9FA' }}>
      <Box className='px-6'>
        <VStack space="xl">
          {/* Metals */}
          <Box>
            <Heading size="md" color="#059669">{t('settings.metals')}</Heading>
            <Divider my="$2" />
            {renderInput(t('settings.gold'), store.metals.gold, (v) => store.updateMetal('gold', v))}
            {renderInput(t('settings.silver'), store.metals.silver, (v) => store.updateMetal('silver', v))}
          </Box>

          {/* Labor Rates */}
          <Box>
            <Heading size="md" color="#059669">{t('settings.laborRates')}</Heading>
            <Divider my="$2" />
            {renderInput(t('settings.design'), store.laborRates.design, (v) => store.updateLaborRate('design', v))}
            {renderInput(t('settings.modeling3D'), store.laborRates.modeling3D, (v) => store.updateLaborRate('modeling3D', v))}
            {renderInput(t('settings.manual'), store.laborRates.manual, (v) => store.updateLaborRate('manual', v))}
          </Box>

          {/* Consumables */}
          <Box>
            <Heading size="md" color="#059669">{t('settings.consumables')}</Heading>
            <Divider my="$2" />
            {renderInput(t('settings.economyResin'), store.consumables.economyResin, (v) => store.updateConsumable('economyResin', v))}
            {renderInput(t('settings.premiumResin'), store.consumables.premiumResin, (v) => store.updateConsumable('premiumResin', v))}
          </Box>

          {/* Finishes */}
          <Box>
            <Heading size="md" color="#059669">{t('settings.finishes')}</Heading>
            <Divider my="$2" />
            {renderInput(t('settings.platinum'), store.finishes.platinum, (v) => store.updateFinish('platinum', v))}
            {renderInput(t('settings.rhodium'), store.finishes.rhodium, (v) => store.updateFinish('rhodium', v))}
            {renderInput(t('settings.sandblasting'), store.finishes.sandblasting, (v) => store.updateFinish('sandblasting', v))}
          </Box>

          {/* Setting Costs */}
          <Box>
            <Heading size="md" color="#059669">{t('settings.settingCosts')}</Heading>
            <Divider my="$2" />
            {renderInput(t('settings.normalSetting'), store.settings.normal, (v) => store.updateSetting('normal', v))}
            {renderInput(t('settings.complexSetting'), store.settings.complex, (v) => store.updateSetting('complex', v))}
          </Box>

          {/* Gemstones */}
          <Box>
            <Heading size="md" color="#059669">{t('settings.gemstones')}</Heading>
            <Divider my="$2" />
            {store.gemstones.map((gem: Gemstone) => (
              <HStack key={gem.id} space="md" alignitems="center" justifycontent="space-between" mt="$2">
                <Text flex={1} size="sm">{gem.name}</Text>
                <Input variant="outline" size="md" flex={1}>
                  <InputField
                    keyboardType="numeric"
                    value={gem.pricePerCarat.toString()}
                    onChangeText={(text) => store.updateGemstone(gem.id, parseFloat(text) || 0)}
                  />
                </Input>
              </HStack>
            ))}

            {/* Add New Gemstone */}
            <VStack space="md" mt="$4" p="$3" style={{ backgroundColor: '#fff', borderradius: 8 }}>
              <Text bold size="sm">{t('settings.addGemstone')}</Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder={t('settings.gemName')}
                  value={newGemName}
                  onChangeText={setNewGemName}
                />
              </Input>
              <Input variant="outline" size="md">
                <InputField
                  placeholder={t('settings.gemPrice')}
                  keyboardType="numeric"
                  value={newGemPrice}
                  onChangeText={setNewGemPrice}
                />
              </Input>
              <Button onPress={handleAddGemstone} bg="#d1b82a">
                <ButtonText>{t('settings.save')}</ButtonText>
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </ScrollView>
  );
}
