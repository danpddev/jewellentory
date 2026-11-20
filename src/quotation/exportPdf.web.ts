export async function exportQuotationPdf(html: string, _folio: string, title: string) {
  const frameId = 'tamsa-quotation-print';
  document.getElementById(frameId)?.remove();
  const frame = document.createElement('iframe');
  frame.id = frameId;
  frame.title = title;
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0';
  await new Promise<void>((resolve, reject) => {
    frame.onload = () => {
      try {
        const page = frame.contentWindow;
        if (!page) throw new Error('The print document is unavailable');
        page.addEventListener('afterprint', () => frame.remove(), { once: true });
        page.focus();
        page.print();
        resolve();
      } catch (error) {
        frame.remove();
        reject(error);
      }
    };
    frame.srcdoc = html;
    document.body.append(frame);
  });
}
