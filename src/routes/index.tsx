import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { productsQueryOptions, settingsQueryOptions } from "@/lib/queries";
import type { ProductDto } from "@/lib/store.functions";
import { CartProvider, useCart } from "@/lib/cart";
import { CartDrawerOpenProvider, useCartDrawerOpen } from "@/lib/cart-drawer-open";
import { formatNaira } from "@/lib/nigeria";
import { CartDrawer } from "@/components/CartDrawer";
import logo from "@/assets/logo-badge.png";

const CATEGORIES = [
  "All",
  "Grapes",
  "Fruits",
  "Citrus",
  "Palms & Other Plants",
  "Premium",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fruitful Seedlings — Fruit Tree Seedlings Delivered Across Nigeria" },
      {
        name: "description",
        content:
          "Buy grafted grape vines, fruit trees, citrus and palm seedlings online. Pay by bank transfer, nationwide delivery to all 36 states + FCT.",
      },
      {
        property: "og:title",
        content: "Fruitful Seedlings — Fruit Tree Seedlings Delivered Across Nigeria",
      },
      {
        property: "og:description",
        content:
          "Grape vines, fruit trees, citrus, palms and premium seedlings. Order online, pay by transfer, delivered anywhere in Nigeria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions),
      context.queryClient.ensureQueryData(settingsQueryOptions),
    ]),
  component: Storefront,
});

function Storefront() {
  return (
    <CartProvider>
      <CartDrawerOpenProvider>
        <StorefrontInner />
      </CartDrawerOpenProvider>
    </CartProvider>
  );
}

function StorefrontInner() {
  const [category, setCategory] = useState("All");
  const { data } = useSuspenseQuery(productsQueryOptions);
  const products = data.products ?? [];
  const { count } = useCart();
  const { setOpen } = useCartDrawerOpen();

  const filtered = useMemo(
    () =>
      category === "All"
        ? products
        : products.filter((p: ProductDto) => p.category === category),
    [products, category],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" aria-label="Fruitful Seedlings home">
            <img src={logo} alt="Fruitful Seedlings" width={1536} height={768} className="h-12 w-auto" />
          </a>
          <button
            onClick={() => setOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            🛒 Cart
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-8 md:grid-cols-2 md:pt-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            🌱 Healthy grafted seedlings
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Grow your own harvest — from grape vines to fruit trees.
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Hand-picked seedlings of grapes, apples, mangoes, citrus, date palms and rare
            premium plants — delivered to every state in Nigeria.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Shop seedlings
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-input bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-accent/40"
            >
              How ordering works
            </a>
          </div>
        </div>
        <div className="relative">
          <img
            src="/images/products/sweet-sapphire.jpg"
            alt="Sweet Sapphire grape vine seedling in a nursery bag"
            width={1024}
            height={1024}
            className="aspect-square w-full rounded-3xl object-cover shadow-lg"
          />
          <div className="absolute bottom-4 left-4 rounded-2xl bg-card/95 px-4 py-3 shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Bestseller
            </p>
            <p className="font-display text-lg font-semibold text-foreground">
              Sweet Sapphire · {formatNaira(20000)}
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 rounded-3xl bg-card p-6 shadow-sm md:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold text-primary">1. Add to cart</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick any seedlings you want — mix varieties freely.
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-primary">2. Checkout &amp; transfer</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose delivery anywhere in Nigeria, then pay into our bank account.
            </p>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-primary">3. We confirm &amp; deliver</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once your payment shows, we confirm your order and dispatch your plants.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Our seedlings
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                "rounded-full px-4 py-2 text-sm font-medium transition " +
                (category === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-input bg-card text-foreground hover:bg-secondary")
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No seedlings in this category yet.
          </p>
        )}
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center">
          <p className="font-display text-lg font-semibold text-foreground">Fruitful Seedlings</p>
          <p className="max-w-lg text-xs text-muted-foreground">
            Fruiting periods are approximate and can vary depending on variety, plant age,
            climate, soil and care.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/track" className="underline">
              Track your order
            </Link>
            <Link to="/admin" className="underline">
              Store admin
            </Link>
          </div>
        </div>
      </footer>

      <CartDrawer />
      {count > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-lg transition hover:bg-primary/90 md:hidden"
          aria-label="Open cart"
        >
          🛒
        </button>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductDto }) {
  const { add } = useCart();
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className={
            "h-full w-full object-cover transition duration-300 group-hover:scale-105" +
            (product.in_stock ? "" : " opacity-50")
          }
        />
        {!product.in_stock && (
          <span className="absolute left-2 top-2 rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-foreground shadow-sm">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate font-display text-base font-semibold text-foreground">
          {product.name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Fruits in {product.fruiting}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-semibold text-primary">{formatNaira(product.price)}</span>
          {product.in_stock ? (
            <button
              onClick={() =>
                add({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              + Add
            </button>
          ) : (
            <span className="rounded-full border border-input bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
