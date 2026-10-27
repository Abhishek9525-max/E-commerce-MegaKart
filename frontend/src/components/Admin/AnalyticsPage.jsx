import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiArrowDownRight, FiArrowUpRight, FiCalendar, FiTrendingUp } from "react-icons/fi";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const CHART_COLORS = ["#414b36", "#9d7657", "#bd9b73", "#a94f38", "#879276", "#71665a"];
const STATUS_COLORS = {
  Processing: "#b7792b",
  Shipped: "#56829a",
  Delivered: "#5e8068",
  Cancelled: "#a94f38",
};

const toDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPresetRange = (days) => {
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * DAY_IN_MS);
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatPercent = (value) => {
  if (value === null || !Number.isFinite(value)) return null;
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
};

const dateLabel = (date, options) =>
  new Intl.DateTimeFormat("en-US", options).format(new Date(`${date}T00:00:00`));

const getWeekStart = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  const dayFromMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayFromMonday);
  return toDateInput(date);
};

const groupRevenue = (dailyRevenue, view) => {
  if (view === "daily") {
    return dailyRevenue.map((point) => ({
      ...point,
      label: dateLabel(point.date, { month: "short", day: "numeric" }),
    }));
  }

  const grouped = new Map();
  dailyRevenue.forEach((point) => {
    const date = new Date(`${point.date}T00:00:00`);
    const key = view === "weekly"
      ? getWeekStart(point.date)
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
    const total = grouped.get(key) ?? { date: key, revenue: 0, orders: 0 };
    total.revenue += point.revenue;
    total.orders += point.orders;
    grouped.set(key, total);
  });

  return [...grouped.values()].map((point) => ({
    ...point,
    label: view === "weekly"
      ? dateLabel(point.date, { month: "short", day: "numeric" })
      : dateLabel(point.date, { month: "short", year: "2-digit" }),
  }));
};

const TrendChart = ({ points, view }) => {
  const width = 900;
  const height = 280;
  const left = 64;
  const right = 18;
  const top = 18;
  const bottom = 40;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.revenue));
  const roundedMax = Math.ceil(maxValue / 300) * 100 * 3 || maxValue;
  const coordinates = points.map((point, index) => ({
    ...point,
    x: points.length === 1 ? left + chartWidth / 2 : left + (index / (points.length - 1)) * chartWidth,
    y: top + chartHeight - (point.revenue / roundedMax) * chartHeight,
  }));
  const line = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${line} L ${left + chartWidth} ${top + chartHeight} L ${left} ${top + chartHeight} Z`;
  const labelIndexes = [...new Set(
    Array.from({ length: Math.min(6, coordinates.length) }, (_, index) =>
      Math.round((index / Math.max(1, Math.min(6, coordinates.length) - 1)) * (coordinates.length - 1))
    )
  )];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${view} revenue trend chart`}
        className="h-[260px] min-w-[600px] w-full"
      >
        <defs>
          <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#414b36" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#414b36" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((step) => {
          const y = top + (chartHeight / 3) * step;
          const value = roundedMax - (roundedMax / 3) * step;
          return (
            <g key={step}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#eeece6" strokeDasharray="3 5" />
              <text x={left - 10} y={y + 4} textAnchor="end" fill="#98968d" fontSize="11">
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}
        <path d={area} fill="url(#revenue-fill)" />
        {coordinates.length > 1 && (
          <path d={line} fill="none" stroke="#414b36" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {coordinates.map((point) => (
          <circle key={point.date} cx={point.x} cy={point.y} r={coordinates.length === 1 ? 5 : 2.5} fill="#414b36">
            <title>{`${dateLabel(point.date, { month: "long", day: "numeric", year: "numeric" })}: ${formatCurrency(point.revenue)}`}</title>
          </circle>
        ))}
        {labelIndexes.map((index) => {
          const point = coordinates[index];
          return point ? (
            <text key={point.date} x={point.x} y={height - 12} textAnchor="middle" fill="#85847c" fontSize="11">
              {point.label}
            </text>
          ) : null;
        })}
      </svg>
    </div>
  );
};

const MetricCard = ({ title, value, comparison, detail, icon, featured = false }) => {
  const growth = formatPercent(comparison?.growthPercent);
  const isPositive = comparison?.growthPercent > 0;
  const isNegative = comparison?.growthPercent < 0;
  const growthColor = isPositive
    ? "text-emerald-700"
    : isNegative
      ? "text-rose-700"
      : "text-[#77766e]";

  return (
    <article className={`border p-5 shadow-[0_8px_24px_rgba(39,46,32,0.035)] sm:p-6 ${featured ? "border-[#414b36] bg-[#414b36] text-white" : "border-[#e7e4dc] bg-white text-[#292b25]"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${featured ? "text-white/65" : "text-[#85847c]"}`}>{title}</p>
        {React.createElement(icon, {
          className: `text-lg ${featured ? "text-[#d5ddc8]" : "text-[#85847c]"}`,
          "aria-hidden": true,
        })}
      </div>
      <p className="mt-6 text-2xl font-medium tracking-tight sm:text-3xl">{value}</p>
      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px]">
        {growth ? (
          <span className={`inline-flex items-center gap-0.5 font-semibold ${featured ? "text-[#e1ebd6]" : growthColor}`}>
            {isNegative ? <FiArrowDownRight aria-hidden="true" /> : <FiArrowUpRight aria-hidden="true" />}
            {growth}
          </span>
        ) : (
          <span className={featured ? "text-white/70" : "text-[#85847c]"}>
            {comparison?.current > 0 ? "New activity" : "No prior activity"}
          </span>
        )}
        <span className={featured ? "text-white/60" : "text-[#85847c]"}>{detail}</span>
      </div>
    </article>
  );
};

const CategoryDonut = ({ categories }) => {
  const total = categories.reduce((sum, item) => sum + item.revenue, 0);
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label="Sales by category donut chart">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#eeece6" strokeWidth="18" />
          {total > 0 && categories.map((item, index) => {
            const segment = (item.revenue / total) * circumference;
            const circle = (
              <circle
                key={item.category}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth="18"
                strokeDasharray={`${segment} ${circumference - segment}`}
                strokeDashoffset={-offset}
              >
                <title>{`${item.category}: ${formatCurrency(item.revenue)}`}</title>
              </circle>
            );
            offset += segment;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#85847c]">Revenue</span>
          <span className="mt-1 text-lg font-medium text-[#292b25]">{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="space-y-3">
        {categories.length ? categories.slice(0, 6).map((item, index) => (
          <div key={item.category} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-[#55564f]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
              <span className="truncate">{item.category}</span>
            </span>
            <span className="whitespace-nowrap font-medium text-[#292b25]">
              {total ? `${((item.revenue / total) * 100).toFixed(1)}%` : "0%"}
            </span>
          </div>
        )) : (
          <p className="text-sm text-[#85847c]">No paid product sales in this period.</p>
        )}
      </div>
    </div>
  );
};

const OrderDistribution = ({ distribution }) => {
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-5">
      {distribution.map((item) => {
        const percentage = total ? (item.count / total) * 100 : 0;
        return (
          <div key={item.status}>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-[#55564f]">{item.status}</span>
              <span className="font-medium text-[#292b25]">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eeece6]">
              <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: STATUS_COLORS[item.status] ?? "#85847c" }} />
            </div>
          </div>
        );
      })}
      <p className="border-t border-[#eeece6] pt-4 text-[11px] text-[#85847c]">
        {total} orders created during the selected period
      </p>
    </div>
  );
};

const AnalyticsPage = () => {
  const initialRange = useMemo(() => getPresetRange(30), []);
  const [selectedPreset, setSelectedPreset] = useState("30");
  const [draftRange, setDraftRange] = useState(initialRange);
  const [appliedRange, setAppliedRange] = useState(initialRange);
  const [chartView, setChartView] = useState("daily");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");
      setAnalytics(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/analytics`,
          {
            params: appliedRange,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
            signal: controller.signal,
          }
        );
        if (active) setAnalytics(response.data);
      } catch (requestError) {
        if (active && !axios.isCancel(requestError)) {
          setError(
            requestError.response?.data?.message ??
              requestError.message ??
              "Unable to load analytics."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      active = false;
      controller.abort();
    };
  }, [appliedRange]);

  const chartPoints = useMemo(
    () => groupRevenue(analytics?.dailyRevenue ?? [], chartView),
    [analytics, chartView]
  );
  const customRangeValid =
    draftRange.startDate &&
    draftRange.endDate &&
    draftRange.startDate <= draftRange.endDate;
  const dateRangeLabel = analytics
    ? `${dateLabel(analytics.period.startDate, { month: "short", day: "numeric", year: "numeric" })} – ${dateLabel(analytics.period.endDate, { month: "short", day: "numeric", year: "numeric" })}`
    : "";

  const selectPreset = (days) => {
    const range = getPresetRange(days);
    setSelectedPreset(String(days));
    setDraftRange(range);
    setAppliedRange(range);
  };

  const updateDraftDate = (key, value) => {
    setDraftRange((current) => ({ ...current, [key]: value }));
  };

  const applyCustomRange = (event) => {
    event.preventDefault();
    if (!customRangeValid) return;
    setSelectedPreset("custom");
    setAppliedRange({ ...draftRange });
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <header className="flex flex-col justify-between gap-5 border-b border-[#e7e4dc] pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85847c]">Store performance</p>
          <h1 className="text-3xl font-medium text-[#292b25] sm:text-4xl">Analytics &amp; Revenue</h1>
          <p className="mt-2 text-sm text-[#77766e]">
            Revenue and order performance compared with the previous period.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <div className="flex flex-wrap gap-1 border border-[#e7e4dc] bg-white p-1">
            {[
              { label: "7 days", value: "7" },
              { label: "30 days", value: "30" },
              { label: "90 days", value: "90" },
              { label: "Custom range", value: "custom" },
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  if (preset.value === "custom") {
                    setSelectedPreset("custom");
                  } else {
                    selectPreset(Number(preset.value));
                  }
                }}
                aria-pressed={selectedPreset === preset.value}
                className={`px-3 py-2 text-[11px] font-medium transition-colors ${
                  selectedPreset === preset.value
                    ? "bg-[#414b36] text-white"
                    : "text-[#686961] hover:bg-[#f5f4f0]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {selectedPreset === "custom" && (
            <form onSubmit={applyCustomRange} className="flex flex-wrap items-end gap-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#85847c]">
                From
                <input
                  type="date"
                  value={draftRange.startDate}
                  max={draftRange.endDate}
                  onChange={(event) => updateDraftDate("startDate", event.target.value)}
                  className="mt-1 block border border-[#dedbd3] bg-white px-2.5 py-2 text-xs text-[#41443b] outline-none focus:border-[#68725b]"
                  required
                />
              </label>
              <label className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#85847c]">
                To
                <input
                  type="date"
                  value={draftRange.endDate}
                  min={draftRange.startDate}
                  max={toDateInput(new Date())}
                  onChange={(event) => updateDraftDate("endDate", event.target.value)}
                  className="mt-1 block border border-[#dedbd3] bg-white px-2.5 py-2 text-xs text-[#41443b] outline-none focus:border-[#68725b]"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={!customRangeValid}
                className="min-h-[34px] bg-[#414b36] px-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#30392a] disabled:opacity-50"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-xs text-[#85847c]">
        <FiCalendar aria-hidden="true" />
        <span>{dateRangeLabel || "Loading selected date range…"}</span>
        {analytics && (
          <span className="border-l border-[#dedbd3] pl-2">
            vs. {dateLabel(analytics.period.previousStartDate, { month: "short", day: "numeric" })} – {dateLabel(analytics.period.previousEndDate, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
        {loading && <span className="ml-1 animate-pulse text-[#59634c]">Updating…</span>}
      </div>

      {error ? (
        <div role="alert" className="border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Unable to load analytics: {error}
        </div>
      ) : (
        <>
          <section aria-label="Analytics summary" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <MetricCard
              title="Revenue"
              value={analytics ? formatCurrency(analytics.summary.revenue.current) : "—"}
              comparison={analytics?.summary.revenue}
              detail="vs. previous period"
              icon={FiTrendingUp}
              featured
            />
            <MetricCard
              title="Average order value"
              value={analytics ? formatCurrency(analytics.summary.averageOrderValue.current) : "—"}
              comparison={analytics?.summary.averageOrderValue}
              detail="vs. previous period"
              icon={FiArrowUpRight}
            />
            <MetricCard
              title="Units sold"
              value={analytics ? analytics.summary.unitsSold.current.toLocaleString() : "—"}
              comparison={analytics?.summary.unitsSold}
              detail="vs. previous period"
              icon={FiTrendingUp}
            />
            <MetricCard
              title="Order growth"
              value={analytics ? (formatPercent(analytics.summary.orders.growthPercent) ?? (analytics.summary.orders.current ? "New" : "0.0%")) : "—"}
              comparison={analytics?.summary.orders}
              detail={analytics ? `${analytics.summary.orders.current.toLocaleString()} paid orders` : "vs. previous period"}
              icon={FiArrowUpRight}
            />
          </section>

          <section className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eeece6] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">Revenue over time</p>
                <h2 className="mt-1 text-xl font-medium text-[#292b25]">Revenue trend</h2>
              </div>
              <div className="flex gap-1 self-start border border-[#e7e4dc] bg-[#faf9f6] p-1 sm:self-auto">
                {["daily", "weekly", "monthly"].map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setChartView(view)}
                    aria-pressed={chartView === view}
                    className={`px-3 py-1.5 text-[10px] font-semibold capitalize transition-colors ${
                      chartView === view ? "bg-white text-[#414b36] shadow-sm" : "text-[#85847c] hover:text-[#41443b]"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 py-4 sm:px-6">
              {loading ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-[#85847c]">Loading revenue trend…</div>
              ) : chartPoints.length ? (
                <TrendChart points={chartPoints} view={chartView} />
              ) : (
                <div className="flex h-[260px] items-center justify-center text-sm text-[#85847c]">No paid revenue in this period.</div>
              )}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="border border-[#e7e4dc] bg-white p-5 shadow-[0_8px_24px_rgba(39,46,32,0.035)] sm:p-6">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">Revenue mix</p>
                <h2 className="mt-1 text-xl font-medium text-[#292b25]">Sales by category</h2>
              </div>
              {loading ? (
                <div className="flex h-44 items-center justify-center text-sm text-[#85847c]">Loading category sales…</div>
              ) : (
                <CategoryDonut categories={analytics?.salesByCategory ?? []} />
              )}
              <p className="mt-5 border-t border-[#eeece6] pt-3 text-[10px] text-[#98968d]">
                Category totals are based on each product’s current catalog category.
              </p>
            </article>

            <article className="border border-[#e7e4dc] bg-white p-5 shadow-[0_8px_24px_rgba(39,46,32,0.035)] sm:p-6">
              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">Fulfillment</p>
                <h2 className="mt-1 text-xl font-medium text-[#292b25]">Order distribution</h2>
              </div>
              {loading ? (
                <div className="flex h-44 items-center justify-center text-sm text-[#85847c]">Loading order statuses…</div>
              ) : (
                <OrderDistribution distribution={analytics?.orderDistribution ?? []} />
              )}
            </article>
          </section>

          <section className="overflow-hidden border border-[#e7e4dc] bg-white shadow-[0_8px_24px_rgba(39,46,32,0.035)]">
            <div className="border-b border-[#eeece6] px-5 py-5 sm:px-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#85847c]">Catalog insight</p>
              <h2 className="mt-1 text-xl font-medium text-[#292b25]">Product performance</h2>
              <p className="mt-1 text-xs text-[#85847c]">Top products by revenue for the selected period.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#faf9f6] text-[10px] uppercase tracking-[0.12em] text-[#85847c]">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Product</th>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Units sold</th>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Revenue</th>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">Stock remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eeece6] text-sm">
                  {analytics?.productPerformance.length ? analytics.productPerformance.map((product) => (
                    <tr key={product.productId ?? product.name} className="transition-colors hover:bg-[#fcfbf9]">
                      <td className="px-5 py-4 font-medium text-[#292b25] sm:px-6">{product.name}</td>
                      <td className="px-5 py-4 text-[#55564f] sm:px-6">{product.unitsSold.toLocaleString()}</td>
                      <td className="px-5 py-4 text-[#292b25] sm:px-6">{formatCurrency(product.revenue)}</td>
                      <td className="px-5 py-4 text-[#55564f] sm:px-6">
                        {product.stockRemaining === null ? "Product unavailable" : product.stockRemaining.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#85847c]">
                        {loading ? "Loading product performance…" : "No paid product sales in this period."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
