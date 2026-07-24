import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const STATUS_LABEL = {
  APPLIED: 'Đã ứng tuyển',
  INTERVIEWING: 'Đang phỏng vấn',
  OFFER: 'Nhận offer',
  REJECTED: 'Bị từ chối',
};

function buildRows(jobs) {
  return jobs.map((job) => ({
    'Công ty': job.company || '',
    'Vị trí': job.position || '',
    'Trạng thái': STATUS_LABEL[job.status] || job.status || '',
    'Ngày ứng tuyển': job.appliedDate || '',
    'Deadline': job.deadline || '',
    'Người liên hệ': job.contactName || '',
    'Email liên hệ': job.contactEmail || '',
    'SĐT liên hệ': job.contactPhone || '',
    'Nhãn': (job.tags || []).join(', '),
    'Ghi chú': job.notes || '',
  }));
}

export function exportToExcel(jobs, filename = 'job-tracker-export') {
  const rows = buildRows(jobs);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Đơn ứng tuyển');

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportToPdf(jobs, filename = 'job-tracker-export') {
  // Tạo bảng HTML ẩn để trình duyệt tự render đúng font tiếng Việt
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.padding = '24px';
  container.style.background = '#ffffff';
  container.style.fontFamily = 'Arial, Helvetica, sans-serif';
  container.style.color = '#111827';

  const rowsHtml = jobs
    .map(
      (job) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${job.company || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${job.position || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${STATUS_LABEL[job.status] || job.status || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${job.appliedDate || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${job.deadline || ''}</td>
    </tr>
  `
    )
    .join('');

  container.innerHTML = `
    <h2 style="margin:0 0 4px; font-size:20px;">Báo cáo theo dõi ứng tuyển</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">
      Xuất ngày: ${new Date().toLocaleDateString('vi-VN')} - Tổng: ${jobs.length} đơn
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#4f46e5;color:#ffffff;">
          <th style="padding:8px;text-align:left;">Công ty</th>
          <th style="padding:8px;text-align:left;">Vị trí</th>
          <th style="padding:8px;text-align:left;">Trạng thái</th>
          <th style="padding:8px;text-align:left;">Ngày ứng tuyển</th>
          <th style="padding:8px;text-align:left;">Deadline</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}