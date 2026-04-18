import { useState, useEffect } from "react";

export default function App() {
  const [view, setView] = useState("report");
  const [incidents, setIncidents] = useState([]);

  const [form, setForm] = useState({
    type: "",
    severity: "",
    description: "",
    location: "",
  });

  // 📍 Location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      setForm({ ...form, location: coords });
      alert("📍 Location captured");
    });
  };

  // 🚨 Submit
  const submit = () => {
    const newIncident = {
      id: Date.now(),
      status: "reported",
      createdAt: Date.now(),
      ...form,
    };

    setIncidents([newIncident, ...incidents]);
    alert("🚨 Emergency Reported Successfully!");
  };

  // 🔄 Update
  const updateStatus = (id, status) => {
    setIncidents(
      incidents.map((i) =>
        i.id === id ? { ...i, status } : i
      )
    );
  };

  // 🤖 Suggestion
  const getSuggestion = (type) => {
    if (type.includes("Fire")) return "🚒 Fire Brigade";
    if (type.includes("Medical")) return "🚑 Ambulance";
    if (type.includes("Accident")) return "🚓 Police + Ambulance";
    return "🚑 Emergency Unit";
  };

  // ⏱ Timer refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (time) => {
    const diff = Math.floor((Date.now() - time) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // 🔥 Priority sorting
  const sortedIncidents = [...incidents].sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.severity] - priority[a.severity];
  });

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#f4f6f8", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <div style={{
        background: "#111827",
        color: "white",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h2 style={{ margin: 0 }}>🚨 Rakshak</h2>
        <div>
          <button style={navBtn} onClick={() => setView("report")}>Report</button>
          <button style={navBtn} onClick={() => setView("dashboard")}>Dashboard</button>
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 650, margin: "auto" }}>

        {/* REPORT */}
        {view === "report" && (
          <>
            <h2 style={heading}>Report Emergency</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["🔥 Fire", "🚗 Accident", "🏥 Medical", "⚠️ Other"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  style={{
                    ...cardBtn,
                    background: form.type === t ? "#ef4444" : "white",
                    color: form.type === t ? "white" : "#111"
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <br />

            <select style={input} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option>Select Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <br /><br />

            <input
              placeholder="Describe situation..."
              style={input}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <br /><br />

            <button style={secondaryBtn} onClick={getLocation}>📍 Use Location</button>

            <br /><br />

            <button style={primaryBtn} onClick={submit}>
              🚨 Submit Emergency
            </button>
          </>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <>
            <h2 style={heading}>🧑‍🚒 Responder Dashboard</h2>

            <div style={{ marginBottom: 15, color: "#555" }}>
              Total: {incidents.length} | High: {incidents.filter(i => i.severity === "high").length}
            </div>

            {sortedIncidents.map((i) => (
              <div
                key={i.id}
                style={{
                  background: "white",
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  boxShadow: i.severity === "high"
                    ? "0 0 12px rgba(255,0,0,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "0.3s"
                }}
              >
                <b>{i.type}</b> | {i.severity}
                <p style={text}>{i.description}</p>

                <p style={text}>📍 {i.location || "Not provided"}</p>
                <p style={text}>⏱ {getTimeAgo(i.createdAt)}</p>

                <p style={text}><b>Suggested:</b> {getSuggestion(i.type)}</p>

                <p style={text}>
                  {i.status === "reported" && "🟡 Reported"}
                  {i.status.includes("Dispatched") && "🟠 Dispatched"}
                  {i.status === "resolved" && "🟢 Resolved"}
                </p>

                <div style={{ marginTop: 10 }}>
                  <button style={actionBtn} onClick={() => updateStatus(i.id, "🚒 Fire Dispatched")}>🚒</button>
                  <button style={actionBtn} onClick={() => updateStatus(i.id, "🚑 Ambulance Dispatched")}>🚑</button>
                  <button style={actionBtn} onClick={() => updateStatus(i.id, "🚓 Police Dispatched")}>🚓</button>
                  <button style={actionBtn} onClick={() => updateStatus(i.id, "resolved")}>✅</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* 🎨 STYLES */
const heading = { marginBottom: 10 };

const text = { margin: "6px 0", color: "#444" };

const navBtn = {
  marginLeft: 10,
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer"
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const primaryBtn = {
  width: "100%",
  padding: 14,
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
};

const secondaryBtn = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  cursor: "pointer"
};

const cardBtn = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  cursor: "pointer",
  transition: "0.3s"
};

const actionBtn = {
  marginRight: 6,
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer"
};