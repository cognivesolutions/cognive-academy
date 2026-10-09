"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";

type TransactionRowData = {
  id: string;
  invoiceNumber?: string | null;
  status: string;
  course: {
    title: string | null;
    category: string | null;
  };
  amount: number | string;
  createdAt: Date | string;
  paymentProvider?: string | null;
};

type TransactionsTableRowProps = {
  order: TransactionRowData;
  searchQuery: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
  page: number;
  searchMatch: boolean;
  isSelected: boolean;
};

function buildTransactionsUrl({
  status,
  search,
  startDate,
  endDate,
  invoice,
  page,
}: {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  invoice?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (status && status !== "ALL") params.set("status", status);
  if (search) params.set("search", search);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (page && page > 1) params.set("page", String(page));
  if (invoice) params.set("invoice", invoice);

  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function highlightText(value: string | null | undefined, searchTerm: string): ReactNode {
  const text = value ?? "";
  const trimmedTerm = searchTerm.trim();

  if (!trimmedTerm || !text) {
    return value ?? "";
  }

  const lowerText = text.toLowerCase();
  const lowerTerm = trimmedTerm.toLowerCase();
  const nodes: ReactNode[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const matchIndex = lowerText.indexOf(lowerTerm, startIndex);

    if (matchIndex === -1) {
      nodes.push(text.slice(startIndex));
      break;
    }

    if (matchIndex > startIndex) {
      nodes.push(text.slice(startIndex, matchIndex));
    }

    const matchText = text.slice(matchIndex, matchIndex + trimmedTerm.length);
    nodes.push(
      <mark
        key={`${matchIndex}-${startIndex}`}
        className="rounded-sm bg-amber-100 px-0.5 py-0.5 font-semibold text-slate-900 shadow-[inset_0_0_0_1px_rgba(202,138,4,0.18)] dark:bg-yellow-200 dark:text-slate-900"
      >
        {matchText}
      </mark>,
    );

    startIndex = matchIndex + trimmedTerm.length;
  }

  return nodes.length > 0 ? nodes : value ?? "";
}

export function TransactionsTableRow({
  order,
  searchQuery,
  statusFilter,
  startDate,
  endDate,
  page,
  searchMatch,
  isSelected,
}: TransactionsTableRowProps) {
  const router = useRouter();

  const handleSelect = () => {
    router.push(`/transactions/${order.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  const normalizedStatus = order.status?.toUpperCase();

  const statusStyle =
    normalizedStatus === "PAID"
      ? "text-emerald-600 dark:text-emerald-300"
      : normalizedStatus === "PENDING"
        ? "text-amber-600 dark:text-amber-300"
        : normalizedStatus === "FAILED"
          ? "text-rose-600 dark:text-rose-300"
          : normalizedStatus === "REFUNDED"
            ? "text-violet-600 dark:text-violet-300"
            : "text-slate-600 dark:text-slate-300";

  return (
    <tr
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className={
        isSelected
          ? "cursor-pointer bg-indigo-50/60 transition-colors duration-200 hover:bg-indigo-50/90 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-indigo-500/5 dark:hover:bg-slate-800/80"
          : searchMatch
            ? "cursor-pointer bg-indigo-50/40 transition-colors duration-200 hover:bg-indigo-50/90 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-indigo-500/5 dark:hover:bg-slate-800/80"
            : "cursor-pointer bg-white transition-colors duration-200 hover:bg-indigo-50/90 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900/80 dark:hover:bg-slate-800/80"
      }
    >
      <td className="px-4 py-4 text-sm font-normal text-slate-700 dark:text-slate-200">
        {highlightText(order.invoiceNumber ?? order.id.slice(0, 8).toUpperCase(), searchQuery)}
      </td>
      <td className="px-4 py-4 text-sm font-normal text-slate-700 dark:text-slate-200">{highlightText(order.course.title ?? "", searchQuery)}</td>
      <td className="px-4 py-4 text-sm font-normal text-slate-700 dark:text-slate-200">{highlightText(formatCurrency(Number(order.amount)), searchQuery)}</td>
      <td className="px-4 py-4 text-sm font-normal text-slate-700 dark:text-slate-200">{highlightText(formatDate(order.createdAt), searchQuery)}</td>
      <td className="px-4 py-4 text-sm font-normal text-slate-700 dark:text-slate-200">
        <span className={`font-normal ${statusStyle}`}>
          {highlightText(order.status, searchQuery)}
        </span>
      </td>
    </tr>
  );
}
