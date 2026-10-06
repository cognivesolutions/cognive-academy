"use client";

import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { utils, writeFile } from "xlsx";

export type StudentManageExportRow = {
  name: string;
  email: string;
  mobile: string;
  courseCount: string;
  joinedOn: string;
  status: string;
};

export function StudentManageExportActions({ rows }: { rows: StudentManageExportRow[] }) {
  const getExportFileDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const handleExportExcel = () => {
    const worksheet = utils.json_to_sheet(
      rows.map((row) => ({
        "Student Name": row.name,
        "Student Email": row.email,
        "Mobile Number": row.mobile,
        "Course Count": row.courseCount,
        "Joined On": row.joinedOn,
        "Status": row.status,
      })),
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Student Management");
    writeFile(workbook, `student-records (${getExportFileDate()}).xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const brandPrimary = [79, 70, 229];
    const mutedText = [71, 85, 105];

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

      doc.setDrawColor(226, 232, 240);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
      doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Cognive Academy", 14, footerY - 1);
      doc.text(`Generated on: ${generatedAt}`, pageWidth / 2, footerY - 1, { align: "center" });
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 24, footerY - 1, { align: "right" });
    };

    doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Cognive Academy", 14, 11.5);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text("Student management", 14, 30);

    autoTable(doc, {
      head: [["Student Name", "Student Email", "Mobile Number", "Course Count", "Joined On", "Status"]],
      body: rows.map((row) => [row.name, row.email, row.mobile, row.courseCount, row.joinedOn, row.status]),
      startY: 38,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 12, right: 12 },
      didDrawPage: (data) => {
        const totalPages = doc.getNumberOfPages();
        addFooter(data.pageNumber, totalPages);
      },
    });

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      addFooter(page, totalPages);
    }

    doc.save(`student-records (${getExportFileDate()}).pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleExportExcel}
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
      >
        <Download className="h-3.5 w-3.5" />
        Excel
      </button>

      <button
        type="button"
        onClick={handleExportPdf}
        className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-[11px] font-semibold text-rose-700 shadow-[0_8px_20px_rgba(244,63,94,0.08)] transition duration-200 hover:border-rose-300 hover:bg-rose-100 hover:shadow-[0_10px_24px_rgba(244,63,94,0.12)] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-500/15"
      >
        <Download className="h-3.5 w-3.5" />
        PDF
      </button>
    </div>
  );
}
