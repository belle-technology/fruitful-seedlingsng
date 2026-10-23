import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { settingsQueryOptions } from "@/lib/queries";
import { placeOrder, type StoreSettingsDto } from "@/lib/store.functions";
import { useCart } from "@/lib/cart";
import { NIGERIAN_STATES, formatNaira } from "@/lib/nigeria";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Fruitful Seedlings" },
      {
        name: "description",
        content:
          "Complete your seedling order: choose delivery anywhere in Nigeria, then pay by bank transfer.",
      },
      { property: "og:title", content: "Checkout — Fruitful Seedlings" },
      {
        property: "og:description",
        content:
          "Complete your seedling order: choose delivery anywhere in Nigeria, then pay by bank transfer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQueryOptions),
  component: CheckoutPage,
});

type PlacedOrder = { order_code: string; total: number };

function CheckoutPage() {
  const { data: settingsData } = useSuspenseQuery(settingsQueryOptions);
  const settings = settingsData.settings as StoreSettingsDto | null;
  const { items, total, clear } = useCart();
  const submitOrder = useServerFn(placeOrder);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  const hasBankDetails = Boolean(
    settings && settings.bank_name && settings.account_number && settings.account_name,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await submitOrder({
        data: {
          name,
          phone,
          state,
          address,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        },
      });
      if (res.ok) {
        setPlaced({ order_code: res.order_code, total: res.total });
        clear();
      } else {
        setError(res.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-5xl">🌱</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
          Order placed!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your order code is{" "}
          <span className="font-bold text-foreground">{placed.order_code}</span>. Transfer{" "}
          <span className="font-bold text-foreground">{formatNaira(placed.total)}</span> to the
          account below to confirm it.
        </p>
        {hasBankDetails && settings && (
          <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pay into
            </p>
            <p className="mt-1 font-display text-xl font-bold text-foreground">
              {settings.account_name}
            </p>
            <p className="text-lg font-semibold text-primary">
              {settings.bank_name} · {settings.account_number}
            </p>
            {settings.whatsapp && (
              <p className="mt-2 text-xs text-muted-foreground">
                Send your payment receipt on WhatsApp: {settings.whatsapp}
              </p>
            )}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          We confirm every payment manually, then dispatch your seedlings. Keep your order code
          for reference.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add some seedlings first, then come back to check out.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Browse seedlings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="text-sm text-muted-foreground underline">
        ← Back to shop
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Checkout</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr,320px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Adaeze Okafor"
              className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground" htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              inputMode="tel"
              placeholder="e.g. 0803 123 4567"
              className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground" htmlFor="state">
              Delivery state
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select your state…</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground" htmlFor="address">
              Delivery address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              placeholder="House/street, area, nearest landmark…"
              className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order & see payment details"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="font-display text-lg font-semibold text-foreground">Order summary</p>
            <ul className="mt-3 space-y-2">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {i.qty}× {i.name}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatNaira(i.qty * i.price)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-lg font-bold text-primary">
                {formatNaira(total)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="font-display text-lg font-semibold text-foreground">Pay by transfer</p>
            {hasBankDetails && settings ? (
              <div className="mt-2 text-sm">
                <p className="font-semibold text-foreground">{settings.account_name}</p>
                <p className="text-primary">
                  {settings.bank_name} · {settings.account_number}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Transfer exactly {formatNaira(total)} after placing your order.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                After you place the order, the bank account details will be shown here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
