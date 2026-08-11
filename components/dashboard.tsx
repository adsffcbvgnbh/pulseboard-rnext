"use client";

import { useCallback, useEffect, useState } from "react";
import { useSharedStorage } from "./use-shared-storage";

type Page = "metric-counter" | "task-manager" | "server-metrics";
type Filter = "all" | "active" | "completed";
type Task = { id: number; name: string; completed: boolean };
type Metrics = {
  hostname: string; os: string; kernel: string; cpu_usage: number; cpu_cores: number;
  total_memory: number; used_memory: number; available_memory: number; uptime: number;
  status: string; active_users: number;
};

const tabs: { id: Page; label: string }[] = [
  { id: "metric-counter", label: "Metric Counter" },
  { id: "task-manager", label: "User Task Manager" },
  { id: "server-metrics", label: "Server Metrics" },
];

export function Dashboard() {
  const [page, setPage] = useSharedStorage<Page>("pulseboard.current-page", "metric-counter");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [refreshIn, setRefreshIn] = useState(5);

  const loadMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics", { cache: "no-store" });
      if (response.ok) setMetrics(await response.json());
    } catch { setMetrics(null); }
  }, []);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRefreshIn((value) => {
        if (value <= 1) { loadMetrics(); return 5; }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loadMetrics]);

  return (
    <section className="dashboard">
      <nav className="tabs" aria-label="Dashboard views">
        {tabs.map((tab) => (
          <button key={tab.id} className={page === tab.id ? "tab active" : "tab"} onClick={() => setPage(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      {page === "metric-counter" && <MetricCounter initial={metrics?.active_users ?? 0} />}
      {page === "task-manager" && <TaskManager />}
      {page === "server-metrics" && <ServerMetrics metrics={metrics} refreshIn={refreshIn} />}
    </section>
  );
}

function MetricCounter({ initial }: { initial: number }) {
  const [count, setCount] = useSharedStorage<number>("pulseboard.metric-counter", initial);
  return (
    <>
      <h1>Metric Counter</h1>
      <p className="subtitle">Track the active user count.</p>
      <div className="counter-card">
        <h3>Active Users</h3>
        <strong>{count}</strong>
        <div className="counter-actions">
          <button onClick={() => setCount((n) => n - 1)} aria-label="Decrease">−</button>
          <button onClick={() => setCount(initial)}>Reset</button>
          <button onClick={() => setCount((n) => n + 1)} aria-label="Increase">+</button>
        </div>
      </div>
    </>
  );
}

function TaskManager() {
  const [user, setUser] = useSharedStorage("pulseboard.current-user", "Default User");
  const [draftUser, setDraftUser] = useState(user);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const taskKey = `pulseboard.tasks.${user}`;
  const [tasks, setTasks] = useSharedStorage<Task[]>(taskKey, []);

  useEffect(() => setDraftUser(user), [user]);
  const visible = tasks.filter((task) => filter === "all" || (filter === "completed" ? task.completed : !task.completed));
  const completed = tasks.filter((task) => task.completed).length;
  const addTask = () => {
    const name = input.trim();
    if (!name) return;
    setTasks((items) => [...items, { id: Date.now(), name, completed: false }]);
    setInput("");
  };

  return (
    <>
      <h1>User Task Manager</h1>
      <section className="task-card">
        <h2>Task Manager</h2>
        <div className="row user-row">
          <input value={draftUser} placeholder="Username" onChange={(event) => setDraftUser(event.target.value)} />
          <button className="secondary" onClick={() => draftUser.trim() && setUser(draftUser.trim())}>Switch user</button>
        </div>
        <div className="summary">
          <b>Total: {tasks.length}</b>
          <div><b className="blue">Active: {tasks.length - completed}</b><b className="green">Completed: {completed}</b></div>
        </div>
        <div className="row add-row">
          <input value={input} placeholder="Enter new task" onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addTask()} />
          <button className="primary" onClick={addTask}>Add</button>
        </div>
        <div className="filters">
          {(["all", "active", "completed"] as Filter[]).map((name) => (
            <button className={filter === name ? "selected" : ""} key={name} onClick={() => setFilter(name)}>{name[0].toUpperCase() + name.slice(1)}</button>
          ))}
        </div>
        <ul className="tasks">
          {visible.map((task) => (
            <li key={task.id}>
              <label><input type="checkbox" checked={task.completed} onChange={() => setTasks((items) => items.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} /><span className={task.completed ? "done" : ""}>{task.name}</span></label>
              <button className="delete" onClick={() => setTasks((items) => items.filter((item) => item.id !== task.id))}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function ServerMetrics({ metrics, refreshIn }: { metrics: Metrics | null; refreshIn: number }) {
  const formatGb = (mb: number) => `${(mb / 1024).toFixed(2)} GB`;
  const formatUptime = (seconds: number) => `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  const telemetry = metrics ? [
    ["🟢 Status", metrics.status], ["💻 Host", metrics.hostname], ["🪟 Operating System", metrics.os],
    ["⚙ Kernel", metrics.kernel], ["🧠 CPU Cores", String(metrics.cpu_cores)], ["💾 Used RAM", formatGb(metrics.used_memory)],
    ["📦 Total RAM", formatGb(metrics.total_memory)], ["🟢 Available RAM", formatGb(metrics.available_memory)], ["⏱ Uptime", formatUptime(metrics.uptime)],
  ] : [];

  return (
    <>
      <h1>Server Metrics</h1>
      <div className="badges"><span>Refreshing in {refreshIn} seconds</span><span>Current date &amp; time: {new Date().toLocaleString("en-IN")}</span></div>
      <div className="stats">
        {metrics ? <><Stat title="Server" value={metrics.status} /><Stat title="Memory" value={`${(metrics.used_memory / metrics.total_memory * 100).toFixed(0)}%`} /><Stat title="CPU Usage" value={`${metrics.cpu_usage.toFixed(2)}%`} /></> : <><Skeleton /><Skeleton /><Skeleton /></>}
      </div>
      <section className="telemetry">
        <h2>🖥 Live Server Telemetry</h2>
        <div className="telemetry-grid">
          {metrics ? telemetry.map(([title, value]) => <div className="telemetry-card" key={title}><p>{title}</p><h3>{value}</h3></div>) : Array.from({ length: 9 }, (_, i) => <Skeleton key={i} compact />)}
        </div>
      </section>
    </>
  );
}

function Stat({ title, value }: { title: string; value: string }) { return <div className="stat"><h4>{title}</h4><h2>{value}</h2></div>; }
function Skeleton({ compact = false }: { compact?: boolean }) { return <div className={compact ? "skeleton compact" : "skeleton"}><i /><i /></div>; }
