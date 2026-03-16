import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

// ── Error Boundary ──────────────────────────────────────────────
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif", direction: "rtl" }}>
          <h2 style={{ color: "#e53e3e" }}>حدث خطأ في تحميل التطبيق</h2>
          <p style={{ color: "#666" }}>{this.state.error?.message || "خطأ غير معروف"}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginTop: 16,
            }}
          >
            إعادة تحميل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Global error handlers ───────────────────────────────────────
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error?.message || event.message, event.error?.stack);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding:40px;text-align:center;font-family:sans-serif;direction:rtl">
      <h2 style="color:#e53e3e">حدث خطأ في تحميل التطبيق</h2>
      <p style="color:#666">${event.error?.message || event.message || 'Unknown error'}</p>
      <button onclick="location.reload()" style="padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;margin-top:16px">إعادة تحميل</button>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding:40px;text-align:center;font-family:sans-serif;direction:rtl">
      <h2 style="color:#e53e3e">حدث خطأ في تحميل التطبيق</h2>
      <p style="color:#666">${event.reason?.message || String(event.reason) || 'Unknown error'}</p>
      <button onclick="location.reload()" style="padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;margin-top:16px">إعادة تحميل</button>
    </div>`;
  }
});

// ── Query Client ────────────────────────────────────────────────
const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// ── tRPC Client ─────────────────────────────────────────────────
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// ── Mount ───────────────────────────────────────────────────────
try {
  createRoot(document.getElementById("root")!).render(
    <AppErrorBoundary>
      <HelmetProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </HelmetProvider>
    </AppErrorBoundary>
  );
} catch (err: any) {
  console.error('[React Mount Error]', err);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:40px;text-align:center;font-family:sans-serif;direction:rtl">
      <h2 style="color:#e53e3e">حدث خطأ في تحميل التطبيق</h2>
      <p style="color:#666">${err?.message || 'Unknown error'}</p>
      <button onclick="location.reload()" style="padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;margin-top:16px">إعادة تحميل</button>
    </div>`;
  }
}
