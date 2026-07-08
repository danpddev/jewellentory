import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <Box pr="$4">
      <Button size="sm" variant="outline" onPress={toggleLanguage}>
        <ButtonText>{i18n.language.toUpperCase()}</ButtonText>
      </Button>
    </Box>
  );
}
