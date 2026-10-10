-- Backfill readable saved-course business IDs for any rows that were created before
-- the save workflow started populating the field.

WITH max_existing AS (
  SELECT COALESCE(MAX(CAST(regexp_replace("savedCourseId", '^SAVE', '', 1) AS integer)), 0) AS max_num
  FROM "saved_courses"
  WHERE "savedCourseId" ~ '^SAVE[0-9]+$'
),
numbered_nulls AS (
  SELECT s.id,
         ROW_NUMBER() OVER (ORDER BY s."createdAt", s.id) AS row_num
  FROM "saved_courses" s
  WHERE s."savedCourseId" IS NULL
)
UPDATE "saved_courses" s
SET "savedCourseId" = 'SAVE' || LPAD((m.max_num + n.row_num)::text, 6, '0')
FROM numbered_nulls n, max_existing m
WHERE s.id = n.id;
