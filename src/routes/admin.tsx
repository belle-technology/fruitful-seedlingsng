import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  adminGetData,
  adminSetOrderStatus,
  adminUpdateSettings,
  type AdminData,
  type AdminOrder,
  type StoreSettingsDto,
} from "@/lib/store.functions";
import { formatNaira } from "@/lib/nigeria";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store Admin — Fruitful Seedlings" },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Store Admin — Fruitful Seedlings" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  payment_confirmed: "Payment confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const getData = useServerFn(adminGetData);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await getData({ data: { passcode } });
      if (res.ok) {
        setData(res.data);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function refresh(code: string) {
    const res = await getData({ data: { passcode: code } });
    if (res.ok) setData(res.data);
  }

  if (!data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Store admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your admin code to see orders and payments.
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Admin code"
            required
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  const orders = data.orders;
  const pending = orders.filter((o) => o.status === "pending_payment");
  const confirmed = orders.filter((o) => o.status === "payment_confirmed");
  const delivered = orders.filter((o) => o.status === "delivered");
  const revenue = orders
    .filter((o) => o.status === "payment_confirmed" || o.status === "delivered")
    .reduce((n, o) => n + o.total, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Orders</h1>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="rounded-full border border-input bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
        >
          {showSettings ? "Hide settings" : "Bank & business settings"}
        </button>
      </div>

      {showSettings && data.settings && (
        <SettingsForm
          passcode={passcode}
          settings={data.settings}
          onSaved={() => refresh(passcode)}
        />
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Awaiting payment" value={String(pending.length)} />
        <StatBox label="Payment confirmed" value={String(confirmed.length)} />
        <StatBox label="Delivered" value={String(delivered.length)} />
        <StatBox label="Confirmed revenue" value={formatNaira(revenue)} />
      </div>

      <div className="mt-6 space-y-4">
        {orders.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} passcode={passcode} onChanged={() => refresh(passcode)} />
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function OrderCard({
  order,
  passcode,
  onChanged,
}: {
  order: AdminOrder;
  passcode: string;
  onChanged: () => void;
}) {
  const setStatus = useServerFn(adminSetOrderStatus);
  const [busy, setBusy] = useState(false);

  async function changeStatus(status: string) {
    setBusy(true);
    try {
      await setStatus({ data: { passcode, orderId: order.id, status } });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const badge =
    order.status === "pending_payment"
      ? "bg-accent/40 text-accent-foreground"
      : order.status === "payment_confirmed"
        ? "bg-secondary text-secondary-foreground"
        : order.status === "delivered"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold text-foreground">
            {order.order_code} · {formatNaira(order.total)}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.customer_name} · {order.phone} · {order.state} ·{" "}
            {new Date(order.created_at).toLocaleString("en-NG")}
          </p>
        </div>
        <span className={"rounded-full px-3 py-1 text-xs font-semibold " + badge}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <ul className="mt-2 text-sm text-muted-foreground">
        {order.items.map((i) => (
          <li key={i.productId}>
            {i.qty}× {i.name} — {formatNaira(i.price * i.qty)}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-muted-foreground">Address: {order.address}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {order.status === "pending_payment" && (
          <button
            disabled={busy}
            onClick={() => changeStatus("payment_confirmed")}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            ✅ Confirm payment received
          </button>
        )}
        {order.status === "payment_confirmed" && (
          <button
            disabled={busy}
            onClick={() => changeStatus("delivered")}
            className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80 disabled:opacity-60"
          >
            📦 Mark as delivered
          </button>
        )}
        {order.status !== "cancelled" && order.status !== "delivered" && (
          <button
            disabled={busy}
            onClick={() => changeStatus("cancelled")}
            className="rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
          >
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
}

function SettingsForm({
  passcode,
  settings,
  onSaved,
}: {
  passcode: string;
  settings: StoreSettingsDto;
  onSaved: () => void;
}) {
  const save = useServerFn(adminUpdateSettings);
  const [businessName, setBusinessName] = useState(settings.business_name);
  const [bankName, setBankName] = useState(settings.bank_name);
  const [accountNumber, setAccountNumber] = useState(settings.account_number);
  const [accountName, setAccountName] = useState(settings.account_name);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await save({
        data: {
          passcode,
          settings: {
            business_name: businessName,
            bank_name: bankName,
            account_number: accountNumber,
            account_name: accountName,
            whatsapp,
          },
        },
      });
      setMsg(res.ok ? "Saved ✓" : res.error);
      if (res.ok) onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-4 grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2">
      <Field label="Business name" value={businessName} onChange={setBusinessName} />
      <Field label="Bank name" value={bankName} onChange={setBankName} />
      <Field label="Account number" value={accountNumber} onChange={setAccountNumber} />
      <Field label="Account name" value={accountName} onChange={setAccountName} />
      <Field label="WhatsApp number" value={whatsapp} onChange={setWhatsapp} />
      <div className="flex items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
