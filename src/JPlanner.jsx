import { useState, useEffect, useCallback } from "react";

const COLORS = [
  { id: "coral", bg: "#FDDDD5", dot: "#D85A30", text: "#993C1D" },
  { id: "purple", bg: "#EEEDFE", dot: "#7F77DD", text: "#3C3489" },
  { id: "teal", bg: "#D4F1E7", dot: "#1D9E75", text: "#085041" },
  { id: "blue", bg: "#DDEEF9", dot: "#378ADD", text: "#0C447C" },
  { id: "amber", bg: "#FDF0D6", dot: "#EF9F27", text: "#854F0B" },
  { id: "pink", bg: "#FAEAF2", dot: "#D4537E", text: "#72243E" },
];

const STORAGE_KEY = "j-planner-data";

function pad(n) { return String(n).padStart(2, "0"); }
function nowTime() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function JPlanner() {
  const [tasks, setTasks] = useState([]);
  const [checkInTime, setCheckInTime] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ time: nowTime(), title: "", color: "coral", note: "" });
  const [punchAnim, setPunchAnim] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setTasks(data.tasks || []);
        setCheckInTime(data.checkInTime || null);
      }
    } catch {}
  }, []);

  const save = useCallback((t, c) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: t, checkInTime: c }));
    } catch {}
  }, []);

  const toggleTask = (id) => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(next);
    save(next, checkInTime);
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task = { id: Date.now(), ...newTask, done: false };
    const sorted = [...tasks, task].sort((a, b) => a.time.localeCompare(b.time));
    setTasks(sorted);
    save(sorted, checkInTime);
    setNewTask({ time: nowTime(), title: "", color: "coral", note: "" });
    setShowForm(false);
  };

  const deleteTask = (id) => {
    const next = tasks.filter(t => t.id !== id);
    setTasks(next);
    save(next, checkInTime);
  };

  const handleCheckIn = () => {
    if (checkInTime) return;
    const t = nowTime();
    setCheckInTime(t);
    setPunchAnim(true);
    save(tasks, t);
    setTimeout(() => setPunchAnim(false), 800);
  };

  const handleNewDay = () => {
    setTasks([]);
    setCheckInTime(null);
    setShowConfirm(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 520, margin: "0 auto", padding: "1.5rem 1rem 4rem", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Daily Plan</p>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 400, color: "#1a1a1a", lineHeight: 1.2 }}>{formatDate()}</h1>
        </div>
        <button onClick={handleCheckIn} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: checkInTime ? "#eaf7f2" : "#f5f5f5", border: checkInTime ? "0.5px solid #1D9E75" : "0.5px solid #ddd", borderRadius: 16, padding: "10px 16px", cursor: checkInTime ? "default" : "pointer", transform: punchAnim ? "scale(1.08)" : "scale(1)", transition: "all 0.25s ease", minWidth: 80 }}>
          <span style={{ fontSize: 20, marginBottom: 2 }}>{checkInTime ? "✓" : "⏱"}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: checkInTime ? "#0F6E56" : "#888" }}>{checkInTime ? checkInTime : "Check In"}</span>
          {checkInTime && <span style={{ fontSize: 10, color: "#0F6E56", marginTop: 1 }}>Checked in</span>}
        </button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#888" }}>Progress</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{done} of {total} ({pct}%)</span>
          </div>
          <div style={{ height: 6, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#1D9E75" : "#7F77DD", borderRadius: 99, transition: "width 0.5s ease" }} />
          </div>
          {pct === 100 && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#0F6E56", fontWeight: 500 }}>🎉 All done for today — nice work!</p>}
        </div>
      )}

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1rem" }}>
        {tasks.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#f9f9f9", borderRadius: 16, border: "0.5px dashed #ddd" }}>
            <p style={{ margin: 0, fontSize: 32, marginBottom: 8 }}>📋</p>
            <p style={{ margin: 0, fontSize: 14, color: "#888" }}>No tasks yet</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#bbb" }}>Add a task below to start planning your day</p>
          </div>
        )}
        {tasks.map(task => {
          const c = COLORS.find(x => x.id === task.color) || COLORS[0];
          return (
            <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: task.done ? "#f9f9f9" : c.bg, borderRadius: 14, padding: "12px 14px", border: `0.5px solid ${task.done ? "#eee" : c.dot + "33"}`, transition: "all 0.2s ease", opacity: task.done ? 0.65 : 1 }}>
              <div style={{ minWidth: 38, paddingTop: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: task.done ? "#bbb" : c.text }}>{task.time}</span>
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: task.done ? "#ddd" : c.dot }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: task.done ? "#bbb" : "#1a1a1a", textDecoration: task.done ? "line-through" : "none" }}>{task.title}</p>
                {task.note && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#bbb" }}>{task.note}</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ccc", padding: "2px 4px", lineHeight: 1 }}>×</button>
                <button onClick={() => toggleTask(task.id)} style={{ width: 28, height: 28, borderRadius: "50%", cursor: "pointer", border: "none", background: task.done ? c.dot : "transparent", outline: `2px solid ${task.done ? "transparent" : c.dot}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease", flexShrink: 0 }}>
                  {task.done && <span style={{ color: "white", fontSize: 14, lineHeight: 1 }}>✓</span>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: "white", border: "0.5px solid #e5e5e5", borderRadius: 16, padding: "16px", marginBottom: "0.75rem" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 500, color: "#888" }}>New task</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input type="time" value={newTask.time} onChange={e => setNewTask(p => ({ ...p, time: e.target.value }))} style={{ width: 110, fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid #ddd", background: "#f9f9f9", color: "#1a1a1a" }} />
            <input type="text" placeholder="Task name…" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} onKeyDown={e => e.key === "Enter" && addTask()} autoFocus style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid #ddd", background: "#f9f9f9", color: "#1a1a1a" }} />
          </div>
          <input type="text" placeholder="Note (optional)" value={newTask.note} onChange={e => setNewTask(p => ({ ...p, note: e.target.value }))} style={{ width: "100%", fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid #ddd", background: "#f9f9f9", color: "#1a1a1a", boxSizing: "border-box", marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {COLORS.map(c => (
              <button key={c.id} onClick={() => setNewTask(p => ({ ...p, color: c.id }))} style={{ width: 24, height: 24, borderRadius: "50%", background: c.dot, border: "none", cursor: "pointer", outline: newTask.color === c.id ? `3px solid ${c.dot}` : "none", outlineOffset: 2 }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setShowForm(false); setNewTask({ time: nowTime(), title: "", color: "coral", note: "" }); }} style={{ flex: 1, padding: "8px", fontSize: 13, borderRadius: 8, border: "0.5px solid #ddd", background: "transparent", cursor: "pointer", color: "#888" }}>Cancel</button>
            <button onClick={addTask} style={{ flex: 2, padding: "8px", fontSize: 13, fontWeight: 500, borderRadius: 8, border: "none", background: "#7F77DD", cursor: "pointer", color: "white" }}>Add task</button>
          </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => { setShowForm(true); setNewTask(p => ({ ...p, time: nowTime() })); }} style={{ width: "100%", padding: "11px", fontSize: 14, fontWeight: 500, borderRadius: 12, border: "0.5px dashed #ddd", background: "transparent", cursor: "pointer", color: "#aaa", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add task
        </button>
      )}

      {/* New Day button */}
      {tasks.length > 0 && (
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} style={{ fontSize: 12, color: "#ccc", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Start a new day (clears all tasks)
            </button>
          ) : (
            <div style={{ background: "#fff8f0", border: "0.5px solid #f5c89a", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#885500" }}>Clear everything and start fresh?</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button onClick={() => setShowConfirm(false)} style={{ padding: "6px 16px", fontSize: 13, borderRadius: 8, border: "0.5px solid #ddd", background: "transparent", cursor: "pointer", color: "#888" }}>Cancel</button>
                <button onClick={handleNewDay} style={{ padding: "6px 16px", fontSize: 13, borderRadius: 8, border: "none", background: "#EF9F27", cursor: "pointer", color: "white", fontWeight: 500 }}>Yes, new day</button>
              </div>
            </div>
          )}
        </div>
      )}

      <p style={{ textAlign: "center", marginTop: "2rem", fontSize: 11, color: "#ccc", letterSpacing: "0.08em" }}>PLAN · EXECUTE · CHECK IN · REPEAT</p>
    </div>
  );
}
