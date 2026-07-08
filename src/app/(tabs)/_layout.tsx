import { Icon } from '@/components/ui/icon';
import LanguageSelector from '@/src/components/LanguageSelector';
import { Tabs } from 'expo-router';
import { Calculator, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerRight: () => <LanguageSelector />,
        headerStyle: {
          backgroundColor: '#F8F9FA',
        },
        tabBarStyle: {
          backgroundColor: '#F8F9FA',
        },
        tabBarActiveTintColor: '#059669',
        headerTintColor: '#059669',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.quotation'),
          tabBarIcon: ({ color }) => <Icon as={Calculator} color={color} size="md" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color }) => <Icon as={Settings} color={color} size="md" />,
        }}
      />
    </Tabs>
  );
}
