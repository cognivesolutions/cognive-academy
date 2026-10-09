"use client";

import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { utils, writeFile } from "xlsx";

import { adminPdfExportPreset, applyAdminPdfHeaderAndFooter, formatPdfEmailValue, getSafeExcelSheetName, getSingleLinePdfColumnStyles } from "../../pdf-export";

export type StudentManageExportRow = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  courseCount: string;
  joinedOn: string;
  status: string;
};

const STUDENT_MANAGE_EXPORT_COLUMNS: string[] = [
  "Student ID",
  "Student Name",
  "Student Email",
  "Mobile Number",
  "Course Count",
  "Joined On",
  "Status",
];

export function StudentManageExportActions({ rows }: { rows: StudentManageExportRow[] }) {
  const getExportFileDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const getExportRowValues = (row: StudentManageExportRow) => [
    row.id,
    row.name,
    row.email,
    row.mobile,
    row.courseCount,
    row.joinedOn,
    row.status,
  ];

  const handleExportExcel = () => {
    const worksheet = utils.json_to_sheet(
      rows.map((row) => {
        const values = getExportRowValues(row);
        return STUDENT_MANAGE_EXPORT_COLUMNS.reduce<Record<string, string>>((acc, column, index) => {
          acc[column] = values[index] ?? "";
          return acc;
        }, {});
      }),
    );

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, getSafeExcelSheetName("Student Management"));
    writeFile(workbook, `student-records (${getExportFileDate()}).xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    const addFooter = applyAdminPdfHeaderAndFooter(doc, { title: "Student management" });

    const columnStyles = getSingleLinePdfColumnStyles(STUDENT_MANAGE_EXPORT_COLUMNS);

    if (columnStyles[1]) columnStyles[1] = { ...columnStyles[1], halign: "left" };
    if (columnStyles[2]) columnStyles[2] = { ...columnStyles[2], halign: "left" };

    autoTable(doc, {
      head: [Array.from(STUDENT_MANAGE_EXPORT_COLUMNS)],
      body: rows.map((row) => [
        row.id,
        row.name,
        formatPdfEmailValue(row.email),
        row.mobile,
        row.courseCount,
        row.joinedOn,
        row.status,
      ]),
      startY: 38,
      styles: {
        fontSize: adminPdfExportPreset.table.fontSize,
        cellPadding: adminPdfExportPreset.table.cellPadding,
        overflow: adminPdfExportPreset.table.bodyOverflow,
      },
      columnStyles,
      tableWidth: doc.internal.pageSize.getWidth() - 24,
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
