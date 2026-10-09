import { prisma } from "@/lib/prisma";

export async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name = ${columnName}
      ) AS "exists";
    `;

    return Boolean(rows[0]?.exists);
  } catch {
    return false;
  }
}
