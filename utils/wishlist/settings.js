import crypto from "node:crypto";
import prisma from "@/utils/prisma.js";
import {
  ADMIN_SETTING_KEYS,
  DEFAULT_SETTINGS,
  PROFILE_SETTING_KEYS,
  PUBLIC_SETTING_KEYS,
} from "./defaults.js";

const BOOLEAN_FIELDS = new Set([
  "iconEnabled",
  "showOnCollectionPages",
  "showOnHomePage",
  "showOnProductImage",
  "autoInjectHeaderIcon",
  "floatingButtonEnabled",
  "addButtonEnabled",
  "showPrices",
  "showAddToCart",
  "requireLogin",
  "onlyInStock",
  "setupEmbedConfirmed",
]);
const TEXT_FIELDS = new Set([
  "pageTitle",
  "emptyStateTitle",
  "emptyStateBody",
  "floatingButtonText",
  "addButtonText",
  "removeButtonText",
  "excludedTags",
]);
const NUMBER_FIELDS = new Set(["iconPositionX", "iconPositionY"]);
const POSITIONS = new Set(["bottom-right", "bottom-left"]);
const UNSAFE_CSS =
  /(?:<\/?style|<\/?script|@import|expression\s*\(|javascript\s*:|url\s*\(\s*["']?data:text\/html)/i;

export async function ensureStore(shop) {
  await prisma.stores.upsert({
    where: { shop },
    update: { isActive: true },
    create: { shop, isActive: true },
  });
}

function profilePayload(settings) {
  return Object.fromEntries(
    PROFILE_SETTING_KEYS.map((key) => [
      key,
      settings[key] ?? DEFAULT_SETTINGS[key],
    ])
  );
}

function profileFingerprint(settings) {
  const stable = JSON.stringify(profilePayload(settings));
  return crypto.createHash("sha256").update(stable).digest("hex");
}

async function assignSettingsProfile(settings) {
  const payload = profilePayload(settings);
  const fingerprint = profileFingerprint(payload);
  const profile = await prisma.wishlist_settings_profile.upsert({
    where: { fingerprint },
    update: {},
    create: { fingerprint, settings: payload },
  });

  if (settings.settingsProfileId !== profile.id) {
    return prisma.store_settings.update({
      where: { shop: settings.shop },
      data: { settingsProfileId: profile.id },
    });
  }
  return settings;
}

export async function getSettings(shop) {
  await ensureStore(shop);
  const settings = await prisma.store_settings.upsert({
    where: { shop },
    update: {},
    create: { shop, ...DEFAULT_SETTINGS },
  });

  if (!settings.settingsProfileId) {
    return assignSettingsProfile(settings);
  }
  return settings;
}

function sanitizeCustomCss(value) {
  const css = String(value || "")
    .trim()
    .slice(0, 12000);
  if (!css) return "";
  if (UNSAFE_CSS.test(css)) {
    throw new Error(
      "Custom CSS contains a blocked construct. Remove scripts, @import, expression(), or unsafe data URLs."
    );
  }
  return css;
}

export function sanitizeSettingsPatch(input = {}) {
  const output = {};

  for (const [key, value] of Object.entries(input)) {
    if (BOOLEAN_FIELDS.has(key) && typeof value === "boolean") {
      output[key] = value;
      continue;
    }
    if (NUMBER_FIELDS.has(key) && Number.isFinite(Number(value))) {
      output[key] = Math.min(100, Math.max(0, Math.round(Number(value))));
      continue;
    }
    if (TEXT_FIELDS.has(key) && typeof value === "string") {
      const limit = key === "emptyStateBody" ? 500 : 160;
      output[key] = value.trim().slice(0, limit);
      continue;
    }
    if (key === "customCss" && typeof value === "string") {
      output.customCss = sanitizeCustomCss(value);
      continue;
    }
    if (
      key === "heartColor" &&
      typeof value === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(value)
    ) {
      output[key] = value.toUpperCase();
      continue;
    }
    if (key === "floatingButtonPosition" && POSITIONS.has(value)) {
      output[key] = value;
    }
  }

  if (Object.keys(output).some((key) => key !== "setupEmbedConfirmed")) {
    output.customizedAt = new Date();
  }

  return output;
}

export async function updateSettings(shop, input) {
  await getSettings(shop);
  const data = sanitizeSettingsPatch(input);
  const updated = await prisma.store_settings.update({ where: { shop }, data });
  return assignSettingsProfile(updated);
}

export function toPublicSettings(settings) {
  return Object.fromEntries(
    PUBLIC_SETTING_KEYS.map((key) => [key, settings[key]])
  );
}

export function toAdminSettings(settings) {
  return Object.fromEntries(
    ADMIN_SETTING_KEYS.map((key) => [key, settings[key]])
  );
}
