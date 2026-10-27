import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { trackOrder, type TrackedOrder } from "@/lib/store.functions";
import { formatNaira } from "@/lib/nigeria";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search["code"] === "string" ? search["code"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track your order — Fruitful Seedlings" },
      {
        name: "description",
        content:
          "Enter your order code to see the progress of your seedling delivery, from payment confirmation to dispatch.",
      },
      { property: "og:title", content: "Track your order — Fruitful Seedlings" },
      {
        property: "og:description",
        content:
          "Enter your order code to see the progress of your seedling delivery, from payment confirmation to dispatch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

const STEPS = [
  { label: "Order placed", hint: "We received your order." },
  { label: "Payment confirmed", hint: "Your transfer has been confirmed." },
  { label: "Preparing seedlings", hint: "We're getting your plants ready." },
  { label: "Dispatched", hint: "Your order has left our nursery." },
  { label: "Out for delivery", hint: "It's on the way to your address." },
  { label: "Delivered", hint: "Your seedlings are with you — happy planting!" },
];

function stepIndexFor(order: TrackedOrder): number {
  const map: Record<string, number> = {
    pending_payment: 0,
    payment_confirmed: 1,
    preparing_seedlings: 2,
    dispatched: 3,
    out_for_delivery: 4,
    delivered: 5,
  };
  return map[order.status] ?? 0;
}

function TrackPage() {
  const search = Route.useSearch();
  const lookup = useServerFn(trackOrder);
  const [code, setCode] = useState(search.code ?? "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const autoRan = useRef(false);

  const run = useCallback(
    async (raw: string) => {
      setBusy(true);
      setError(null);
      setOrder(null);
      try {
        const res = await lookup({ data: { code: raw } });
        if (res.ok) {
          setOrder(res.order);
        } else {
          setError(res.error);
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [lookup],
  );

  useEffect(() => {
    if (search.code && !autoRan.current) {
      autoRan.current = true;
      run(search.code);
    }
  }, [search.code, run]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) run(code);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-10">
        <Link to="/" className="text-sm text-muted-foreground underline">
          ← Back to shop
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Track your order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the order code you got at checkout (it starts with “FS”) to see where your
          seedlings are.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. FSK9NOPH791"
            required
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm uppercase tracking-wide outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Checking…" : "Track"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-xl font-bold text-foreground">{order.order_code}</p>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Placed {new Date(order.created_at).toLocaleString("en-NG")}
            </p>

            {order.status === "cancelled" ? (
              <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                This order was cancelled. If that doesn't look right, contact us with your order
                code.
              </p>
            ) : (
              <ol className="mt-5 space-y-0">
                {STEPS.map((step, i) => {
                  const current = stepIndexFor(order);
                  const done = i <= current;
                  const isCurrent = i === current;
                  let when = "";
                  if (i === 0) when = new Date(order.created_at).toLocaleDateString("en-NG");
                  if (i === 1 && order.payment_confirmed_at)
                    when = new Date(order.payment_confirmed_at).toLocaleDateString("en-NG");
                  return (
                    <li key={step.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                            (done
                              ? "bg-primary text-primary-foreground"
                              : "border border-input bg-background text-muted-foreground")
                          }
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        {i < STEPS.length - 1 && (
                          <span
                            className={
                              "h-8 w-px " + (i < current ? "bg-primary" : "bg-border")
                            }
                          />
                        )}
                      </div>
                      <div className={i < STEPS.length - 1 ? "pb-2" : ""}>
                        <p
                          className={
                            "text-sm font-semibold " +
                            (done ? "text-foreground" : "text-muted-foreground")
                          }
                        >
                          {step.label}
                          {isCurrent && i < 5 && " — in progress"}
                        </p>
                        {when && <p className="text-xs text-muted-foreground">{when}</p>}
                        {!done && <p className="text-xs text-muted-foreground">{step.hint}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <ul className="space-y-1 text-sm text-muted-foreground">
                {order.items.map((i) => (
                  <li key={i.productId} className="flex justify-between gap-2">
                    <span>
                      {i.qty}× {i.name}
                    </span>
                    <span>{formatNaira(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-border pt-2">
                <span className="font-semibold text-foreground">Total paid</span>
                <span className="font-display font-bold text-primary">
                  {formatNaira(order.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  payment_confirmed: "Payment confirmed",
  preparing_seedlings: "Preparing seedlings",
  dispatched: "Dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
