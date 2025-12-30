
import { ProcessedArticle } from "../types.ts";

// Note: jsPDF is loaded via script tag in index.html
declare const jspdf: any;

export const generateArticlePDF = (article: ProcessedArticle) => {
  if (!article) return;
  
  const doc = new jspdf.jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Research Summary Report", margin, y);
  y += 15;

  // Metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date(article.processedAt).toLocaleString()}`, margin, y);
  y += 10;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(article.title || "Untitled", contentWidth);
  doc.text(titleLines, margin, y);
  y += (titleLines.length * 7) + 5;

  // Research Context
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Research Context:", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(article.researchGoal || "N/A", margin, y);
  y += 12;

  // Importance Section
  doc.setFillColor(240, 245, 255);
  doc.rect(margin - 2, y - 5, contentWidth + 4, 30, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text(`Importance Score: ${article.importanceScore || 0}/100`, margin, y + 2);
  y += 10;
  doc.setFont("helvetica", "normal");
  const importanceLines = doc.splitTextToSize(article.importanceReasoning || "No details available.", contentWidth);
  doc.text(importanceLines, margin, y);
  y += (importanceLines.length * 6) + 15;

  // Sections
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Key Findings & Section Summaries", margin, y);
  y += 10;

  if (article.sections && Array.isArray(article.sections)) {
    article.sections.forEach((section, index) => {
      // Check for page break
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const sectionTitleLines = doc.splitTextToSize(`${index + 1}. ${section.title || "Untitled Section"}`, contentWidth);
      doc.text(sectionTitleLines, margin, y);
      y += (sectionTitleLines.length * 6) + 2;

      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(section.summary || "No summary content.", contentWidth);
      doc.text(summaryLines, margin, y);
      y += (summaryLines.length * 6) + 10;
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  const sanitizedTitle = (article.title || "summary").replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${sanitizedTitle}_summary.pdf`);
};
