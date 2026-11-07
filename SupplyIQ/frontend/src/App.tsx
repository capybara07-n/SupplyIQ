import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  ChevronDown,
  ChevronRight,
  Clock3,
  Command,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { getDashboard, resolveAlert } from "./api";
import type { Alert, Dashboard } from "./types";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
const demo: Dashboard = {
  kpis: {
    inventory_value: 481230,
    fill_rate: 94.7,
    at_risk_products: 4,
    open_alerts: 4,
    supplier_otd: 89.7,
    forecast_accuracy: 92.4,
    inventory_delta: -3.2,
    fill_rate_delta: 1.8,
  },
  inventory_health: [
    { name: "Healthy", value: 4, color: "#2CB67D" },
    { name: "Low stock", value: 2, color: "#F2B84B" },
    { name: "Critical", value: 2, color: "#EF6A67" },
  ],
  risk_distribution: [
    { name: "Low", value: 3, color: "#2CB67D" },
    { name: "Medium", value: 2, color: "#F2B84B" },
    { name: "High", value: 3, color: "#EF6A67" },
  ],
  demand_trend: [
    "05 Jun",
    "12 Jun",
    "19 Jun",
    "26 Jun",
    "03 Jul",
    "10 Jul",
    "17 Jul",
    "24 Jul",
    "31 Jul",
    "07 Aug",
    "14 Aug",
  ].map((date, i) => ({
    date,
    actual: 3100 + Math.round(Math.sin(i * 0.8) * 420 + i * 68),
    forecast: 3220 + Math.round(Math.sin(i * 0.76) * 350 + i * 72),
  })),
  category_inventory: [
    { name: "Electronics", value: 176400 },
    { name: "Mechanical", value: 96300 },
    { name: "Raw materials", value: 128700 },
    { name: "Packaging", value: 79800 },
  ],
  critical_products: [
    {
      id: 5,
      sku: "SIQ-5517",
      name: "Lithium Cell 4500",
      stock: 610,
      reorder_point: 720,
      risk_score: 91,
      supplier: "Pacific Microtech",
      days_cover: 9.7,
    },
    {
      id: 1,
      sku: "SIQ-1042",
      name: "Precision Sensor X1",
      stock: 184,
      reorder_point: 260,
      risk_score: 84,
      supplier: "Pacific Microtech",
      days_cover: 5.9,
    },
    {
      id: 3,
      sku: "SIQ-3098",
      name: "Aluminium Housing",
      stock: 208,
      reorder_point: 190,
      risk_score: 71,
      supplier: "Atlas Industrial",
      days_cover: 12,
    },
    {
      id: 2,
      sku: "SIQ-2841",
      name: "Control Board Pro",
      stock: 390,
      reorder_point: 320,
      risk_score: 62,
      supplier: "Apex Components",
      days_cover: 16,
    },
  ],
  supplier_performance: [
    {
      id: 3,
      name: "Pacific Microtech",
      region: "Taiwan",
      on_time_rate: 78.6,
      defect_rate: 3.9,
      lead_days: 27,
      risk_score: 76,
      status: "Critical",
    },
    {
      id: 5,
      name: "Atlas Industrial",
      region: "Germany",
      on_time_rate: 87.3,
      defect_rate: 2.6,
      lead_days: 22,
      risk_score: 54,
      status: "At Risk",
    },
    {
      id: 2,
      name: "Nordic Materials",
      region: "Sweden",
      on_time_rate: 91.2,
      defect_rate: 1.8,
      lead_days: 19,
      risk_score: 36,
      status: "Watch",
    },
    {
      id: 1,
      name: "Apex Components",
      region: "India",
      on_time_rate: 96.4,
      defect_rate: 1.1,
      lead_days: 12,
      risk_score: 18,
      status: "Healthy",
    },
  ],
  alerts: [
    {
      id: 1,
      severity: "Critical",
      alert_type: "Stockout",
      title: "Lithium Cell stockout projected",
      message: "Available stock covers only 9.7 days of expected demand.",
      entity: "SIQ-5517",
      recommendation:
        "Expedite PO-24081 and move 350 units from the Pune warehouse.",
      created_at: new Date().toISOString(),
      status: "Open",
    },
    {
      id: 2,
      severity: "High",
      alert_type: "Supplier",
      title: "Pacific Microtech delivery risk",
      message: "On-time delivery declined 11.4% over the last 60 days.",
      entity: "Pacific Microtech",
      recommendation:
        "Confirm production capacity and activate the secondary supplier quote.",
      created_at: new Date().toISOString(),
      status: "Open",
    },
  ],
};

function Metric({
  label,
  value,
  sub,
  delta,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  delta?: number;
  icon: any;
  tone: string;
}) {
  return (
    <div className="metric">
      <div className={`metric-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-sub">
        {delta !== undefined && (
          <span className={delta >= 0 ? "up" : "down"}>
            {delta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
            {Math.abs(delta)}%
          </span>
        )}
        {sub}
      </div>
    </div>
  );
}
function RiskPill({ score }: { score: number }) {
  let c = score >= 65 ? "danger" : score >= 35 ? "warn" : "good";
  return (
    <span className={`risk ${c}`}>
      <i />
      {score} · {score >= 65 ? "High" : score >= 35 ? "Medium" : "Low"}
    </span>
  );
}
function EmptyError({ retry }: { retry: () => void }) {
  return (
    <div className="error">
      <AlertTriangle />
      <h2>We couldn't load live data</h2>
      <p>The demo snapshot is shown. Start the API to use your local data.</p>
      <button onClick={retry}>Try API again</button>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<Dashboard>(demo),
    [loading, setLoading] = useState(true),
    [offline, setOffline] = useState(false),
    [mobile, setMobile] = useState(false),
    [alertsOpen, setAlertsOpen] = useState(false),
    [query, setQuery] = useState(""),
    [period, setPeriod] = useState(90);
  const load = () => {
    setLoading(true);
    getDashboard()
      .then((d) => {
        setData(d);
        setOffline(false);
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const critical = useMemo(
    () =>
      data.alerts.filter(
        (a) => a.severity === "Critical" || a.severity === "High",
      ),
    [data],
  );
  const jump = (id: string) => {
    setMobile(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const search = () => {
    const found = data.critical_products.find((p) =>
      `${p.name} ${p.sku} ${p.supplier}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    if (found) {
      jump("inventory");
      setTimeout(
        () =>
          document
            .getElementById(`product-${found.id}`)
            ?.classList.add("highlight"),
        500,
      );
    } else if (query) alert(`No result found for “${query}”.`);
  };
  const downloadBrief = () => {
    const body = `SupplyIQ Executive Brief\n${new Date().toLocaleString()}\n\nInventory value: ${money(data.kpis.inventory_value)}\nFill rate: ${data.kpis.fill_rate}%\nProducts at risk: ${data.kpis.at_risk_products}\nSupplier on-time: ${data.kpis.supplier_otd}%\n\nRecommendation: ${data.alerts[0]?.recommendation || "No open recommendations."}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    a.download = "supplyiq-executive-brief.txt";
    a.click();
  };
  const handleResolve = async (a: Alert) => {
    try {
      await resolveAlert(a.id);
      setData((d) => ({
        ...d,
        alerts: d.alerts.filter((x) => x.id !== a.id),
        kpis: { ...d.kpis, open_alerts: d.kpis.open_alerts - 1 },
      }));
    } catch {
      setData((d) => ({ ...d, alerts: d.alerts.filter((x) => x.id !== a.id) }));
    }
  };
  return (
    <div className="shell">
      <aside className={mobile ? "open" : ""}>
        <div className="brand">
          <div className="logo">
            <Zap size={20} />
          </div>
          <span>
            Supply<span>IQ</span>
          </span>
          <button className="close" onClick={() => setMobile(false)}>
            <X />
          </button>
        </div>
        <div className="workspace">
          <small>WORKSPACE</small>
          <button
            onClick={() =>
              alert("Northstar Ventures is the active local workspace.")
            }
          >
            <span className="avatar tiny">NV</span>
            <span>
              Northstar Ventures<small>Operations</small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
        <nav>
          <small>MONITOR</small>
          <a className="active" onClick={() => jump("overview")}>
            <LayoutDashboard />
            Overview
          </a>
          <a onClick={() => jump("inventory")}>
            <Boxes />
            Inventory<span className="count">4</span>
          </a>
          <a onClick={() => jump("suppliers")}>
            <Truck />
            Suppliers<span className="count muted">5</span>
          </a>
          <a onClick={() => setAlertsOpen(true)}>
            <ShieldAlert />
            Risk center<span className="count alert">{critical.length}</span>
          </a>
          <small>INTELLIGENCE</small>
          <a onClick={() => jump("forecast")}>
            <Sparkles />
            Demand forecast
          </a>
          <a
            onClick={() =>
              alert(
                "Purchase-order management is ready for the next ERP integration step.",
              )
            }
          >
            <PackageCheck />
            Purchase orders
          </a>
          <a onClick={downloadBrief}>
            <Users />
            Reports
          </a>
        </nav>
        <div className="side-bottom">
          <a
            onClick={() =>
              alert("Configuration is loaded from the project .env file.")
            }
          >
            <Settings />
            Settings
          </a>
          <div className="help">
            <div>
              <Command size={17} />
            </div>
            <b>Need help?</b>
            <p>Explore the quick start guide</p>
            <a
              onClick={() =>
                window.open("http://localhost:8000/docs", "_blank")
              }
            >
              Open API documentation <ChevronRight />
            </a>
          </div>
          <div className="profile">
            <span className="avatar">AK</span>
            <span>
              <b>Arjun Kapoor</b>
              <small>Supply chain lead</small>
            </span>
            <ChevronDown />
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button className="menubtn" onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <div className="search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search products, suppliers, POs..."
            />
            <kbd onClick={search}>Enter</kbd>
          </div>
          <div className="header-actions">
            <button className="live" onClick={load}>
              <i />
              Live data
            </button>
            <button
              className="alert-btn"
              onClick={() => setAlertsOpen(!alertsOpen)}
            >
              <AlertTriangle />
              <span>{critical.length}</span>
            </button>
            <button
              className="date"
              onClick={() =>
                setPeriod((p) => (p === 90 ? 30 : p === 30 ? 60 : 90))
              }
            >
              <Clock3 />
              Last {period} days
              <ChevronDown />
            </button>
          </div>
        </header>
        <div className="content" id="overview">
          {offline && (
            <div className="demo-banner">
              <span>
                <i />
                Demo snapshot
              </span>
              The API is offline. Showing representative SupplyIQ data.
              <button onClick={load}>Reconnect</button>
            </div>
          )}
          <div className="welcome">
            <div>
              <p>{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</p>
              <h1>Good morning, Arjun</h1>
              <span>
                Here’s what needs your attention across the supply chain today.
              </span>
            </div>
            <button onClick={downloadBrief}>
              <Sparkles />
              Generate executive brief
            </button>
          </div>
          <section className={`metrics ${loading ? "loading" : ""}`}>
            <Metric
              label="Inventory value"
              value={money(data.kpis.inventory_value)}
              sub="vs. previous period"
              delta={data.kpis.inventory_delta}
              icon={Boxes}
              tone="teal"
            />
            <Metric
              label="Order fill rate"
              value={`${data.kpis.fill_rate}%`}
              sub="vs. previous period"
              delta={data.kpis.fill_rate_delta}
              icon={PackageCheck}
              tone="green"
            />
            <Metric
              label="Products at risk"
              value={String(data.kpis.at_risk_products).padStart(2, "0")}
              sub="2 require immediate action"
              icon={ShieldAlert}
              tone="red"
            />
            <Metric
              label="Supplier on-time"
              value={`${data.kpis.supplier_otd}%`}
              sub="Target is 95%"
              icon={Truck}
              tone="amber"
            />
          </section>
          <section className="grid main-grid" id="forecast">
            <div className="card chart-card wide">
              <div className="card-head">
                <div>
                  <h3>Demand pulse</h3>
                  <p>Actual demand against AI forecast</p>
                </div>
                <div className="accuracy">
                  <span>Forecast accuracy</span>
                  <b>{data.kpis.forecast_accuracy}%</b>
                </div>
              </div>
              <div className="legend">
                <span>
                  <i className="actual" />
                  Actual demand
                </span>
                <span>
                  <i className="forecast" />
                  Forecast
                </span>
              </div>
              <ResponsiveContainer width="100%" height={270}>
                <AreaChart data={data.demand_trend}>
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#236A68" stopOpacity=".18" />
                      <stop offset="1" stopColor="#236A68" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 4"
                    vertical={false}
                    stroke="#E8ECE7"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#7C8781" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#7C8781" }}
                    width={40}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#176764"
                    strokeWidth={2.5}
                    fill="url(#fill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#98A49D"
                    strokeDasharray="6 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card attention">
              <div className="card-head">
                <div>
                  <h3>Needs attention</h3>
                  <p>{critical.length} high-priority signals</p>
                </div>
                <button onClick={() => setAlertsOpen(true)}>
                  View all <ChevronRight />
                </button>
              </div>
              <div className="attention-list">
                {data.alerts.slice(0, 3).map((a) => (
                  <div className="signal" key={a.id}>
                    <span className={`signal-icon ${a.severity.toLowerCase()}`}>
                      <AlertTriangle />
                    </span>
                    <div>
                      <span>
                        <b>{a.title}</b>
                        <em>{a.severity}</em>
                      </span>
                      <p>{a.message}</p>
                      <small>
                        {a.entity} ·{" "}
                        {new Date(a.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                    <button onClick={() => handleResolve(a)} title="Resolve">
                      <ChevronRight />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="grid lower-grid" id="inventory">
            <div className="card product-card">
              <div className="card-head">
                <div>
                  <h3>Products at risk</h3>
                  <p>Prioritized by disruption probability</p>
                </div>
                <button onClick={() => window.print()}>
                  Print inventory <ChevronRight />
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock / reorder</th>
                      <th>Days cover</th>
                      <th>Supplier</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.critical_products.map((p) => (
                      <tr key={p.sku} id={`product-${p.id}`}>
                        <td>
                          <b>{p.name}</b>
                          <small>{p.sku}</small>
                        </td>
                        <td>
                          <b>{p.stock.toLocaleString()}</b>
                          <small>
                            / {p.reorder_point.toLocaleString()} units
                          </small>
                        </td>
                        <td>
                          <b>{p.days_cover}</b>
                          <small>days</small>
                        </td>
                        <td>{p.supplier}</td>
                        <td>
                          <RiskPill score={p.risk_score} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card health-card">
              <div className="card-head">
                <div>
                  <h3>Inventory health</h3>
                  <p>Stock position across SKUs</p>
                </div>
                <button>
                  Details <ChevronRight />
                </button>
              </div>
              <div className="donut">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie
                      data={data.inventory_health}
                      dataKey="value"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={4}
                      cornerRadius={5}
                    >
                      {data.inventory_health.map((x) => (
                        <Cell key={x.name} fill={x.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <b>
                    {data.inventory_health.reduce((a, b) => a + b.value, 0)}
                  </b>
                  <small>Products</small>
                </div>
                <div className="health-legend">
                  {data.inventory_health.map((x) => (
                    <div key={x.name}>
                      <i style={{ background: x.color }} />
                      <span>{x.name}</span>
                      <b>{x.value}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="insight">
                <Sparkles />
                <span>
                  <b>AI insight</b>Rebalancing two SKUs can prevent $18.4k in
                  lost sales.
                </span>
                <ChevronRight />
              </div>
            </div>
          </section>
          <section className="grid final-grid" id="suppliers">
            <div className="card suppliers">
              <div className="card-head">
                <div>
                  <h3>Supplier performance</h3>
                  <p>Delivery reliability and quality signals</p>
                </div>
                <button onClick={() => jump("suppliers")}>
                  All suppliers <ChevronRight />
                </button>
              </div>
              {data.supplier_performance.slice(0, 4).map((s) => (
                <div className="supplier" key={s.id}>
                  <span className="supplier-logo">
                    {s.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span>
                    <b>{s.name}</b>
                    <small>
                      {s.region} · {s.lead_days}d lead time
                    </small>
                  </span>
                  <div className="otd">
                    <small>On-time delivery</small>
                    <div>
                      <i style={{ width: `${s.on_time_rate}%` }} />
                    </div>
                  </div>
                  <b className="percentage">{s.on_time_rate}%</b>
                  <RiskPill score={s.risk_score} />
                </div>
              ))}
            </div>
            <div className="card category">
              <div className="card-head">
                <div>
                  <h3>Inventory by category</h3>
                  <p>Capital allocation</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={data.category_inventory}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <CartesianGrid horizontal={false} stroke="#e7ebe7" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={92}
                    tick={{ fontSize: 11, fill: "#5d6963" }}
                  />
                  <Tooltip formatter={(v) => money(Number(v))} />
                  <Bar
                    dataKey="value"
                    fill="#337E7A"
                    radius={[0, 5, 5, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>
      {alertsOpen && (
        <>
          <div className="scrim" onClick={() => setAlertsOpen(false)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <p>RISK CENTER</p>
                <h2>Active signals</h2>
              </div>
              <button onClick={() => setAlertsOpen(false)}>
                <X />
              </button>
            </div>
            <p className="drawer-intro">
              SupplyIQ continuously monitors demand, inventory, and supplier
              behavior.
            </p>
            {data.alerts.map((a) => (
              <div className="drawer-alert" key={a.id}>
                <div>
                  <span className={`severity ${a.severity.toLowerCase()}`}>
                    {a.severity}
                  </span>
                  <small>{a.alert_type}</small>
                </div>
                <h3>{a.title}</h3>
                <p>{a.message}</p>
                <div className="recommend">
                  <Sparkles />
                  <span>
                    <b>Recommended action</b>
                    {a.recommendation}
                  </span>
                </div>
                <button onClick={() => handleResolve(a)}>
                  Mark as resolved
                </button>
              </div>
            ))}
          </aside>
        </>
      )}
    </div>
  );
}
