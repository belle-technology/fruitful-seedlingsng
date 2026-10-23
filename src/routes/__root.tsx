import { createRootRouteWithContext, Outlet, HeadContent, Scripts, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is often a weak internet connection. Check your connection and try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              reset();
              void router.invalidate();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Runs before the app's own code, so it also catches a dropped connection while
// the app files are first downloading (which otherwise leaves a dead page).
// Reloads once; if that also fails within 30s, shows a "tap to retry" bar
// instead of looping.
const LOAD_RECOVERY_SCRIPT = `(function(){
var RE=/Load failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i;
var KEY="fs-load-retry";
function banner(){
  if(document.getElementById("fs-offline-bar"))return;
  var d=document.createElement("div");d.id="fs-offline-bar";d.setAttribute("role","alert");
  d.style.cssText="position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;padding:14px 16px;border-radius:16px;background:var(--primary);color:var(--primary-foreground);font:600 14px system-ui,sans-serif;display:flex;gap:12px;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,.25)";
  d.innerHTML='<span>Connection problem — the shop didn\\'t finish loading.</span>';
  var b=document.createElement("button");b.textContent="Retry";
  b.style.cssText="background:var(--background);color:var(--foreground);border:0;border-radius:999px;padding:8px 16px;font:inherit;cursor:pointer";
  b.onclick=function(){sessionStorage.removeItem(KEY);location.reload();};
  d.appendChild(b);(document.body||document.documentElement).appendChild(d);
}
function recover(msg){
  if(!RE.test(String(msg||"")))return;
  var last=0;try{last=Number(sessionStorage.getItem(KEY)||0);}catch(e){}
  if(Date.now()-last<30000){if(document.body)banner();else document.addEventListener("DOMContentLoaded",banner);return;}
  try{sessionStorage.setItem(KEY,String(Date.now()));}catch(e){}
  location.reload();
}
addEventListener("unhandledrejection",function(e){var r=e.reason;recover(r&&r.message||r);});
addEventListener("error",function(e){recover(e.message);});
})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOAD_RECOVERY_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
