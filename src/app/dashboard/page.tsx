// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AIAssistantModal } from "@/components/AIAssistantModal";

type Lead = {
    id: string;
    ownerId: string;
    name: string;
    email: string | null;
    type: "NEW" | "RETURNING";
    status: "ACTIVE" | "DO_NOT_CONTACT" | "LOST";
    createdAt: string;
    company?: string | null;
};

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
                if (mounted) setLeads(data || []);
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

    // ---- Derived metrics from leads ----
    const {
        totalLeads,
        activeCount,
        dncCount,
        newThisWeek,
        returningCount,
        sparklinePoints,
        recentLeads,
    } = useMemo(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 6); // include today => 7 buckets

        const buckets = new Array(7).fill(0); // 0=oldest .. 6=today
        let active = 0;
        let dnc = 0;
        let returning = 0;
        let newWeek = 0;

        for (const l of leads) {
            const created = new Date(l.createdAt);

            if (l.status === "ACTIVE") active++;
            if (l.status === "DO_NOT_CONTACT") dnc++;
            if (l.type === "RETURNING") returning++;

            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            if (created >= weekAgo) newWeek++;

            // bucket index relative to sevenDaysAgo
            const createdMidnight = new Date(created);
            createdMidnight.setHours(0, 0, 0, 0);
            const startMidnight = new Date(sevenDaysAgo);
            startMidnight.setHours(0, 0, 0, 0);
            const diffDays = Math.floor(
                (createdMidnight.getTime() - startMidnight.getTime()) / (24 * 60 * 60 * 1000)
            );
            if (diffDays >= 0 && diffDays < 7) buckets[diffDays] += 1;
        }

        // sparkline points as SVG coordinates
        const max = Math.max(...buckets, 5); // guard so the line is visible
        const w = 140;
        const h = 40;
        const step = w / 6; // 6 gaps for 7 points
        const pts = buckets.map((v, i) => {
            const x = i * step;
            const y = h - (v / max) * (h - 4) - 2; // pad top/bottom
            return `${x},${y}`;
        });

        const sortedRecent = [...leads]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6);

        return {
            totalLeads: leads.length,
            activeCount: active,
            dncCount: dnc,
            returningCount: returning,
            newThisWeek: newWeek,
            sparklinePoints: pts.join(" "),
            recentLeads: sortedRecent,
        };
    }, [leads]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-[1px] shadow-lg">
                <div className="rounded-2xl bg-white dark:bg-neutral-900 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Smart Reach Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            See your pipeline at a glance and take action quickly.
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

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard
                    title="Total Leads"
                    value={loading ? "—" : totalLeads.toLocaleString()}
                    caption="All-time"
                    pill="Leads"
                    sparkline={sparklinePoints}
                />
                <KpiCard
                    title="Active"
                    value={loading ? "—" : activeCount.toLocaleString()}
                    caption="Currently engaged"
                    pill="Status"
                />
                <KpiCard
                    title="New This Week"
                    value={loading ? "—" : newThisWeek.toLocaleString()}
                    caption="Last 7 days"
                    pill="Velocity"
                />
                <KpiCard
                    title="Returning"
                    value={loading ? "—" : returningCount.toLocaleString()}
                    caption="Past customers back"
                    pill="Retention"
                />
            </section>

            {/* Recent Leads + Quick Actions */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Recent Leads */}
                <div className="xl:col-span-2 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Recent Leads
                        </h2>
                        <Link href="/leads" className="text-sm text-indigo-600 hover:text-indigo-700">
                            View all
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-900 dark:text-gray-100">
                            <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="text-left font-semibold px-4 py-2">Name</th>
                                <th className="text-left font-semibold px-4 py-2">Email</th>
                                <th className="text-left font-semibold px-4 py-2">Type</th>
                                <th className="text-left font-semibold px-4 py-2">Status</th>
                                <th className="text-left font-semibold px-4 py-2">Created</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <SkeletonRows rows={6} cols={5} />
                            ) : recentLeads.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                                        No recent leads yet.
                                    </td>
                                </tr>
                            ) : (
                                recentLeads.map((l) => (
                                    <tr
                                        key={l.id}
                                        className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
                                    >
                                        <td className="px-4 py-2 font-medium">{l.name || "—"}</td>
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
                                                tone={
                                                    l.status === "ACTIVE" ? "blue" : l.status === "DO_NOT_CONTACT" ? "red" : "slate"
                                                }
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

                {/* Quick Actions */}
                <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Create leads, enroll contacts, or brainstorm with AI.
                        </p>
                    </div>
                    <div className="p-5 space-y-3">
                        <Link
                            href="/leads"
                            className="block rounded-xl px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-200 transition"
                        >
                            + Add Lead
                        </Link>
                        <button
                            onClick={() => setAIModalOpen(true)}
                            className="w-full rounded-xl px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 transition"
                        >
                            Ask AI Assistant
                        </button>
                        <Link
                            href="/campaigns"
                            className="block rounded-xl px-4 py-3 bg-gray-50 text-gray-900 hover:bg-gray-100 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 transition"
                        >
                            View Campaigns
                        </Link>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Health</h3>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                <li>Active leads: <span className="font-medium">{loading ? "—" : activeCount}</span></li>
                                <li>Do Not Contact: <span className="font-medium">{loading ? "—" : dncCount}</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Modal */}
            <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setAIModalOpen(false)} />
        </div>
    );
}

/* -------------------- UI Helpers -------------------- */

function KpiCard({
                     title,
                     value,
                     caption,
                     pill,
                     sparkline,
                 }: {
    title: string;
    value: string | number;
    caption: string;
    pill: string;
    sparkline?: string; // "x,y x,y ..."
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
            <div className="mt-4 flex items-baseline gap-2">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{caption}</span>
            </div>
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
