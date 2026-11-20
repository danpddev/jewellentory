import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Gemstone = {
  id: string;
  name: string;
  pricePerCarat: number;
};

export type AppState = {
  metals: { gold: number; silver: number };
  laborRates: { design: number; modeling3D: number; manual: number };
  consumables: { economyResin: number; premiumResin: number };
  finishes: { platinum: number; rhodium: number; sandblasting: number };
  settings: { normal: number; complex: number };
  profit: { markup: number };
  gemstones: Gemstone[];
  quotation: {
    merchantRegistration: string;
    taxRate: string;
    transport: string;
    engraving: string;
  };

  // Actions
  updateMetal: (metal: keyof AppState['metals'], value: number) => void;
  updateLaborRate: (role: keyof AppState['laborRates'], value: number) => void;
  updateConsumable: (type: keyof AppState['consumables'], value: number) => void;
  updateFinish: (type: keyof AppState['finishes'], value: number) => void;
  updateSetting: (type: keyof AppState['settings'], value: number) => void;
  updateProfit: (type: keyof AppState['profit'], value: number) => void;
  updateQuotationSetting: (field: keyof AppState['quotation'], value: string) => void;
  addGemstone: (gemstone: Gemstone) => void;
  updateGemstone: (id: string, pricePerCarat: number) => void;
  removeGemstone: (id: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      metals: { gold: 80, silver: 1 },
      laborRates: { design: 20, modeling3D: 30, manual: 15 },
      consumables: { economyResin: 2, premiumResin: 5 },
      finishes: { platinum: 50, rhodium: 40, sandblasting: 10 },
      settings: { normal: 5, complex: 15 },
      profit: { markup: 30 },
      quotation: { merchantRegistration: '', taxRate: '0', transport: '0', engraving: '0' },
      gemstones: [
        { id: '1', name: 'Diamante', pricePerCarat: 1000 },
        { id: '2', name: 'Esmeralda', pricePerCarat: 800 },
        { id: '3', name: 'Rubí', pricePerCarat: 600 },
        { id: '4', name: 'Zafiro', pricePerCarat: 500 },
        { id: '5', name: 'Amatista', pricePerCarat: 50 },
        { id: '6', name: 'Topacio', pricePerCarat: 60 },
        { id: '7', name: 'Citrino', pricePerCarat: 40 },
      ],

      updateMetal: (metal, value) =>
        set((state) => ({ metals: { ...state.metals, [metal]: value } })),
      updateLaborRate: (role, value) =>
        set((state) => ({ laborRates: { ...state.laborRates, [role]: value } })),
      updateConsumable: (type, value) =>
        set((state) => ({ consumables: { ...state.consumables, [type]: value } })),
      updateFinish: (type, value) =>
        set((state) => ({ finishes: { ...state.finishes, [type]: value } })),
      updateSetting: (type, value) =>
        set((state) => ({ settings: { ...state.settings, [type]: value } })),
      updateProfit: (type, value) =>
        set((state) => ({ profit: { ...state.profit, [type]: value } })),
      updateQuotationSetting: (field, value) =>
        set((state) => ({ quotation: { ...state.quotation, [field]: value } })),
      addGemstone: (gemstone) =>
        set((state) => ({ gemstones: [...state.gemstones, gemstone] })),
      updateGemstone: (id, pricePerCarat) =>
        set((state) => ({
          gemstones: state.gemstones.map((gem) =>
            gem.id === id ? { ...gem, pricePerCarat } : gem
          ),
        })),
      removeGemstone: (id) =>
        set((state) => ({
          gemstones: state.gemstones.filter((gem) => gem.id !== id),
        })),
    }),
    {
      name: 'pricemerald-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
