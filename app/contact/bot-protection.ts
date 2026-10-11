"use client";

let initialization: Promise<void> | null = null;

// Load only for an enabled Resend form, once per browser app lifetime.
export function initializeContactProtection() {
  initialization ??= import("botid/client/core").then(({ initBotId }) => {
    initBotId({ protect: [{ path: "/api/contact", method: "POST", advancedOptions: { checkLevel: "basic" } }] });
  });
  return initialization;
}
