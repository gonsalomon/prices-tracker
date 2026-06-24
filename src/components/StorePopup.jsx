import { useStoreReports } from "../hooks/useStoreReports";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return "ahora";
  if (diff < 60) return `hace ${diff} min`;
  if (diff < 1440) return `hace ${Math.floor(diff / 60)}h`;
  return `hace ${Math.floor(diff / 1440)}d`;
}

export default function StorePopup({ store, onClose, onReport }) {
  const { data: reports = [], isLoading } = useStoreReports(store.id);

  return (
    <div
    onClick={e => e.stopPropagation()}
      style={{
        position: "absolute",
        background: "white",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        padding: "14px 16px",
        width: 240,
        zIndex: 20,
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
          {store.name}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            fontSize: 16,
          }}
        >
          ✕
        </button>
      </div>

      {isLoading && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>Cargando reportes...</p>
      )}

      {!isLoading && reports.length === 0 && (
        <p style={{ fontSize: 13, color: "#6b7280" }}>Sin reportes aún.</p>
      )}

      {reports.map((r) => (
        <div
          key={r.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 0",
            borderBottom: "1px solid #f3f4f6",
            fontSize: 13,
          }}
        >
          <span style={{ color: "#374151" }}>{r.products?.name ?? "—"}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                color: r.is_available ? "#22c55e" : "#ef4444",
                fontWeight: 500,
              }}
            >
              {r.is_available ? "Disponible" : "Sin stock"}
            </span>
            <span style={{ color: "#9ca3af", fontSize: 11 }}>
              {timeAgo(r.reported_at)}
            </span>
          </span>
        </div>
      ))}
      <button
        className="btn-submit"
        style={{ width: "100%", marginTop: 10 }}
        onClick={onReport}
      >
        Reportar disponibilidad
      </button>
    </div>
  );
}
