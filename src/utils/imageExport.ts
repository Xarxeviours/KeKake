import { GroupData, Person, SettlementTransaction } from '../types';
import { formatCurrency } from './currencies';

export function exportSummaryAsPng(
  group: GroupData,
  settlements: SettlementTransaction[],
  peopleMap: Map<string, Person>,
  totalSpent: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const width = 800;
      const headerHeight = 260;
      const rowHeight = 70;
      const footerHeight = 150;
      const txCount = settlements.length;
      const height = Math.max(700, headerHeight + Math.max(1, txCount) * rowHeight + footerHeight);

      // Retina scale
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.scale(scale, scale);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Inner card container with subtle shadow & border
      const cardMargin = 40;
      const cardW = width - cardMargin * 2;
      const cardH = height - cardMargin * 2;
      const cardRadius = 24;

      ctx.save();
      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(cardMargin, cardMargin, cardW, cardH, cardRadius);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top brand badge
      ctx.textAlign = 'center';
      
      // Brand Logo & Name
      ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = '#059669'; // Emerald
      ctx.fillText('KeKake 💸', width / 2, cardMargin + 60);

      ctx.font = '500 13px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Ke kake koto debe? We’ll figure it out.', width / 2, cardMargin + 85);

      // Group Name
      ctx.font = '800 32px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(group.name, width / 2, cardMargin + 135);

      // Total spent badge
      const totalStr = `Total Spent: ${formatCurrency(totalSpent, group.currency)}`;
      ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = '#059669';
      ctx.fillText(totalStr, width / 2, cardMargin + 175);

      // Divider
      ctx.beginPath();
      ctx.moveTo(cardMargin + 40, cardMargin + 205);
      ctx.lineTo(cardMargin + cardW - 40, cardMargin + 205);
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 2;
      ctx.stroke();

      let currentY = cardMargin + 250;

      if (settlements.length === 0) {
        ctx.font = '700 22px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText('🎉 All Settled!', width / 2, currentY + 30);
        ctx.font = '500 15px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Nobody owes anyone anything in this group.', width / 2, currentY + 65);
        currentY += 120;
      } else {
        settlements.forEach((tx, idx) => {
          const fromName = peopleMap.get(tx.fromPersonId)?.name || 'Unknown';
          const toName = peopleMap.get(tx.toPersonId)?.name || 'Unknown';
          const amountStr = formatCurrency(tx.amount, group.currency);

          // Card row background
          ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
          ctx.beginPath();
          ctx.roundRect(cardMargin + 30, currentY - 25, cardW - 60, 56, 12);
          ctx.fill();

          // Left side: From -> To
          ctx.textAlign = 'left';
          ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.fillStyle = '#1e293b';
          ctx.fillText(fromName, cardMargin + 50, currentY + 8);

          // Arrow
          ctx.font = '500 16px "Plus Jakarta Sans", system-ui, sans-serif';
          ctx.fillStyle = '#94a3b8';
          const fromWidth = ctx.measureText(fromName).width;
          ctx.fillText(' → ', cardMargin + 50 + fromWidth + 8, currentY + 8);

          // To
          const arrowWidth = ctx.measureText(' → ').width;
          ctx.fillStyle = '#0f766e';
          ctx.fillText(toName, cardMargin + 50 + fromWidth + 8 + arrowWidth, currentY + 8);

          // Right side: Amount
          ctx.textAlign = 'right';
          ctx.font = '700 20px "JetBrains Mono", monospace';
          ctx.fillStyle = '#0f172a';
          ctx.fillText(amountStr, cardMargin + cardW - 50, currentY + 8);

          currentY += rowHeight;
        });
      }

      // Bottom Summary Info
      ctx.textAlign = 'center';
      ctx.font = '600 16px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = '#334155';
      const paymentsText =
        settlements.length === 1
          ? '1 payment to settle everyone'
          : `${settlements.length} payments to settle everyone`;
      ctx.fillText(paymentsText, width / 2, currentY + 30);

      ctx.font = '500 13px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(
        `Generated by KeKake • Privacy-first settlement calculator • ${new Date().toLocaleDateString()}`,
        width / 2,
        currentY + 55
      );

      ctx.restore();

      // Trigger download
      const safeName = group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'kekake-settlement';
      const link = document.createElement('a');
      link.download = `${safeName}-settlement.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
