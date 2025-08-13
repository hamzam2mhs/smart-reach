// src/components/AIAssistantModal.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "general" | "summarize" | "email";
type Props = { isOpen: boolean; onClose: () => void };
type ChatMsg = { role: "user" | "assistant"; content: string; ts: number };

export function AIAssistantModal({ isOpen, onClose }: Props) {
    const [mode, setMode] = useState<Mode>("general");
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // 👉 Separate message histories per mode
    const [messagesByMode, setMessagesByMode] = useState<Record<Mode, ChatMsg[]>>(() => ({
        general: [
            {
                role: "assistant",
                content:
                    "Hi! I’m your AI assistant. Ask me anything: analyze recent leads, suggest next actions, or draft outreach copy.",
                ts: Date.now(),
            },
        ],
        summarize: [
            {
                role: "assistant",
                content:
                    "Lead Insights mode: ask for summaries, trends, or who to contact next. Try a suggestion chip below.",
                ts: Date.now(),
            },
        ],
        email: [
            {
                role: "assistant",
                content:
                    "Write Outreach mode: describe the email you need. I can draft intros, follow-ups, and personalized notes.",
                ts: Date.now(),
            },
        ],
    }));

    const bodyRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const messages = messagesByMode[mode];

    // Close on ESC and send on ⌘/Ctrl+Enter
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, mode, input]);

    // Autofocus when opened
    useEffect(() => {
        if (isOpen) setTimeout(() => textareaRef.current?.focus(), 50);
    }, [isOpen]);

    // Auto-scroll chat (per mode)
    useEffect(() => {
        bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading, mode]);

    // Suggestion chips per mode
    const suggestions = useMemo(() => {
        switch (mode) {
            case "email":
                return [
                    "Draft a warm intro email to a NEW lead named Avery about a website revamp",
                    "Write a concise follow-up if there’s no reply in 3 days",
                    "Personalize an email for a RETURNING customer asking about maintenance",
                ];
            case "summarize":
                return [
                    "Summarize my most recent 10 leads and suggest top 3 to contact",
                    "List leads with follow-ups due this week",
                    "What tags perform best this month?",
                ];
            default:
                return [
                    "What are my biggest opportunities this week?",
                    "Give me a 3-step plan to improve conversions",
                    "Which leads should I contact today and why?",
                ];
        }
    }, [mode]);

    async function handleSend(prefill?: string) {
        const content = (prefill ?? input).trim();
        if (!content) return;

        setMessagesByMode((prev) => ({
            ...prev,
            [mode]: [...prev[mode], { role: "user", content, ts: Date.now() }],
        }));
        setInput("");
        setLoading(true);

        // TODO: replace with your real backend call
        const reply = await fakeAssistantReply(content, mode);

        setMessagesByMode((prev) => ({
            ...prev,
            [mode]: [...prev[mode], { role: "assistant", content: reply, ts: Date.now() }],
        }));
        setLoading(false);
    }

    function handleClearCurrent() {
        // Reset only the current tab's chat (keep others intact)
        setMessagesByMode((prev) => ({
            ...prev,
            [mode]: prev[mode].slice(0, 1), // keep the initial assistant welcome message
        }));
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            {/* Modal */}
            <div className="absolute inset-x-0 top-[8vh] mx-auto w-[min(100%,900px)] rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-neutral-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ask questions, get insights, or draft outreach. (⌘/Ctrl + Enter to send)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200"
                    >
                        Close
                    </button>
                </div>

                {/* Mode switch */}
                <div className="px-6 py-3 border-b border-gray-100 dark:border-neutral-800">
                    <div className="inline-flex gap-1 rounded-xl bg-gray-100 dark:bg-neutral-800 p-1">
                        <TabButton active={mode === "general"} onClick={() => setMode("general")} label="General Chat" />
                        <TabButton active={mode === "summarize"} onClick={() => setMode("summarize")} label="Lead Insights" />
                        <TabButton active={mode === "email"} onClick={() => setMode("email")} label="Write Outreach" />
                    </div>
                </div>

                {/* Body (chat) */}
                <div ref={bodyRef} className="px-6 py-4 h-[46vh] overflow-y-auto space-y-3">
                    {messages.map((m) => (
                        <ChatBubble key={m.ts} role={m.role} content={m.content} />
                    ))}
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                            Thinking…
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                <div className="px-6 pb-3">
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                className="text-xs rounded-full px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-200 transition"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Composer */}
                <div className="px-6 pb-6">
                    <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-indigo-500">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                    mode === "email"
                        ? "Describe the outreach you'd like to send…"
                        : mode === "summarize"
                            ? "Ask for insights, e.g., “Summarize my last 10 leads and who to contact first.”"
                            : "Ask anything about your pipeline or next actions…"
                }
                className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 outline-none text-sm text-gray-900 dark:text-gray-100"
                rows={3}
            />
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {mode === "email" ? "Mode: Write Outreach" : mode === "summarize" ? "Mode: Lead Insights" : "Mode: General"}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleClearCurrent}
                                    className="rounded-lg px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200"
                                >
                                    Clear tab
                                </button>
                                <button
                                    onClick={() => handleSend()}
                                    disabled={loading || input.trim().length === 0}
                                    className="rounded-lg px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                        Tip: Use <span className="font-mono">⌘/Ctrl + Enter</span> to send.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------- UI bits ---------------------------- */

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
                active ? "bg-white dark:bg-neutral-900 text-gray-900 dark:text-white shadow-sm" : "text-gray-700 dark:text-gray-200"
            }`}
        >
            {label}
        </button>
    );
}

function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
    const isUser = role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isUser ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900 dark:bg-neutral-800 dark:text-gray-100"
                }`}
            >
                {content}
            </div>
        </div>
    );
}

/* ---------------------------- Mock reply ---------------------------- */
// Replace this with a real fetch to /api/ai/assistant when you're ready.
async function fakeAssistantReply(prompt: string, mode: Mode) {
    await new Promise((r) => setTimeout(r, 500));
    if (mode === "email") {
        return [
            "Here’s a concise outreach draft:",
            "",
            "Subject: Quick idea to improve your website conversions",
            "",
            "Hi there,",
            "I noticed a few opportunities on your current site (page speed, CTA clarity, mobile layout).",
            "Open to a 15-minute chat this week? I can share a plan tailored for you.",
            "",
            "Best,\nHamza",
        ].join("\n");
    }
    if (mode === "summarize") {
        return "Summary: Focus on NEW leads from the last 3 days and RETURNING leads without follow-ups. Top tags trending: inbound, demo.";
    }
    return "Got it. Ask me to analyze recent leads, suggest next actions, or draft copy. What would you like to do first?";
}
