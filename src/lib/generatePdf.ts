import { jsPDF } from 'jspdf';
import { GenerateResult } from '@/types';

export function downloadPdf(result: GenerateResult, brandLabel: string): void {
  const { usedColors, colorMap } = result;
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;

  doc.setFontSize(18);
  doc.text('拼豆图案 - ' + brandLabel, margin, 25);

  doc.setFontSize(10);
  doc.text(`网格尺寸: ${result.gridWidth} x ${result.gridHeight}`, margin, 35);

  let y = 45;

  const sortedColors = [...usedColors].sort((a, b) => {
    const countA = colorMap.get(a.code) || 0;
    const countB = colorMap.get(b.code) || 0;
    return countB - countA;
  });

  doc.setFontSize(14);
  doc.text('耗材清单', margin, y);
  y += 8;

  const colW = contentW / 4;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('色号', margin, y);
  doc.text('名称', margin + colW, y);
  doc.text('颜色', margin + colW * 2, y);
  doc.text('数量', margin + colW * 3, y);
  y += 5;
  doc.setTextColor(0, 0, 0);

  for (const color of sortedColors) {
    const count = colorMap.get(color.code) || 0;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(8);
    doc.text(color.code, margin, y);
    doc.text(color.name, margin + colW, y);

    doc.setFillColor(color.rgb[0], color.rgb[1], color.rgb[2]);
    doc.rect(margin + colW * 2, y - 3, 12, 5, 'F');
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin + colW * 2, y - 3, 12, 5, 'S');

    doc.text(String(count), margin + colW * 3, y);
    y += 6;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`拼豆总数: ${result.gridWidth * result.gridHeight}`, margin, y + 10);

  doc.save(`pindou-${result.gridWidth}x${result.gridHeight}.pdf`);
}
