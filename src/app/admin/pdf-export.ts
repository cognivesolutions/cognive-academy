import { jsPDF } from "jspdf";

export type PdfColumnStyle = {
  cellWidth: number;
  halign?: "left" | "center" | "right";
};

export const adminPdfExportPreset = {
  brandPrimary: [79, 70, 229] as [number, number, number],
  brandDark: [15, 23, 42] as [number, number, number],
  mutedText: [71, 85, 105] as [number, number, number],
  table: {
    fontSize: 7,
    cellPadding: 2.5,
    bodyOverflow: "linebreak" as const,
    headOverflow: "visible" as const,
    defaultWidth: 22,
    idWidth: 24,
    nameWidth: 30,
    categoryWidth: 28,
    amountWidth: 20,
    dateWidth: 18,
    statusWidth: 18,
    headFontSize: 7,
  },
};

export function getSafeExcelSheetName(name: string) {
  const cleaned = name
    .replace(/[\\/:*?\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 31);

  return cleaned || "Sheet";
}

export function formatPdfEmailValue(value: string) {
  if (!value || !value.includes("@")) {
    return value;
  }

  const atIndex = value.indexOf("@");
  return `${value.slice(0, atIndex)}\n@${value.slice(atIndex + 1)}`;
}

export function formatPdfCurrencyValue(value: number | string | null) {
  const normalized = String(value ?? 0)
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "");

  const numericValue = Number(normalized || 0);
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);

  return formatted.replace(/₹/g, "Rs.");
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function getSingleLinePdfColumnStyles(columns: string[], options?: {
  defaultWidth?: number;
  idWidth?: number;
  nameWidth?: number;
  categoryWidth?: number;
  amountWidth?: number;
  dateWidth?: number;
  statusWidth?: number;
}) {
  const defaultWidth = options?.defaultWidth ?? adminPdfExportPreset.table.defaultWidth;
  const idWidth = options?.idWidth ?? adminPdfExportPreset.table.idWidth;
  const nameWidth = options?.nameWidth ?? adminPdfExportPreset.table.nameWidth;
  const categoryWidth = options?.categoryWidth ?? adminPdfExportPreset.table.categoryWidth;
  const amountWidth = options?.amountWidth ?? adminPdfExportPreset.table.amountWidth;
  const dateWidth = options?.dateWidth ?? adminPdfExportPreset.table.dateWidth;
  const statusWidth = options?.statusWidth ?? adminPdfExportPreset.table.statusWidth;

  return Object.fromEntries(
    columns.map((column, index) => {
      const key = normalize(column);
      const isDateColumn = /date|joined|placed|expiry|start|updated|created/.test(key);
      const isStatusColumn = /status/.test(key);
      const isAmountColumn = /amount|price/.test(key);
      const isStudentIdColumn = /student id/.test(key);
      const isCourseIdColumn = /course id|courseid|course id no|courseid no/.test(key);
      const isCourseNameColumn = /course.*name|course name|course|title/.test(key);
      const isCategoryColumn = /category/.test(key);
      const isNameColumn = /student.*name|name/.test(key) || isCourseNameColumn;
      const isEmailColumn = /email/.test(key);
      const shouldStaySingleLine = isStudentIdColumn || isCourseIdColumn || isAmountColumn || isStatusColumn || isDateColumn;
      const width = shouldStaySingleLine
        ? (isStudentIdColumn || isCourseIdColumn ? idWidth : isStatusColumn ? statusWidth : isAmountColumn ? amountWidth : dateWidth)
        : isCategoryColumn
          ? categoryWidth
          : isNameColumn
            ? nameWidth
            : defaultWidth;
      const halign = isEmailColumn || isNameColumn ? "left" : "center";

      return [index, { cellWidth: width, halign }];
    }),
  ) as Record<number, PdfColumnStyle>;
}

export function applyAdminPdfHeaderAndFooter(
  doc: jsPDF,
  {
    title,
    brandPrimary = adminPdfExportPreset.brandPrimary,
    brandDark = adminPdfExportPreset.brandDark,
    mutedText = adminPdfExportPreset.mutedText,
  }: {
    title: string;
    brandPrimary?: [number, number, number];
    brandDark?: [number, number, number];
    mutedText?: [number, number, number];
  },
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const addFooter = (pageNumber: number, totalPages: number) => {
    const footerY = pageHeight - 12;
    const generatedAt = new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const dividerY = footerY - 20;
    const textY = footerY - 5;

    doc.setDrawColor(226, 232, 240);
    doc.line(14, dividerY, pageWidth - 14, dividerY);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Cognive Academy", 14, textY);
    doc.text(`Generated on: ${generatedAt}`, pageWidth / 2, textY, { align: "center" });
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 24, textY, { align: "right" });
  };

  doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 5, 18, 18, 3, 3, "F");

  doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CA", 23, 17.5, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cognive Academy", 38, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Learning. Career. Confidence.", 38, 24);

  if (title?.trim()) {
    doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 42);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 46, pageWidth - 14, 46);
  }

  return addFooter;
}
