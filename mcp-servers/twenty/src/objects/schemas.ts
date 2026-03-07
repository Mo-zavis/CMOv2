import { z } from 'zod';

export const filterSchema = z.string().optional().describe(
  'Filter expression. Format: field[comparator]:value. ' +
  'Comparators: eq, neq, in, containsAny, is, gt, gte, lt, lte, startsWith, endsWith, like, ilike. ' +
  'Logical operators: and(...), or(...), not(...). ' +
  'Nested fields: field.subfield[comparator]:value. ' +
  'Examples: name[like]:"%Acme%", or(createdAt[gte]:"2024-01-01",status[eq]:ACTIVE)',
);

export const requiredFilterSchema = z.string().describe(
  'Required filter expression. Format: field[comparator]:value. ' +
  'Comparators: eq, neq, in, containsAny, is, gt, gte, lt, lte, startsWith, endsWith, like, ilike. ' +
  'Logical operators: and(...), or(...), not(...).',
);

export const orderBySchema = z.string().optional().describe(
  'Sort order. Format: field[Direction],field2[Direction]. ' +
  'Directions: AscNullsFirst (default), AscNullsLast, DescNullsFirst, DescNullsLast. ' +
  'Example: createdAt[DescNullsLast],name[AscNullsFirst]',
);

export const limitSchema = z.number().int().min(1).max(200).optional().describe(
  'Maximum number of records to return (1-200, default 60)',
);

export const depthSchema = z.number().int().min(0).max(1).optional().describe(
  'Relation depth: 0 = primary object only, 1 = include direct relations (default 1)',
);

export const startingAfterSchema = z.string().optional().describe(
  'Cursor for forward pagination. Use endCursor from previous response pageInfo',
);

export const endingBeforeSchema = z.string().optional().describe(
  'Cursor for backward pagination. Use startCursor from previous response pageInfo',
);

export const idSchema = z.string().describe('Record UUID');

export const upsertSchema = z.boolean().optional().describe(
  'If true, creates the record or updates it if it already exists',
);

export const softDeleteSchema = z.boolean().optional().describe(
  'If true, soft-deletes the record (can be restored later). If false, permanently destroys it.',
);

export const dataSchema = z.record(z.unknown()).describe(
  'Record data as a JSON object. Fields vary by object type. Use metadata_list_fields to discover available fields.',
);

export const batchDataSchema = z.array(z.record(z.unknown())).max(60).describe(
  'Array of record objects to create (max 60 per batch)',
);
