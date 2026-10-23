import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useCartDrawerOpen } from "@/lib/cart-drawer-open";
import { formatNaira } from "@/lib/nigeria";

export function CartDrawer() {
  const { open, setOpen } = useCartDrawerOpen();
  const { items, total, setQty, remove } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <p className="font-display text-lg font-semibold text-foreground">Your cart</p>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-4xl">🛒</p>
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Browse seedlings
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 rounded-2xl border border-border bg-background p-2"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatNaira(item.price)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        className="h-7 w-7 rounded-full border border-input text-sm font-bold text-foreground transition hover:bg-secondary"
                        aria-label={"Reduce " + item.name}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        className="h-7 w-7 rounded-full border border-input text-sm font-bold text-foreground transition hover:bg-secondary"
                        aria-label={"Add another " + item.name}
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(item.productId)}
                        className="ml-auto text-xs text-destructive underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-display text-lg font-bold text-foreground">
                  {formatNaira(total)}
                </span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="mt-3 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Checkout — delivery &amp; payment
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
