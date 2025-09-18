import React from "react";

const API_BASE = (import.meta?.env?.VITE_API_BASE || "").replace(/\/$/, "");
const STATUSES = ["", "pending", "received", "confirmed", "shipping", "completed", "canceled"];

function fmtMoney(v, currency = "USD") {
  return Number(v || 0).toLocaleString(undefined, { style: "currency", currency });
}

function Badge({ children, color = "#e5e7eb", fg = "#111" }) {
  return (
    <span style={{
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: color,
      color: fg,
      whiteSpace: "nowrap"
    }}>{children}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   { c:"#fef3c7", f:"#92400e" },
    received:  { c:"#e0e7ff", f:"#3730a3" },
    confirmed: { c:"#d1fae5", f:"#065f46" },
    shipping:  { c:"#cffafe", f:"#155e75" },
    completed: { c:"#dcfce7", f:"#166534" },
    canceled:  { c:"#fee2e2", f:"#991b1b" }
  };
  const x = map[status] || { c:"#e5e7eb", f:"#111827" };
  return <Badge color={x.c} fg={x.f}>{status || "unknown"}</Badge>;
}

function PaidBadge({ paid }) {
  return paid
    ? <Badge color="#dcfce7" fg="#166534">Paid</Badge>
    : <Badge color="#f3f4f6" fg="#374151">Not paid</Badge>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50 }}>
      <div style={{
        width: "800px", maxHeight:"85vh", overflow:"auto",
        position:"fixed", left:"50%", top:"50%", transform:"translate(-50%, -50%)",
        background:"var(--modal-bg, #fff)", color:"inherit",
        borderRadius:12, padding:20
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <h3 style={{ fontSize:18, fontWeight:700 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={{ fontSize:22, lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [status, setStatus] = React.useState("");
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [detail, setDetail] = React.useState(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  // status editing
  const [newStatus, setNewStatus] = React.useState("");
  const [savingStatus, setSavingStatus] = React.useState(false);

  // deletion
  const [deletingId, setDeletingId] = React.useState(null);

  const token = localStorage.getItem("token"); // must be admin

  const fetchList = React.useCallback(async () => {
    setLoading(true); setError("");
    try {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(status ? { status } : {}),
        ...(q ? { q } : {})
      }).toString();

      const res = await fetch(`${API_BASE}/api/orders/admin?${qs}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, q, token]);

  React.useEffect(() => { fetchList(); }, [fetchList]);

  async function openDetail(id) {
    setLoadingDetail(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/orders/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      setDetail(data);
      setNewStatus(data.status || "pending"); // sync dropdown
    } catch (e) {
      setError(e.message || "Failed to load order");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function saveStatus() {
    if (!detail?._id) return;
    if (!newStatus || newStatus === detail.status) return;

    setSavingStatus(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/orders/admin/${detail._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);

      setDetail(d => ({ ...d, status: data.status }));
      setRows(list => list.map(r => r._id === detail._id ? { ...r, status: data.status } : r));
    } catch (e) {
      setError(e.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  }

  async function deleteOrder(id) {
    if (!id) return;
    if (!window.confirm("Delete this order? This cannot be undone.")) return;

    setDeletingId(id); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/orders/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);

      // Remove from list & adjust total
      setRows(list => list.filter(r => r._id !== id));
      setTotal(t => Math.max(0, t - 1));

      // If we were viewing it, close modal
      if (detail?._id === id) setDetail(null);
    } catch (e) {
      setError(e.message || "Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Orders</h2>

      {/* Filters */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 220px 100px auto", gap:8, alignItems:"center",
        marginBottom:12
      }}>
        <input
          placeholder="Search email / phone / name"
          value={q}
          onChange={(e)=> setQ(e.target.value)}
          style={{ height:36, border:"1px solid #e5e7eb", borderRadius:8, padding:"0 10px" }}
        />
        <select
          value={status}
          onChange={(e)=> { setStatus(e.target.value); setPage(1); }}
          style={{ height:36, border:"1px solid #e5e7eb", borderRadius:8, padding:"0 10px" }}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s ? s : "all statuses"}</option>)}
        </select>
        <select
          value={pageSize}
          onChange={(e)=> { setPageSize(Number(e.target.value)); setPage(1); }}
          style={{ height:36, border:"1px solid #e5e7eb", borderRadius:8, padding:"0 10px" }}
        >
          {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
        <button onClick={fetchList} style={{ height:36, border:"1px solid #e5e7eb", borderRadius:8, padding:"0 12px" }}>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:10 }}>
        <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
          <thead style={{ background:"#f9fafb" }}>
            <tr>
              <th style={th}>Order ID</th>
              <th style={th}>Buyer</th>
              <th style={th}>Contact</th>
              <th style={thRight}>Subtotal</th>
              <th style={thRight}>Total</th>
              <th style={th}>Paid</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={thCenter}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding:18, textAlign:"center" }}>Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={9} style={{ padding:18, color:"#b91c1c" }}>{error}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} style={{ padding:18, textAlign:"center" }}>No orders</td></tr>
            ) : rows.map(o => (
              <tr key={o._id} style={{ borderTop:"1px solid #e5e7eb" }}>
                <td style={tdMono}>{o._id}</td>
                <td style={td}>
                  <div style={{ fontWeight:600 }}>{o?.buyer?.fullName}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{o?.paymentMethod || "COD"}</div>
                </td>
                <td style={td}>
                  <div style={{ fontSize:13 }}>{o?.buyer?.email}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{o?.buyer?.phone}</div>
                </td>
                <td style={tdRight}>{fmtMoney(o.subtotal, o.currency || "USD")}</td>
                <td style={tdRight}>{fmtMoney(o.total, o.currency || "USD")}</td>
                <td style={td}><PaidBadge paid={o.isPaid} /></td>
                <td style={td}><StatusBadge status={o.status} /></td>
                <td style={tdSmall}>
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                </td>
                <td style={tdCenter}>
                  <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                    <button
                      onClick={()=> openDetail(o._id)}
                      style={{ padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:8 }}
                    >
                      View
                    </button>
                    <button
                      onClick={()=> deleteOrder(o._id)}
                      disabled={deletingId === o._id}
                      style={{
                        padding:"6px 10px",
                        border:"1px solid #ef4444",
                        color:"#ef4444",
                        borderRadius:8,
                        opacity: deletingId === o._id ? .6 : 1
                      }}
                    >
                      {deletingId === o._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
        <div style={{ fontSize:12, color:"#6b7280" }}>
          {total} result(s) • Page {page} of {pages}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button
            disabled={page <= 1}
            onClick={()=> setPage(p => Math.max(1, p - 1))}
            style={btnPager(page <= 1)}
          >
            ← Prev
          </button>
          <button
            disabled={page >= pages}
            onClick={()=> setPage(p => Math.min(pages, p + 1))}
            style={btnPager(page >= pages)}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detail}
        onClose={()=> setDetail(null)}
        title={detail ? `Order ${detail._id}` : "Order"}
      >
        {loadingDetail ? (
          <div>Loading…</div>
        ) : !detail ? null : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <h4 style={{ fontWeight:700, marginBottom:8 }}>Buyer</h4>
              <div style={{ fontSize:14 }}>
                <div><strong>Name:</strong> {detail.buyer?.fullName}</div>
                <div><strong>Email:</strong> {detail.buyer?.email}</div>
                <div><strong>Phone:</strong> {detail.buyer?.phone}</div>
                <div style={{ marginTop:6 }}>
                  <strong>Address:</strong>
                  <div>{detail.buyer?.address?.address1}</div>
                  {detail.buyer?.address?.address2 ? <div>{detail.buyer.address.address2}</div> : null}
                  <div>
                    {detail.buyer?.address?.city}{detail.buyer?.address?.state ? `, ${detail.buyer.address.state}` : ""} {detail.buyer?.address?.postalCode}
                  </div>
                  <div>{detail.buyer?.address?.country}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight:700, marginBottom:8 }}>Summary</h4>
              <div style={{ display:"grid", gap:8, fontSize:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <strong>Status:</strong> <StatusBadge status={detail.status} />
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <select
                    value={newStatus}
                    onChange={(e)=> setNewStatus(e.target.value)}
                    style={{ height:36, border:"1px solid #e5e7eb", borderRadius:8, padding:"0 10px" }}
                  >
                    {STATUSES.filter(Boolean).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={saveStatus}
                    disabled={savingStatus || !newStatus || newStatus === detail.status}
                    style={{
                      height:36, padding:"0 12px", border:"1px solid #e5e7eb",
                      borderRadius:8, background:"#111", color:"#fff",
                      opacity: (savingStatus || newStatus === detail.status) ? .6 : 1
                    }}
                  >
                    {savingStatus ? "Saving…" : "Save status"}
                  </button>

                  {/* Delete inside modal */}
                  <button
                    onClick={()=> deleteOrder(detail._id)}
                    disabled={deletingId === detail._id}
                    style={{
                      height:36, padding:"0 12px",
                      border:"1px solid #ef4444",
                      color:"#ef4444",
                      borderRadius:8,
                      opacity: deletingId === detail._id ? .6 : 1
                    }}
                  >
                    {deletingId === detail._id ? "Deleting…" : "Delete order"}
                  </button>
                </div>

                <div><strong>Payment:</strong> <PaidBadge paid={detail.isPaid} /></div>
                <div><strong>Subtotal:</strong> {fmtMoney(detail.subtotal, detail.currency || "USD")}</div>
                <div><strong>Shipping:</strong> {fmtMoney(detail.shipping, detail.currency || "USD")}</div>
                <div><strong>Tax:</strong> {fmtMoney(detail.tax, detail.currency || "USD")}</div>
                <div><strong>Total:</strong> {fmtMoney(detail.total, detail.currency || "USD")}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginTop:6 }}>
                  Placed: {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : ""}
                </div>
              </div>
            </div>

            <div style={{ gridColumn:"1 / -1" }}>
              <h4 style={{ fontWeight:700, marginBottom:8 }}>Items</h4>
              <div style={{ overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:8 }}>
                <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
                  <thead style={{ background:"#f9fafb" }}>
                    <tr>
                      <th style={th}>Product</th>
                      <th style={thRight}>Price</th>
                      <th style={thCenter}>Qty</th>
                      <th style={thRight}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items || []).map((it, idx) => (
                      <tr key={idx} style={{ borderTop:"1px solid #e5e7eb" }}>
                        <td style={td}>{it.title || it.product?.title || "-"}</td>
                        <td style={tdRight}>{fmtMoney(it.price, detail.currency || "USD")}</td>
                        <td style={tdCenter}>{it.qty}</td>
                        <td style={tdRight}>{fmtMoney(it.subtotal, detail.currency || "USD")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}

/* table cell styles */
const th = { textAlign:"left", fontSize:12, padding:"10px 12px", fontWeight:700, color:"#374151" };
const thRight = { ...th, textAlign:"right" };
const thCenter = { ...th, textAlign:"center" };
const td = { padding:"10px 12px", fontSize:14, verticalAlign:"top" };
const tdSmall = { ...td, fontSize:12, color:"#6b7280" };
const tdRight = { ...td, textAlign:"right" };
const tdCenter = { ...td, textAlign:"center" };
const tdMono = { 
  ...td, 
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`, 
  fontSize: 12 
};

const btnPager = (disabled) => ({
  padding:"6px 12px",
  border:"1px solid #e5e7eb",
  borderRadius:8,
  opacity: disabled ? .5 : 1,
  cursor: disabled ? "not-allowed" : "pointer"
});
