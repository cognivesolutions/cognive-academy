"use client";

import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { utils, writeFile } from "xlsx";

import { adminPdfExportPreset, applyAdminPdfHeaderAndFooter, formatPdfCurrencyValue, getSafeExcelSheetName, getSingleLinePdfColumnStyles } from "../../pdf-export";

export type StudentOrderExportRow = {
  studentId: string;
  student: string;
  courseId: string;
  course: string;
  category: string;
  status: string;
  placedOn: string;
  amount: number;
};

const STUDENT_ORDER_EXPORT_COLUMNS: string[] = [
  "Student ID",
  "Student Name",
  "Course ID",
  "Course Name",
  "Category",
  "Amount",
  "Status",
  "Placed on",
];

export function StudentPurchaseExportActions({ rows }: { rows: StudentOrderExportRow[] }) {
  const getExportFileDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const formatExcelCurrencyInr = (value: number | string | null) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

  const getExportRowValues = (row: StudentOrderExportRow) => [
    row.studentId,
    row.student,
    row.courseId,
    row.course,
    row.category,
    formatExcelCurrencyInr(row.amount),
    row.status,
    row.placedOn,
  ];

  const handleExportExcel = () => {
    const worksheet = utils.json_to_sheet(
      rows.map((row) => {
        const values = getExportRowValues(row);
        return STUDENT_ORDER_EXPORT_COLUMNS.reduce<Record<string, string>>((acc, column, index) => {
          acc[column] = String(values[index] ?? "");
          return acc;
        }, {});
      }),
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, getSafeExcelSheetName("Student purchases"));
    writeFile(workbook, `student-purchases (${getExportFileDate()}).xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const addFooter = applyAdminPdfHeaderAndFooter(doc, { title: "Student purchases" });

    autoTable(doc, {
      head: [Array.from(STUDENT_ORDER_EXPORT_COLUMNS)],
      body: rows.map((row) => [
        row.studentId,
        row.student,
        row.courseId,
        row.course,
        row.category,
        formatPdfCurrencyValue(Number(row.amount ?? 0)),
        row.status,
        row.placedOn,
      ]),
      startY: 46,
      styles: {
        fontSize: adminPdfExportPreset.table.fontSize,
        cellPadding: adminPdfExportPreset.table.cellPadding,
        overflow: adminPdfExportPreset.table.bodyOverflow,
      },
      columnStyles: getSingleLinePdfColumnStyles(STUDENT_ORDER_EXPORT_COLUMNS),
      tableWidth: doc.internal.pageSize.getWidth() - 18,
      headStyles: {
        fillColor: adminPdfExportPreset.brandPrimary,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: adminPdfExportPreset.table.headFontSize,
        halign: "center",
        overflow: adminPdfExportPreset.table.headOverflow,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 9, right: 9 },
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

    doc.save(`student-purchases (${getExportFileDate()}).pdf`);
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
