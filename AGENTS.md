<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project: Fruitful Seedlings — online seedling store

- Payments are manual bank transfer only: the checkout shows store bank details from `store_settings` and orders wait in `pending_payment` until an admin confirms in `/admin`. Do not add a payment provider without asking.
- Admin access is a shared passcode stored as the `ADMIN_PASSCODE` secret, checked inside admin server functions; admin reads/writes go through `supabaseAdmin` loaded inside the handler. To change the code, update the secret.
- Product images live in `public/images/products/` and the DB rows store their URL paths; new products should reference a path there.
- All seedling prices and fruiting times came from the owner's price list and live in `public.products` (seeded by migration); edit prices via SQL or the products table, not hardcoded in components.
