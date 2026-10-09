"use client";

import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import failedStamp from "../../../../assets/images/image/failed.png";
import paidStamp from "../../../../assets/images/image/paid.png";
import pendingStamp from "../../../../assets/images/image/pending.png";
import { adminPdfExportPreset, applyAdminPdfHeaderAndFooter } from "@/app/admin/pdf-export";

export type InvoiceDetailData = {
  invoiceNumber: string;
  courseTitle: string;
  buyerName?: string | null;
  amount: number;
  status: string;
  createdAt: Date;
  paymentProvider: string | null;
  reference: string;
};

function formatCurrency(amount: number) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted.replace(/₹/g, "Rs.");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function InvoiceDetailClient({ invoice }: { invoice: InvoiceDetailData }) {
  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const addFooter = applyAdminPdfHeaderAndFooter(doc, {
      title: "",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const contentWidth = pageWidth - marginX * 2;

    const invoiceDate = new Date(invoice.createdAt);
    const subtotal = Number(invoice.amount);
    const discount = 0;
    const gst = 0;
    const total = subtotal - discount + gst;
    const lowerStatus = invoice.status.toLowerCase();
    const statusColor = lowerStatus === "paid"
      ? [16, 185, 129]
      : lowerStatus === "pending"
        ? [245, 158, 11]
        : lowerStatus === "failed"
          ? [244, 63, 94]
          : [100, 116, 139];

    doc.setFillColor(239, 242, 248);
    doc.roundedRect(marginX, 42, contentWidth, 82, 12, 12, "F");

    const headerCenterY = 42 + (82 / 2) + 6;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(`Invoice ${invoice.invoiceNumber}`, marginX + 18, headerCenterY);

    const rightMetaX = pageWidth - marginX - 150;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Invoice", rightMetaX, 66);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, rightMetaX, 86);
    doc.text(`Issued: ${formatDate(invoiceDate)}`, rightMetaX, 98);
    doc.text(`Status: ${invoice.status}`, rightMetaX, 112);

    const buyerName = (invoice.buyerName ?? "").trim() || "Customer";

    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, 140, contentWidth, 120, 10, 10, "S");
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(marginX + 18, 150, 105, 18, 6, 6, "F");
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO", marginX + 32, 163);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(buyerName, marginX + 18, 184);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    const courseDisplayName = invoice.courseTitle.length > 34
      ? `${invoice.courseTitle.slice(0, 31)}...`
      : invoice.courseTitle;

    const customerLines = [
      "123 Learning Avenue",
      "Bengaluru, Karnataka 560100",
      "India",
      `Invoice ID: ${invoice.invoiceNumber}`,
      courseDisplayName,
    ];

    customerLines.forEach((line, index) => {
      const wrapped = doc.splitTextToSize(line, 170);
      wrapped.forEach((wrappedLine: string) => {
        doc.text(wrappedLine, marginX + 18, 201 + index * 13 + (wrapped.length > 1 ? 0 : 0));
      });
    });

    const valueX = pageWidth / 2 + 10;
    const rightBlockWidth = 170;
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(valueX - 4, 150, rightBlockWidth, 18, 6, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(8);
    doc.text("PAYMENT DETAILS", valueX + 10, 163);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);

    const referenceText = invoice.reference.length > 26
      ? `${invoice.reference.slice(0, 23)}...`
      : invoice.reference;

    const paymentLines = [
      `Provider: ${invoice.paymentProvider ?? "—"}`,
      `Reference: ${referenceText}`,
      `Amount: ${formatCurrency(invoice.amount)}`,
    ];

    paymentLines.forEach((line, index) => {
      doc.text(line, valueX, 184 + index * 18);
    });

    autoTable(doc, {
      head: [["Item", "Qty", "Rate", "Discount", "GST", "Amount"]],
      body: [[invoice.courseTitle, "1", formatCurrency(invoice.amount), formatCurrency(discount), formatCurrency(gst), formatCurrency(invoice.amount)]],
      startY: 290,
      styles: {
        fontSize: 10,
        cellPadding: 10,
        textColor: [15, 23, 42],
        overflow: "linebreak" as const,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 150, halign: "left" },
        1: { cellWidth: 45, halign: "center" },
        2: { cellWidth: 80, halign: "right" },
        3: { cellWidth: 80, halign: "right" },
        4: { cellWidth: 80, halign: "right" },
        5: { cellWidth: 90, halign: "right" },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: marginX, right: marginX },
      tableWidth: contentWidth,
      didDrawPage: (data) => {
        const totalPages = doc.getNumberOfPages();
        addFooter(data.pageNumber, totalPages);
      },
    });

    const summaryY = 430;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - marginX - 210, summaryY, 210, 90, 8, 8, "F");
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(pageWidth - marginX - 214, summaryY - 6, 214, 102, 10, 10, "S");
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("SUMMARY", pageWidth - marginX - 185, summaryY + 10);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal", pageWidth - marginX - 185, summaryY + 22, { align: "left" });
    doc.text("Discount", pageWidth - marginX - 185, summaryY + 38, { align: "left" });
    doc.text("Tax / GST", pageWidth - marginX - 185, summaryY + 54, { align: "left" });
    doc.text("Total", pageWidth - marginX - 185, summaryY + 70, { align: "left" });
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(subtotal), pageWidth - marginX - 16, summaryY + 22, { align: "right" });
    doc.text(formatCurrency(discount), pageWidth - marginX - 16, summaryY + 38, { align: "right" });
    doc.text(formatCurrency(gst), pageWidth - marginX - 16, summaryY + 54, { align: "right" });
    doc.text(formatCurrency(total), pageWidth - marginX - 16, summaryY + 70, { align: "right" });

    const stampX = pageWidth - marginX - 78;
    const stampY = pageHeight - 78;

    const statusStamp = lowerStatus === "paid"
      ? paidStamp
      : lowerStatus === "pending"
        ? pendingStamp
        : lowerStatus === "failed"
          ? failedStamp
          : null;

    if (statusStamp) {
      doc.addImage(statusStamp.src, "png", stampX - 88, stampY - 120, 176, 176);
    } else {
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.circle(stampX, stampY, 26, "F");
      doc.setFillColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(invoice.status.toUpperCase(), stampX, stampY + 4, { align: "center" });
    }

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Tax is applicable as per the prevailing statutory rules for digital services.", marginX, pageHeight - 88);
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Thank you for learning with Cognive Academy.", marginX, pageHeight - 70);

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      addFooter(page, totalPages);
    }

    doc.save(`${invoice.invoiceNumber.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={handleDownloadPdf}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(79,70,229,0.25)] transition hover:brightness-110"
    >
      <Download className="h-4 w-4" />
      Download PDF
    </button>
  );
}
