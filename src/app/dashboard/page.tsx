// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AIAssistantModal } from "@/components/AIAssistantModal";

/* -------------------- Types -------------------- */
type Lead = {
    id: string;
    ownerId: string;
    name: string;
    email: string | null;
    type: "NEW" | "RETURNING";
    status: "ACTIVE" | "DO_NOT_CONTACT" | "LOST";
    createdAt: string;
    lastServiceDate?: string | null;
    nextSuggestedAt?: string | null;
    tags: string[];
    company?: string | null;
};

/* -------------------- Page -------------------- */
export default function DashboardPage() {
    const [isAIModalOpen, setAIModalOpen] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const r = await fetch("/api/leads", { cache: "no-store" });
                const data = await r.json();
                if (mounted) setLeads((data ?? []) as Lead[]);
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const greeting = getGreeting();
    const nowStr = new Date().toLocaleString();

    /* -------------------- Derived Metrics -------------------- */
    const metrics = useMemo(() => deriveMetrics(leads), [leads]);

    /* -------------------- Render -------------------- */
    return (
        <div className="p-6 space-y-6">
            {/* 8) Greeting / Personalization */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-[1px] shadow-lg">
                <div className="rounded-2xl bg-white dark:bg-neutral-900 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            {greeting}, Hamza 👋
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            It’s {nowStr}. Here’s what’s happening in Smart Reach.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <Link
                            href="/leads"
                            className="rounded-xl px-4 py-2 bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700 transition"
                        >
                            View Leads
                        </Link>
                        <button
                            onClick={() => setAIModalOpen(true)}
                            className="rounded-xl px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                        >
                            Ask AI Assistant
                        </button>
                    </div>
                </div>
            </div>

            {/* 1) KPI Cards with Trend & Sparkline */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard
                    title="Total Leads"
                    value={loading ? "—" : metrics.totalLeads.toLocaleString()}
                    caption="All-time"
                    pill="Leads"
                    trend={loading ? undefined : metrics.trend.total}
                    sparkline={metrics.sparkline.points}
                />
                <KpiCard
                    title="Active"
                    value={loading ? "—" : metrics.activeCount.toLocaleString()}
                    caption="Currently engaged"
                    pill="Status"
                    trend={loading ? undefined : metrics.trend.active}
                />
                <KpiCard
                    title="New This Week"
                    value={loading ? "—" : metrics.newThis7Days.toLocaleString()}
                    caption="Last 7 days"
                    pill="Velocity"
                    trend={loading ? undefined : metrics.trend.new7}
                />
                <KpiCard
                    title="Returning"
                    value={loading ? "—" : metrics.returningCount.toLocaleString()}
                    caption="Past customers back"
                    pill="Retention"
                    trend={loading ? undefined : metrics.trend.returning}
                />
            </section>

            {/* 2) Recent Leads / Activity + 4) Funnel + 6) Tag Performance */}
            <section className="grid grid-cols-1 2xl:grid-cols-3 gap-5">
                {/* Recent Leads / Activity */}
                <div className="2xl:col-span-2 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Recent Leads & Activity
                        </h2>
                        <Link href="/leads" className="text-sm text-indigo-600 hover:text-indigo-700">
                            View all
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-900 dark:text-gray-100">
                            <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="text-left font-semibold px-4 py-2">Lead</th>
                                <th className="text-left font-semibold px-4 py-2">Email</th>
                                <th className="text-left font-semibold px-4 py-2">Type</th>
                                <th className="text-left font-semibold px-4 py-2">Status</th>
                                <th className="text-left font-semibold px-4 py-2">Created</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <SkeletonRows rows={6} cols={5} />
                            ) : metrics.recentLeads.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                                        No recent leads yet.
                                    </td>
                                </tr>
                            ) : (
                                metrics.recentLeads.map((l) => (
                                    <tr
                                        key={l.id}
                                        className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                                    >
                                        <td className="px-4 py-2 font-medium flex items-center gap-2">
                                            <Avatar name={l.name} />
                                            <span>{l.name || "—"}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                            {l.email ? (
                                                <a className="text-indigo-600 hover:underline" href={`mailto:${l.email}`}>
                                                    {l.email}
                                                </a>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <Badge tone={l.type === "NEW" ? "green" : "amber"} label={l.type} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <Badge
                                                tone={l.status === "ACTIVE" ? "blue" : l.status === "DO_NOT_CONTACT" ? "red" : "slate"}
                                                label={l.status.replaceAll("_", " ")}
                                            />
                                        </td>
                                        <td className="px-4 py-2">{new Date(l.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tag Performance (6) */}
                <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Tag Performance</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Top tags across your leads.
                        </p>
                    </div>
                    <div className="p-5">
                        {loading ? (
                            <div className="space-y-2">
                                <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                                <div className="h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                                <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                            </div>
                        ) : metrics.tags.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No tags yet.</p>
                        ) : (
                            <BarChart data={metrics.tags} />
                        )}
                    </div>
                </div>
            </section>

            {/* 4) Conversion Funnel (status) + 5) Follow-up Reminders + 3) AI Insights + 7) Quick Actions */}
            <section className="grid grid-cols-1 xl:grid-cols-4 gap-5">
                {/* Funnel */}
                <div className="xl:col-span-2 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Conversion Funnel</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Distribution by status (Active / Do Not Contact / Lost)
                        </p>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="h-36 animate-pulse rounded-xl bg-gray-200 dark:bg-neutral-800" />
                        ) : (
                            <FunnelChart counts={metrics.statusCounts} />
                        )}
                    </div>
                </div>

                {/* Reminders */}
                <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Upcoming Follow-ups</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Next 3 days (from <code className="font-mono">nextSuggestedAt</code>)
                        </p>
                    </div>
                    <div className="p-5 space-y-3">
                        {loading ? (
                            <SkeletonList rows={4} />
                        ) : metrics.upcoming.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No follow-ups due soon.</p>
                        ) : (
                            metrics.upcoming.map((l) => (
                                <div key={l.id} className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-800 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={l.name} size="sm" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{l.name}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">{formatDate(l.nextSuggestedAt!)}</div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/leads"
                                        className="text-xs rounded-lg px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                    >
                                        Open
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Insights */}
                <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI Insights</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Suggestions based on lead freshness and history.
                        </p>
                    </div>
                    <div className="p-5 space-y-3">
                        {loading ? (
                            <SkeletonList rows={4} />
                        ) : metrics.aiSuggestions.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No suggestions right now.</p>
                        ) : (
                            metrics.aiSuggestions.map((s, i) => (
                                <div key={i} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</div>
                                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{s.detail}</div>
                                    {s.lead && (
                                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                            Lead: <span className="font-medium">{s.lead.name}</span>{" "}
                                            {s.lead.email ? (
                                                <>
                                                    • <a className="text-indigo-600 hover:underline" href={`mailto:${s.lead.email}`}>{s.lead.email}</a>
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <button
                            onClick={() => setAIModalOpen(true)}
                            className="w-full rounded-xl px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 transition"
                        >
                            Ask AI Assistant
                        </button>
                    </div>
                </div>
            </section>

            {/* 7) Quick Actions (extra) */}
            <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link href="/leads" className="rounded-xl px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-200 transition">
                        + Add Lead
                    </Link>
                    <button
                        onClick={() => setAIModalOpen(true)}
                        className="rounded-xl px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 transition"
                    >
                        Ask AI to Draft Email
                    </button>
                    <Link href="/campaigns" className="rounded-xl px-4 py-3 bg-gray-50 text-gray-900 hover:bg-gray-100 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 transition">
                        View Campaigns
                    </Link>
                    <button
                        className="rounded-xl px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        onClick={() => alert("CSV import coming soon")}
                    >
                        Import CSV
                    </button>
                </div>
            </section>

            {/* AI Modal */}
            <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setAIModalOpen(false)} />
        </div>
    );
}

/* -------------------- Metric Derivation -------------------- */

function deriveMetrics(leads: Lead[]) {
    const now = new Date();
    const start7 = midnightNDaysAgo(now, 6); // including today -> 7 points
    const prevStart7 = midnightNDaysAgo(now, 13);
    const prevEnd7 = midnightNDaysAgo(now, 7);

    // helper counters
    const inRange = (d: Date, a: Date, b: Date) => d >= a && d <= b;

    const buckets = new Array(7).fill(0);
    const prevBuckets = new Array(7).fill(0);

    let total = leads.length;
    let active = 0;
    let dnc = 0;
    let lost = 0;
    let returning = 0;
    let new7 = 0;
    let prevNew7 = 0;

    const upcoming: Lead[] = [];
    const next3days = new Date();
    next3days.setDate(now.getDate() + 3);

    const tagCounts = new Map<string, number>();

    for (const l of leads) {
        const created = new Date(l.createdAt);

        // status counts
        if (l.status === "ACTIVE") active++;
        else if (l.status === "DO_NOT_CONTACT") dnc++;
        else if (l.status === "LOST") lost++;

        if (l.type === "RETURNING") returning++;

        // last 7 days vs previous 7 days (for trend)
        const mCreated = new Date(created);
        mCreated.setHours(0, 0, 0, 0);
        if (inRange(mCreated, start7, todayMidnight())) {
            const idx = dayDiff(start7, mCreated);
            if (idx >= 0 && idx < 7) buckets[idx] += 1;
            new7++;
        } else if (inRange(mCreated, prevStart7, prevEnd7)) {
            const idx = dayDiff(prevStart7, mCreated);
            if (idx >= 0 && idx < 7) prevBuckets[idx] += 1;
            prevNew7++;
        }

        // follow-ups: nextSuggestedAt
        if (l.nextSuggestedAt) {
            const next = new Date(l.nextSuggestedAt);
            if (next <= next3days && next >= now) {
                upcoming.push(l);
            }
        }

        // tag performance
        for (const t of l.tags || []) {
            tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
        }
    }

    // sparkline
    const max = Math.max(...buckets, 5);
    const w = 140;
    const h = 40;
    const step = w / 6;
    const points = buckets
        .map((v, i) => {
            const x = i * step;
            const y = h - (v / max) * (h - 4) - 2;
            return `${x},${y}`;
        })
        .join(" ");

    // recent leads
    const recentLeads = [...leads]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 6);

    // trends (% change vs previous week)
    const pct = (cur: number, prev: number) =>
        prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);

    return {
        totalLeads: total,
        activeCount: active,
        dncCount: dnc,
        returningCount: returning,
        newThis7Days: new7,
        sparkline: { points },
        recentLeads,
        upcoming: upcoming
            .sort((a, b) => +new Date(a.nextSuggestedAt!) - +new Date(b.nextSuggestedAt!))
            .slice(0, 5),
        tags: Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([label, value]) => ({ label, value })),
        statusCounts: { ACTIVE: active, DO_NOT_CONTACT: dnc, LOST: lost },

        // 3) AI Insights (heuristics)
        aiSuggestions: buildAISuggestions(leads),

        trend: {
            total: { dir: total >= leads.length ? "up" : "neutral", pct: 0 }, // total is cumulative
            active: { dir: "neutral", pct: 0 }, // simple; can compute week diff if you store history
            returning: { dir: "neutral", pct: 0 },
            new7: { dir: new7 >= prevNew7 ? "up" : "down", pct: pct(new7, prevNew7) },
        },
    };
}

/* -------------------- Heuristic AI Suggestions -------------------- */
function buildAISuggestions(leads: Lead[]) {
    const now = new Date();
    const staleNew = leads
        .filter((l) => l.type === "NEW")
        .filter((l) => {
            const created = new Date(l.createdAt);
            return now.getTime() - created.getTime() > 3 * 24 * 3600 * 1000; // older than 3 days
        })
        .slice(0, 3);

    const returningSoon = leads
        .filter((l) => l.type === "RETURNING" && !l.nextSuggestedAt)
        .slice(0, 2);

    const suggestions: { title: string; detail: string; lead?: Lead }[] = [];

    for (const l of staleNew) {
        suggestions.push({
            title: "Follow-up: no reply in 3+ days",
            detail: `Send a quick, value-focused follow-up to ${l.name}. Short CTA works best.`,
            lead: l,
        });
    }

    for (const l of returningSoon) {
        suggestions.push({
            title: "Re-engage a past customer",
            detail: `Offer a loyalty discount or check-in on ${l.name}'s last service needs.`,
            lead: l,
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            title: "All clear for now",
            detail: "No obvious follow-ups surfaced. Consider adding more leads or importing a CSV.",
        });
    }

    return suggestions;
}

/* -------------------- Small UI Utilities -------------------- */
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}
function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}
function midnightNDaysAgo(base: Date, n: number) {
    const d = new Date(base);
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
}
function todayMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function dayDiff(a: Date, b: Date) {
    return Math.floor((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

/* -------------------- UI Components -------------------- */

function KpiCard({
                     title,
                     value,
                     caption,
                     pill,
                     sparkline,
                     trend,
                 }: {
    title: string;
    value: string | number;
    caption: string;
    pill: string;
    sparkline?: string;
    trend?: { dir: "up" | "down" | "neutral"; pct: number };
}) {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{pill}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-1">{title}</h3>
                </div>
                {sparkline && (
                    <svg width="140" height="40" viewBox="0 0 140 40" className="opacity-80">
                        <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            points={sparkline}
                            className="text-indigo-600 dark:text-indigo-400"
                        />
                    </svg>
                )}
            </div>
            <div className="mt-4 flex items-baseline gap-3">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{caption}</span>
                {trend && (
                    <span
                        className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            trend.dir === "up"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                                : trend.dir === "down"
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200"
                        }`}
                    >
            <TrendIcon dir={trend.dir} /> {trend.pct}%
          </span>
                )}
            </div>
        </div>
    );
}

function TrendIcon({ dir }: { dir: "up" | "down" | "neutral" }) {
    if (dir === "neutral") {
        return (
            <svg width="10" height="10" viewBox="0 0 10 10" className="inline-block">
                <circle cx="5" cy="5" r="3" />
            </svg>
        );
    }
    return (
        <svg width="10" height="10" viewBox="0 0 20 20" className="inline-block">
            {dir === "up" ? (
                <path d="M10 3l6 6h-4v8H8V9H4l6-6z" />
            ) : (
                <path d="M10 17l-6-6h4V3h4v8h4l-6 6z" />
            )}
        </svg>
    );
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
    const initials = (name || "?")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    const cls = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
    return (
        <div className={`rounded-full bg-indigo-600 text-white grid place-items-center ${cls}`}>
            {initials || "?"}
        </div>
    );
}

function Badge({ tone, label }: { tone: "green" | "amber" | "blue" | "red" | "slate"; label: string }) {
    const toneClasses: Record<string, string> = {
        green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200",
        amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
        red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200",
        slate: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${toneClasses[tone]}`}>
      {label}
    </span>
    );
}

function SkeletonRows({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, r) => (
                <tr key={r} className="border-b border-gray-100 dark:border-neutral-800">
                    {Array.from({ length: cols }).map((_, c) => (
                        <td key={c} className="px-4 py-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-neutral-800" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

function SkeletonList({ rows = 4 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse bg-gray-200 dark:bg-neutral-800" />
            ))}
        </div>
    );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="space-y-3">
            {data.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-700 dark:text-gray-300 truncate">{d.label}</div>
                    <div className="flex-1 h-3 rounded bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500"
                            style={{ width: `${(d.value / max) * 100}%` }}
                        />
                    </div>
                    <div className="w-10 text-right text-sm text-gray-700 dark:text-gray-300">{d.value}</div>
                </div>
            ))}
        </div>
    );
}

function FunnelChart({
                         counts,
                     }: {
    counts: { ACTIVE: number; DO_NOT_CONTACT: number; LOST: number };
}) {
    const stages = [
        { key: "ACTIVE", color: "bg-blue-600", label: "Active" },
        { key: "DO_NOT_CONTACT", color: "bg-rose-600", label: "Do Not Contact" },
        { key: "LOST", color: "bg-slate-600", label: "Lost" },
    ] as const;

    const max = Math.max(counts.ACTIVE, counts.DO_NOT_CONTACT, counts.LOST, 1);

    return (
        <div className="space-y-3">
            {stages.map((s) => {
                const v = counts[s.key as keyof typeof counts] as number;
                const pct = (v / max) * 100;
                return (
                    <div key={s.key} className="flex items-center gap-3">
                        <div className="w-36 text-sm text-gray-700 dark:text-gray-300">{s.label}</div>
                        <div className="flex-1 h-5 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                            <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-14 text-right text-sm text-gray-700 dark:text-gray-300">{v}</div>
                    </div>
                );
            })}
        </div>
    );
}
