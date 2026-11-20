import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

export async function exportQuotationPdf(html: string, folio: string, title: string) {
  if (!(await isAvailableAsync())) {
    throw new Error('File sharing is unavailable');
  }

  const pdf = new File(Paths.cache, `Tamsa-${folio}.pdf`);
  if (!pdf.exists) {
    const { base64 } = await printToFileAsync({
      html,
      width: 612,
      height: 792,
      textZoom: 100,
      base64: true,
    });
    if (!base64) {
      throw new Error('Expo Print returned an empty PDF');
    }

    // Expo Go can render into a cache outside this project's file-system scope.
    const pendingPdf = new File(Paths.cache, `${pdf.name}.part`);
    await pendingPdf.write(base64, { encoding: 'base64' });
    await pendingPdf.move(pdf);
  }
  await shareAsync(pdf.uri, {
    UTI: 'com.adobe.pdf',
    mimeType: 'application/pdf',
    dialogTitle: title,
  });
}
