import jsPDF from 'jspdf';

interface Letter {
  id: string;
  attorney_name: string;
  sender_name: string;
  sender_address: string;
  recipient_name: string;
  matter: string;
  ai_draft: string;
  created_at: string;
  status: string;
}

export const generateLetterPDF = (letter: Letter): void => {
  const doc = new jsPDF();
  
  // Set up page margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let currentY = margin;

  // Add letterhead - Attorney/Law Firm Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(letter.attorney_name, margin, currentY);
  currentY += lineHeight + 3;

  // Add horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight;

  // Add date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const formattedDate = new Date(letter.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Date: ${formattedDate}`, margin, currentY);
  currentY += lineHeight + 3;

  // Add recipient info
  doc.text(`To: ${letter.recipient_name}`, margin, currentY);
  currentY += lineHeight;

  // Add subject/matter
  doc.setFont('helvetica', 'bold');
  doc.text(`Re: ${letter.matter}`, margin, currentY);
  currentY += lineHeight + 5;

  // Add letter body (AI-generated content)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  // Split text to fit page width
  const maxWidth = pageWidth - (margin * 2);
  const splitText = doc.splitTextToSize(letter.ai_draft, maxWidth);
  
  // Add text with page breaks if needed
  splitText.forEach((line: string) => {
    if (currentY > pageHeight - margin - 10) {
      doc.addPage();
      currentY = margin;
    }
    doc.text(line, margin, currentY);
    currentY += lineHeight;
  });

  // Add footer with sender info at the bottom of last page
  currentY += lineHeight * 2;
  if (currentY > pageHeight - margin - 30) {
    doc.addPage();
    currentY = margin;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sincerely,', margin, currentY);
  currentY += lineHeight * 2;
  
  doc.setFont('helvetica', 'bold');
  doc.text(letter.sender_name, margin, currentY);
  currentY += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const addressLines = doc.splitTextToSize(letter.sender_address, maxWidth);
  addressLines.forEach((line: string) => {
    doc.text(line, margin, currentY);
    currentY += lineHeight - 1;
  });

  // Download the PDF
  const filename = `letter-${letter.recipient_name.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`;
  doc.save(filename);
};

// Helper function to check if letter is ready for download
export const isLetterReadyForDownload = (letter: Letter): boolean => {
  return letter.status === 'completed' && letter.ai_draft && letter.ai_draft.length > 0;
};
