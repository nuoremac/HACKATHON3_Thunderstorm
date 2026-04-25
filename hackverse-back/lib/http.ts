import { PostgrestError } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { AvailabilityWindow } from "@/lib/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function jsonError(status: number, message: string, code: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details === undefined ? {} : { details })
    },
    { status }
  );
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { status: init?.status ?? 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent() {
  return new Response(null, { status: 204 });
}

export function badRequest(message: string, code = "BAD_REQUEST", details?: unknown) {
  return jsonError(400, message, code, details);
}

export function unauthorized(message: string, code = "UNAUTHORIZED", details?: unknown) {
  return jsonError(401, message, code, details);
}

export function forbidden(message: string, code = "FORBIDDEN", details?: unknown) {
  return jsonError(403, message, code, details);
}

export function notFound(message: string, code = "NOT_FOUND", details?: unknown) {
  return jsonError(404, message, code, details);
}

export function conflict(message: string, code = "CONFLICT", details?: unknown) {
  return jsonError(409, message, code, details);
}

export function unprocessable(message: string, code = "UNPROCESSABLE_ENTITY", details?: unknown) {
  return jsonError(422, message, code, details);
}

export function serverError(
  message = "erreur interne du serveur",
  code = "INTERNAL_ERROR",
  details?: unknown
) {
  return jsonError(500, message, code, details);
}

export function validateUUID(value: string) {
  return UUID_REGEX.test(value);
}

export function validateEmail(value: string) {
  return EMAIL_REGEX.test(value);
}

export function apiError(status: number, message: string, code: string, details?: unknown) {
  return new ApiError(status, message, code, details);
}

export function assertExists<T>(
  value: T | null | undefined,
  message: string,
  code: string,
  status = 404,
  details?: unknown
): T {
  if (value == null) {
    throw apiError(status, message, code, details);
  }

  return value;
}

export async function parseBody<T>(request: Request): Promise<T> {
  const raw = await request.text();
  if (!raw.trim()) {
    throw apiError(400, "corps de requete requis", "BODY_REQUIRED");
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw apiError(400, "json invalide", "INVALID_JSON", {
      reason: error instanceof Error ? error.message : String(error)
    });
  }
}

export function handleRouteError(
  error: unknown,
  fallbackMessage = "erreur interne du serveur",
  fallbackCode = "INTERNAL_ERROR"
) {
  if (error instanceof ApiError) {
    return jsonError(error.status, error.message, error.code, error.details);
  }

  console.error("[API_ERROR]", error);
  return serverError(fallbackMessage, fallbackCode);
}

type MappedSupabaseOption = {
  message: string;
  code: string;
  status?: number;
};

type SupabaseMappingOptions = {
  defaultMessage: string;
  defaultCode: string;
  unique?: MappedSupabaseOption;
  foreignKey?: MappedSupabaseOption;
  notNull?: MappedSupabaseOption;
  invalidText?: MappedSupabaseOption;
};

export function mapSupabaseError(error: PostgrestError, options: SupabaseMappingOptions) {
  const unique = options.unique;
  const foreignKey = options.foreignKey;
  const notNull = options.notNull;
  const invalidText = options.invalidText;

  switch (error.code) {
    case "23505":
      throw apiError(unique?.status ?? 409, unique?.message ?? "conflit d'unicite", unique?.code ?? "UNIQUE_VIOLATION");
    case "23503":
      throw apiError(
        foreignKey?.status ?? 400,
        foreignKey?.message ?? "reference invalide",
        foreignKey?.code ?? "FOREIGN_KEY_VIOLATION"
      );
    case "23502":
      throw apiError(
        notNull?.status ?? 400,
        notNull?.message ?? "champ obligatoire manquant",
        notNull?.code ?? "NULL_VIOLATION"
      );
    case "22P02":
      throw apiError(
        invalidText?.status ?? 400,
        invalidText?.message ?? "valeur invalide",
        invalidText?.code ?? "INVALID_INPUT"
      );
    default:
      console.error("[SUPABASE_ERROR]", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw apiError(500, options.defaultMessage, options.defaultCode);
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function requireObject(value: unknown, code = "INVALID_PAYLOAD") {
  if (!isPlainObject(value)) {
    throw apiError(400, "payload invalide", code);
  }

  return value;
}

export function requireNonEmptyString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw apiError(400, `${field} est requis`, `${field.toUpperCase()}_REQUIRED`);
  }

  return value.trim();
}

export function optionalNonEmptyString(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string" || !value.trim()) {
    throw apiError(400, `${field} invalide`, `INVALID_${field.toUpperCase()}`);
  }

  return value.trim();
}

export function requireStringArray(value: unknown, field: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw apiError(400, `${field} doit etre un tableau`, `INVALID_${field.toUpperCase()}`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== "string" || !item.trim()) {
      throw apiError(400, `${field} contient une valeur invalide`, `INVALID_${field.toUpperCase()}`);
    }

    return item.trim();
  });

  return normalized;
}

export function requireNumberInRange(
  value: unknown,
  field: string,
  min: number,
  max: number,
  status = 400
) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw apiError(400, `${field} invalide`, `INVALID_${field.toUpperCase()}`);
  }

  if (value < min || value > max) {
    throw apiError(status, `${field} hors limite`, `INVALID_${field.toUpperCase()}`, {
      min,
      max
    });
  }

  return value;
}

export function optionalInteger(value: unknown, field: string, min = 0) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min) {
    throw apiError(400, `${field} invalide`, `INVALID_${field.toUpperCase()}`, { min });
  }

  return value;
}

export function requireEnumValue<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
) {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw apiError(400, `${field} invalide`, `INVALID_${field.toUpperCase()}`, {
      allowed
    });
  }

  return value as T;
}

export function optionalEnumValue<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
) {
  if (value === undefined) return undefined;
  return requireEnumValue(value, field, allowed);
}

export function requireDateString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw apiError(400, `${field} est requis`, `${field.toUpperCase()}_REQUIRED`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw apiError(400, `${field} invalide`, `INVALID_${field.toUpperCase()}`);
  }

  return value;
}

export function optionalDateString(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return requireDateString(value, field);
}

export function requireAvailability(value: unknown) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw apiError(400, "availability doit etre un tableau", "INVALID_AVAILABILITY");
  }

  return value.map((item, index) => {
    if (!isPlainObject(item)) {
      throw apiError(400, "availability invalide", "INVALID_AVAILABILITY", { index });
    }

    const start = requireDateString(item.start, `availability[${index}].start`);
    const end = requireDateString(item.end, `availability[${index}].end`);
    const day = optionalNonEmptyString(item.day, `availability[${index}].day`);
    const location = optionalNonEmptyString(item.location, `availability[${index}].location`);

    if (new Date(start).getTime() >= new Date(end).getTime()) {
      throw apiError(422, "availability invalide", "INVALID_AVAILABILITY_RANGE", { index });
    }

    return {
      ...(day ? { day } : {}),
      start,
      end,
      ...(location ? { location } : {})
    } satisfies AvailabilityWindow;
  });
}

export function requireProfileLinks(value: unknown) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (!isPlainObject(value)) {
    throw apiError(400, "profile_links invalide", "INVALID_PROFILE_LINKS");
  }

  const entries = Object.entries(value).map(([key, entryValue]) => {
    if (typeof entryValue !== "string" || !entryValue.trim()) {
      throw apiError(400, "profile_links invalide", "INVALID_PROFILE_LINKS", { key });
    }

    return [key, entryValue.trim()] as const;
  });

  return Object.fromEntries(entries);
}

export function validateUuidParam(value: string, notFoundCode = "INVALID_ID") {
  if (!validateUUID(value)) {
    throw apiError(400, "identifiant invalide", notFoundCode);
  }
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}
