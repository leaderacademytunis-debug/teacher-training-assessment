import { useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

/**
 * RoleGuard: Automatically redirects authenticated users with default 'user' role
 * to the role selection page (/select-role).
 * 
 * Excluded paths: /select-role, /complete-registration, /verify, /about, /contact, /pricing
 * Admin/trainer/supervisor roles are also excluded.
 */

const EXCLUDED_PATHS = [
  "/select-role",
  "/complete-registration",
  "/verify",
  "/about",
  "/contact",
  "/pricing",
  "/join",
];

const STAFF_ROLES = ["admin", "trainer", "supervisor"];

export default function RoleGuard() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || !user || hasRedirected.current) return;

    // Skip if user has already chosen a role or is staff
    if (user.role !== "user" || STAFF_ROLES.includes(user.role)) return;

    // Skip excluded paths
    const isExcluded = EXCLUDED_PATHS.some(
      (p) => location === p || location.startsWith(p + "/")
    );
    if (isExcluded) return;

    // User has default 'user' role and is on a non-excluded page → redirect
    hasRedirected.current = true;
    navigate("/select-role");
  }, [user, loading, location, navigate]);

  return null;
}
