/* ==========================================================================
   PHILEON — ADMIN INVENTORY  (Layer 5)

   Only THE INSPIRATION VAULT may be READY TO SHIP with finite stock.
   All other PHILEON merchandise is MADE TO ORDER by default. The server
   is the authority — the READY TO SHIP action is refused for non-Vault
   slugs with 409 READY_TO_SHIP_RESTRICTED_TO_INSPIRATION_VAULT.

   Backend contracts (single source of truth — never duplicated here):
     GET  /api/admin/inventory?mode=&low_stock=&vault_only=
     GET  /api/admin/inventory/vault-slugs
     POST /api/admin/inventory/upsert
     POST /api/admin/inventory/{key}/adjust
     POST /api/admin/inventory/{key}/mark-unavailable
     POST /api/admin/inventory/{key}/re-enable
     GET  /api/admin/inventory/{key}/audit
     GET  /api/admin/inventory/reconcile/stale-reservations
   ========================================================================== */
import React, { useEffect, useMemo, useState } from "react";
import {
  Archive, Search, PlusCircle, PauseCircle, PlayCircle,
  History, RefreshCcw, AlertCircle, Loader,
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

function authHeaders() {
  const t = localStorage.getItem("phileon_admin_token") || "";
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const TABS = [
  { key: "all",             label: "All" },
  { key: "vault",           label: "Inspiration Vault" },
  { key: "made_to_order",   label: "Made to Order" },
  { key: "ready_to_ship",   label: "Ready to Ship" },
  { key: "low_stock",       label: "Low Stock" },
  { key: "sold_out",        label: "Sold Out" },
  { key: "unavailable",     label: "Unavailable" },
];

function tabToQuery(tab) {
  if (tab === "all") return "";
  if (tab === "vault") return "?vault_only=true";
  if (tab === "low_stock") return "?low_stock=true";
  return `?mode=${encodeURIComponent(tab)}`;
}

function stateLabel(item) {
  if (item.manual_unavailable) return "UNAVAILABLE";
  if (item.availability_mode === "unavailable") return "UNAVAILABLE";
  if (item.availability_mode === "made_to_order") return "MADE TO ORDER";
  if (item.availability_mode === "ready_to_ship") {
    return item.available <= 0 ? "SOLD OUT" : "READY TO SHIP";
  }
  return "—";
}

export default function AdminInventory() {
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [vaultSlugs, setVaultSlugs] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState(null);   // selected inventory item
  const [audit, setAudit] = useState([]);

  const loadVault = async () => {
    try {
      const r = await fetch(`${API}/api/admin/inventory/vault-slugs`, {
        headers: { ...authHeaders() },
      });
      if (r.ok) {
        const d = await r.json();
        setVaultSlugs(d.slugs || []);
      }
    } catch (_) { /* non-fatal */ }
  };

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(
        `${API}/api/admin/inventory${tabToQuery(tab)}`,
        { headers: { ...authHeaders() } },
      );
      if (r.status === 401 || r.status === 403) {
        setErr("Admin session expired. Please sign in again.");
        setItems([]);
        return;
      }
      const d = await r.json();
      setItems(d.items || []);
    } catch (e) {
      setErr("Could not load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVault(); }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((i) =>
      (i.product_slug || "").toLowerCase().includes(needle) ||
      (i.variant || "").toLowerCase().includes(needle) ||
      (i.inventory_key || "").toLowerCase().includes(needle)
    );
  }, [items, q]);

  return (
    <div className="min-h-screen bg-phileon-charcoal text-phileon-cream" data-testid="admin-inventory-page">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="flex items-center gap-3">
          <Archive className="w-7 h-7 text-phileon-gold" />
          <h1 className="font-serif text-3xl tracking-[0.12em]">Inventory</h1>
          <p className="text-xs text-phileon-cream/60 ml-3 tracking-wide">
            The Inspiration Vault is the only PHILEON collection with
            finite physical stock. All other pieces are Made to Order.
          </p>
        </header>

        {/* Tabs */}
        <nav className="flex flex-wrap gap-2" data-testid="inv-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              data-testid={`inv-tab-${t.key}`}
              className={
                "px-3 py-1.5 text-xs tracking-[0.14em] uppercase border transition-colors " +
                (tab === t.key
                  ? "border-phileon-gold text-phileon-gold"
                  : "border-phileon-cream/20 text-phileon-cream/70 hover:text-phileon-cream")
              }
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Search / actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-phileon-cream/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by slug, variant, or key"
              data-testid="inv-search"
              className="w-full pl-10 pr-3 py-2 bg-phileon-charcoal border border-phileon-cream/15 text-sm focus:outline-none focus:border-phileon-gold"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            data-testid="inv-create-btn"
            className="inline-flex items-center gap-2 px-4 py-2 border border-phileon-gold text-phileon-gold text-xs tracking-[0.14em] uppercase hover:bg-phileon-gold hover:text-phileon-charcoal transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Configure Vault Piece
          </button>
        </div>

        {err && (
          <div className="flex items-center gap-2 text-red-400 text-sm" data-testid="inv-error">
            <AlertCircle className="w-4 h-4" /> {err}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-phileon-cream/60 text-sm">
            <Loader className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : (
          <InventoryTable
            items={filtered}
            onOpen={async (item) => {
              setDetail(item);
              try {
                const r = await fetch(
                  `${API}/api/admin/inventory/${item.inventory_key}/audit`,
                  { headers: { ...authHeaders() } },
                );
                const d = await r.json();
                setAudit(d.entries || []);
              } catch (_) {
                setAudit([]);
              }
            }}
          />
        )}

        {showCreate && (
          <CreateVaultDialog
            vaultSlugs={vaultSlugs}
            onClose={() => setShowCreate(false)}
            onSaved={async () => { setShowCreate(false); await load(); }}
          />
        )}

        {detail && (
          <DetailDialog
            item={detail}
            audit={audit}
            onClose={() => setDetail(null)}
            onChanged={async () => { await load(); }}
          />
        )}
      </div>
    </div>
  );
}


function InventoryTable({ items, onOpen }) {
  if (!items.length) {
    return (
      <div className="border border-phileon-cream/10 p-6 text-phileon-cream/50 text-sm" data-testid="inv-empty">
        No inventory records in this view yet. Configure a Vault piece to begin.
      </div>
    );
  }
  return (
    <div className="border border-phileon-cream/10 overflow-x-auto" data-testid="inv-table">
      <table className="w-full text-sm">
        <thead className="bg-phileon-charcoal/60 text-phileon-cream/60 uppercase tracking-widest text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Slug</th>
            <th className="px-3 py-2 text-left">Variant</th>
            <th className="px-3 py-2 text-left">Collection</th>
            <th className="px-3 py-2 text-left">State</th>
            <th className="px-3 py-2 text-right">On Hand</th>
            <th className="px-3 py-2 text-right">Reserved</th>
            <th className="px-3 py-2 text-right">Available</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr
              key={i.inventory_key}
              className="border-t border-phileon-cream/5 hover:bg-phileon-cream/[0.03]"
              data-testid={`inv-row-${i.inventory_key}`}
            >
              <td className="px-3 py-2 font-mono">{i.product_slug || "—"}</td>
              <td className="px-3 py-2 text-phileon-cream/70">{i.variant || "—"}</td>
              <td className="px-3 py-2 text-xs">
                {i.is_inspiration_vault ? (
                  <span className="text-phileon-gold tracking-widest">VAULT</span>
                ) : (
                  <span className="text-phileon-cream/50">CATALOG</span>
                )}
              </td>
              <td className="px-3 py-2 tracking-widest text-xs">
                {stateLabel(i)}
              </td>
              <td className="px-3 py-2 text-right font-mono">{i.stock_on_hand}</td>
              <td className="px-3 py-2 text-right font-mono">{i.stock_reserved}</td>
              <td className="px-3 py-2 text-right font-mono">{i.available}</td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onOpen(i)}
                  data-testid={`inv-open-${i.inventory_key}`}
                  className="text-xs text-phileon-gold hover:underline"
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function CreateVaultDialog({ vaultSlugs, onClose, onSaved }) {
  const [slug, setSlug] = useState(vaultSlugs[0] || "");
  const [variant, setVariant] = useState("default");
  const [stock, setStock] = useState(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`${API}/api/admin/inventory/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          slug,
          variant,
          availability_mode: "ready_to_ship",
          stock_on_hand: Number(stock) || 0,
          owner_note: note || null,
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        const code = (d.detail && d.detail.code) || `HTTP_${r.status}`;
        if (code === "READY_TO_SHIP_RESTRICTED_TO_INSPIRATION_VAULT") {
          setErr("READY TO SHIP is reserved for The Inspiration Vault.");
        } else {
          setErr(code);
        }
        setBusy(false);
        return;
      }
      await onSaved();
    } catch (e) {
      setErr("Save failed.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" data-testid="inv-create-dialog">
      <div className="max-w-lg w-full bg-phileon-charcoal border border-phileon-gold/40 p-6 space-y-4">
        <h2 className="font-serif text-xl text-phileon-gold tracking-widest">
          Configure Vault Piece
        </h2>
        <p className="text-xs text-phileon-cream/60 leading-relaxed">
          Only The Inspiration Vault may be configured as READY TO SHIP.
          Choose a Vault slug, variant, and the actual physical quantity in
          your possession. No default quantity will be invented.
        </p>

        <label className="block text-xs uppercase tracking-widest text-phileon-cream/60">
          Vault Slug
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            data-testid="inv-create-slug"
            className="mt-1 w-full bg-phileon-charcoal border border-phileon-cream/20 p-2 text-sm"
          >
            {vaultSlugs.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="block text-xs uppercase tracking-widest text-phileon-cream/60">
          Variant (leave `default` if the piece has no variants)
          <input
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            data-testid="inv-create-variant"
            className="mt-1 w-full bg-phileon-charcoal border border-phileon-cream/20 p-2 text-sm"
          />
        </label>

        <label className="block text-xs uppercase tracking-widest text-phileon-cream/60">
          Physical Stock On Hand
          <input
            type="number" min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            data-testid="inv-create-stock"
            className="mt-1 w-full bg-phileon-charcoal border border-phileon-cream/20 p-2 text-sm"
          />
        </label>

        <label className="block text-xs uppercase tracking-widest text-phileon-cream/60">
          Owner Note (optional)
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            data-testid="inv-create-note"
            className="mt-1 w-full bg-phileon-charcoal border border-phileon-cream/20 p-2 text-sm"
          />
        </label>

        {err && <div className="text-red-400 text-sm" data-testid="inv-create-err">{err}</div>}

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} type="button" className="px-4 py-2 text-xs text-phileon-cream/70 hover:text-phileon-cream" data-testid="inv-create-cancel">Cancel</button>
          <button
            onClick={save}
            disabled={busy || !slug}
            type="button"
            data-testid="inv-create-save"
            className="px-4 py-2 border border-phileon-gold text-phileon-gold text-xs tracking-[0.14em] uppercase hover:bg-phileon-gold hover:text-phileon-charcoal transition-colors disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}


function DetailDialog({ item, audit, onClose, onChanged }) {
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const key = item.inventory_key;

  const doAction = async (path, body) => {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`${API}/api/admin/inventory/${key}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: body ? JSON.stringify(body) : "{}",
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setErr((d.detail && d.detail.code) || `HTTP_${r.status}`);
        return;
      }
      await onChanged();
      onClose();
    } catch (_) {
      setErr("Action failed.");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" data-testid="inv-detail-dialog">
      <div className="max-w-2xl w-full bg-phileon-charcoal border border-phileon-gold/40 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl text-phileon-gold tracking-widest">{item.product_slug}</h2>
            <p className="text-xs text-phileon-cream/60 mt-1">
              {item.variant || "—"}
              {item.is_inspiration_vault && (
                <span className="ml-3 text-phileon-gold tracking-widest">INSPIRATION VAULT</span>
              )}
            </p>
          </div>
          <span className="tracking-widest text-xs text-phileon-cream/70">
            {stateLabel(item)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Stat label="On Hand" value={item.stock_on_hand} testid="detail-on-hand" />
          <Stat label="Reserved" value={item.stock_reserved} testid="detail-reserved" />
          <Stat label="Available" value={item.available} testid="detail-available" />
        </div>

        {err && <div className="text-red-400 text-sm" data-testid="inv-detail-err">{err}</div>}

        <div className="border-t border-phileon-cream/10 pt-4 space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-phileon-cream/60">Adjust Stock</h3>
          <div className="flex gap-2">
            <input
              type="number" value={delta} onChange={(e) => setDelta(e.target.value)}
              placeholder="delta (+/-)"
              data-testid="inv-adjust-delta"
              className="w-32 bg-phileon-charcoal border border-phileon-cream/20 p-2 text-sm"
            />
            <input
              type="text" value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="reason (required)"
              data-testid="inv-adjust-reason"
              className="flex-1 bg-phileon-charcoal border border-phileon-cream/20 p-2 text-sm"
            />
            <button
              type="button"
              disabled={busy || !reason || !Number(delta)}
              onClick={() => doAction("adjust", { delta: Number(delta), reason })}
              data-testid="inv-adjust-btn"
              className="px-3 py-2 text-xs tracking-widest uppercase border border-phileon-gold text-phileon-gold hover:bg-phileon-gold hover:text-phileon-charcoal disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="border-t border-phileon-cream/10 pt-4 flex gap-3 flex-wrap">
          {item.manual_unavailable ? (
            <button
              type="button" onClick={() => doAction("re-enable")}
              disabled={busy}
              data-testid="inv-re-enable-btn"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs tracking-widest uppercase border border-phileon-gold text-phileon-gold hover:bg-phileon-gold hover:text-phileon-charcoal"
            >
              <PlayCircle className="w-4 h-4" /> Re-enable
            </button>
          ) : (
            <button
              type="button" onClick={() => doAction("mark-unavailable")}
              disabled={busy}
              data-testid="inv-mark-unavailable-btn"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs tracking-widest uppercase border border-phileon-cream/30 text-phileon-cream hover:border-phileon-gold hover:text-phileon-gold"
            >
              <PauseCircle className="w-4 h-4" /> Mark Unavailable
            </button>
          )}
          <button type="button" onClick={onClose} className="ml-auto text-xs text-phileon-cream/60 hover:text-phileon-cream" data-testid="inv-detail-close">Close</button>
        </div>

        <div className="border-t border-phileon-cream/10 pt-4 space-y-2" data-testid="inv-detail-audit">
          <h3 className="text-xs uppercase tracking-widest text-phileon-cream/60 flex items-center gap-2">
            <History className="w-4 h-4" /> Audit
          </h3>
          <ul className="space-y-2 text-xs text-phileon-cream/70 max-h-64 overflow-y-auto">
            {audit.map((a, i) => (
              <li key={i} className="border-l border-phileon-gold/40 pl-3">
                <div className="tracking-widest uppercase text-phileon-gold/80">{a.action}</div>
                <div>{a.reason} — Δ {a.delta}</div>
                <div className="text-phileon-cream/40">
                  on_hand: {a.stock_before}→{a.stock_after} · reserved: {a.reserved_before}→{a.reserved_after}
                </div>
              </li>
            ))}
            {!audit.length && <li className="text-phileon-cream/40">No audit entries yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}


function Stat({ label, value, testid }) {
  return (
    <div className="border border-phileon-cream/10 p-3">
      <div className="text-[10px] uppercase tracking-widest text-phileon-cream/50">{label}</div>
      <div className="mt-1 font-mono text-lg" data-testid={testid}>{value}</div>
    </div>
  );
}
