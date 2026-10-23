import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ProductDto = {
  id: string;
  name: string;
  category: string;
  price: number;
  fruiting: string;
  image: string;
};

export type StoreSettingsDto = {
  business_name: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  whatsapp: string;
};

export type AdminOrder = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  state: string;
  address: string;
  items: { productId: string; name: string; price: number; qty: number; image: string }[];
  total: number;
  status: string;
  admin_note: string;
  payment_confirmed_at: string | null;
  created_at: string;
};

export type AdminData = {
  orders: AdminOrder[];
  settings: StoreSettingsDto | null;
};

function getPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function passcodeOk(code: unknown): boolean {
  const expected = process.env["ADMIN_PASSCODE"];
  return typeof expected === "string" && expected.length > 0 && code === expected;
}

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await getPublicClient()
    .from("products")
    .select("id, name, category, price, fruiting, image")
    .eq("active", true)
    .order("sort");
  if (error) return { products: [] as ProductDto[], error: error.message };
  return { products: (data ?? []) as ProductDto[], error: null };
});

export const getStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await getPublicClient()
    .from("store_settings")
    .select("business_name, bank_name, account_number, account_name, whatsapp")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) {
    return {
      settings: null as StoreSettingsDto | null,
      error: error?.message ?? "Settings not configured yet",
    };
  }
  return { settings: data as StoreSettingsDto, error: null };
});

type PlaceOrderInput = {
  name: string;
  phone: string;
  state: string;
  address: string;
  items: { productId: string; qty: number }[];
};

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: PlaceOrderInput) => input)
  .handler(async ({ data }) => {
    const name = (data.name || "").trim();
    const phone = (data.phone || "").trim();
    const state = (data.state || "").trim();
    const address = (data.address || "").trim();
    if (!name || !phone || !state || !address) {
      return {
        ok: false as const,
        error: "Please fill in your name, phone number, state and address.",
      };
    }
    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return { ok: false as const, error: "Please enter a valid phone number." };
    }
    const items = (data.items || []).filter(
      (i) =>
        typeof i.productId === "string" &&
        i.productId.length === 36 &&
        Number.isInteger(i.qty) &&
        i.qty > 0 &&
        i.qty <= 999,
    );
    if (items.length === 0) {
      return { ok: false as const, error: "Your cart is empty." };
    }

    const supabase = getPublicClient();
    const { data: rows, error: pErr } = await supabase
      .from("products")
      .select("id, name, price, image")
      .in(
        "id",
        items.map((i) => i.productId),
      )
      .eq("active", true);
    if (pErr || !rows || rows.length === 0) {
      return {
        ok: false as const,
        error: "We couldn't verify the items in your cart. Please try again.",
      };
    }
    const byId = new Map(rows.map((r) => [r.id, r]));
    const orderItems: {
      productId: string;
      name: string;
      price: number;
      qty: number;
      image: string;
    }[] = [];
    let total = 0;
    for (const i of items) {
      const p = byId.get(i.productId);
      if (!p) continue;
      orderItems.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        qty: i.qty,
        image: p.image,
      });
      total += p.price * i.qty;
    }
    if (orderItems.length === 0) {
      return { ok: false as const, error: "Your cart items are no longer available." };
    }

    const order_code =
      "FS" +
      Date.now().toString(36).toUpperCase().slice(-6) +
      String(Math.floor(Math.random() * 900) + 100);
    const { error: oErr } = await supabase.from("orders").insert({
      order_code,
      customer_name: name,
      phone,
      state,
      address,
      items: orderItems,
      total,
      status: "pending_payment",
    });
    if (oErr) {
      return { ok: false as const, error: "We couldn't place your order. Please try again." };
    }
    return { ok: true as const, order_code, total, error: null };
  });

export const adminGetData = createServerFn({ method: "POST" })
  .inputValidator((input: { passcode: string }) => input)
  .handler(async ({ data }) => {
    if (!passcodeOk(data.passcode)) {
      return { ok: false as const, error: "Wrong admin code." };
    }
    const admin = await getAdminClient();
    const [ordersRes, settingsRes] = await Promise.all([
      admin.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
      admin
        .from("store_settings")
        .select("business_name, bank_name, account_number, account_name, whatsapp")
        .eq("id", "default")
        .maybeSingle(),
    ]);
    if (ordersRes.error) return { ok: false as const, error: ordersRes.error.message };
    return {
      ok: true as const,
      error: null,
      data: {
        orders: (ordersRes.data ?? []) as AdminOrder[],
        settings: (settingsRes.data ?? null) as StoreSettingsDto | null,
      },
    };
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: { passcode: string; orderId: string; status: string }) => input)
  .handler(async ({ data }) => {
    if (!passcodeOk(data.passcode)) return { ok: false as const, error: "Wrong admin code." };
    const allowed = ["pending_payment", "payment_confirmed", "delivered", "cancelled"];
    if (!allowed.includes(data.status)) return { ok: false as const, error: "Invalid status." };
    const admin = await getAdminClient();
    const patch: { status: string; payment_confirmed_at: string | null } = {
      status: data.status,
      payment_confirmed_at: data.status === "payment_confirmed" ? new Date().toISOString() : null,
    };
    const { error } = await admin.from("orders").update(patch).eq("id", data.orderId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, error: null };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      passcode: string;
      settings: {
        business_name: string;
        bank_name: string;
        account_number: string;
        account_name: string;
        whatsapp: string;
      };
    }) => input,
  )
  .handler(async ({ data }) => {
    if (!passcodeOk(data.passcode)) return { ok: false as const, error: "Wrong admin code." };
    const s = data.settings;
    const clean = {
      business_name: (s.business_name || "").trim().slice(0, 120),
      bank_name: (s.bank_name || "").trim().slice(0, 120),
      account_number: (s.account_number || "").trim().slice(0, 30),
      account_name: (s.account_name || "").trim().slice(0, 120),
      whatsapp: (s.whatsapp || "").trim().slice(0, 30),
      updated_at: new Date().toISOString(),
    };
    const admin = await getAdminClient();
    const { error } = await admin.from("store_settings").update(clean).eq("id", "default");
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, error: null };
  });
