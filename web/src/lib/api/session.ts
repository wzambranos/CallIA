"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Session } from "./types";

const SESSION_KEY = "central.session";
const EVENT = "central-session";

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function homeFor(session: Session) {
  if (session.onboardingStep === "perfil") return "/onboarding/perfil";
  if (session.onboardingStep === "pago") return "/onboarding/pago";
  return "/app";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readRaw() {
  return localStorage.getItem(SESSION_KEY);
}

export function useSession(): Session | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }, [raw]);
}

export function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
