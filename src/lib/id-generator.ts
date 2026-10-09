export const USER_ID_PREFIX = "COG";
export const COURSE_ID_PREFIX = "COURSE";
export const MODULE_ID_PREFIX = "MOD";
export const LECTURE_ID_PREFIX = "LEC";
export const ORDER_ID_PREFIX = "ORD";
export const ENROLLMENT_ID_PREFIX = "ENR";
export const SAVED_COURSE_ID_PREFIX = "SAVE";
export const LECTURE_PROGRESS_ID_PREFIX = "LP";
export const OTP_VERIFICATION_ID_PREFIX = "OTP";

export const RESERVED_ID_START = 3;
export const RESERVED_ID_END = 100;

export const BUSINESS_ID_RESERVED_RANGES: Record<string, { start: number; end: number } | null> = {
  [USER_ID_PREFIX]: { start: RESERVED_ID_START, end: RESERVED_ID_END },
  [COURSE_ID_PREFIX]: null,
  [MODULE_ID_PREFIX]: null,
  [LECTURE_ID_PREFIX]: null,
  [ORDER_ID_PREFIX]: null,
  [ENROLLMENT_ID_PREFIX]: null,
  [SAVED_COURSE_ID_PREFIX]: null,
  [LECTURE_PROGRESS_ID_PREFIX]: null,
  [OTP_VERIFICATION_ID_PREFIX]: null,
};

function parseNumericSequence(rawValue: string | null | undefined, prefix: string): number | null {
  if (!rawValue) return null;

  const match = new RegExp(`^${prefix}(\\d+)$`, "i").exec(rawValue.trim());
  if (!match) return null;

  const numericValue = Number(match[1]);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function getNextAvailableSequenceId(
  existingIds: Array<string | null | undefined>,
  prefix: string,
  reservedStart: number | null = null,
  reservedEnd: number | null = null,
): string {
  const effectiveReservedStart = reservedStart ?? BUSINESS_ID_RESERVED_RANGES[prefix]?.start ?? null;
  const effectiveReservedEnd = reservedEnd ?? BUSINESS_ID_RESERVED_RANGES[prefix]?.end ?? null;
  const usedNumbers = new Set<number>();

  for (const value of existingIds) {
    const parsed = parseNumericSequence(value, prefix);
    if (parsed !== null) {
      usedNumbers.add(parsed);
    }
  }

  let next = 1;
  while (next <= 999999) {
    if (effectiveReservedStart !== null && effectiveReservedEnd !== null && next >= effectiveReservedStart && next <= effectiveReservedEnd) {
      next = effectiveReservedEnd + 1;
      continue;
    }

    if (!usedNumbers.has(next)) {
      return `${prefix}${String(next).padStart(6, "0")}`;
    }

    next += 1;
  }

  throw new Error(`No available ${prefix} ID slots left.`);
}

type PrismaBusinessIdModel = {
  findMany: (args: any) => Promise<Array<Record<string, any>>>;
};

type BusinessIdPrismaLike = Partial<{
  user: PrismaBusinessIdModel;
  course: PrismaBusinessIdModel;
  module: PrismaBusinessIdModel;
  lecture: PrismaBusinessIdModel;
  order: PrismaBusinessIdModel;
  enrollment: PrismaBusinessIdModel;
  savedCourse: PrismaBusinessIdModel;
  lectureProgress: PrismaBusinessIdModel;
  otpVerification: PrismaBusinessIdModel;
}>;

async function hasBusinessIdColumn(
  prisma: BusinessIdPrismaLike,
  modelName: keyof BusinessIdPrismaLike,
  fieldName: string,
): Promise<boolean> {
  const model = prisma[modelName];
  if (!model || typeof model.findMany !== "function") {
    return false;
  }

  try {
    const rows = await (prisma as any).$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${modelName === "user" ? "users" : modelName === "course" ? "courses" : modelName === "module" ? "modules" : modelName === "lecture" ? "lectures" : modelName === "order" ? "orders" : modelName === "enrollment" ? "enrollments" : modelName === "savedCourse" ? "saved_courses" : modelName === "lectureProgress" ? "lecture_progress" : modelName === "otpVerification" ? "otp_verifications" : "unknown"}
          AND column_name = ${fieldName}
      ) AS "exists";
    `;

    return Boolean(rows[0]?.exists);
  } catch {
    return false;
  }
}

async function getNextBusinessIdFromModel(
  prisma: BusinessIdPrismaLike & { $queryRaw?: (...args: any[]) => Promise<any> },
  modelName: keyof BusinessIdPrismaLike,
  fieldName: string,
  prefix: string,
): Promise<string> {
  const model = prisma[modelName];
  if (!model) {
    throw new Error(`No Prisma model registered for ${String(modelName)}`);
  }

  const hasColumn = await hasBusinessIdColumn(prisma, modelName, fieldName);
  if (!hasColumn) {
    return getNextAvailableSequenceId([], prefix, null, null);
  }

  const rows = await model.findMany({
    where: { [fieldName]: { not: null } },
    select: { [fieldName]: true },
  });

  return getNextAvailableSequenceId(
    rows.map((row) => row[fieldName]),
    prefix,
    null,
    null,
  );
}

export async function getNextUserBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "user", "userId", USER_ID_PREFIX);
}

export async function getNextCourseBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "course", "courseId", COURSE_ID_PREFIX);
}

export async function getNextModuleBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "module", "moduleId", MODULE_ID_PREFIX);
}

export async function getNextLectureBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "lecture", "lectureId", LECTURE_ID_PREFIX);
}

export async function getNextOrderBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "order", "orderId", ORDER_ID_PREFIX);
}

export async function getNextEnrollmentBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "enrollment", "enrollmentId", ENROLLMENT_ID_PREFIX);
}

export async function getNextSavedCourseBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "savedCourse", "savedCourseId", SAVED_COURSE_ID_PREFIX);
}

export async function getNextLectureProgressBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "lectureProgress", "lectureProgressId", LECTURE_PROGRESS_ID_PREFIX);
}

export async function getNextOtpVerificationBusinessId(prisma: BusinessIdPrismaLike) {
  return getNextBusinessIdFromModel(prisma, "otpVerification", "otpVerificationId", OTP_VERIFICATION_ID_PREFIX);
}
