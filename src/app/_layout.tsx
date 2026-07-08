import "@/assets/global.css";
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Stack } from "expo-router";
import '../i18n'; // Initialize i18n

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}
