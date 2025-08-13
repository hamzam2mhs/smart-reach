"use client";

type Props = {
    toEmail: string;
    subject: string;
    html?: string;
    text?: string;
    alsoQueueToDb?: boolean; // optional
};

export default function EmailAlertButton({
                                             toEmail,
                                             subject,
                                             html,
                                             text,
                                             alsoQueueToDb = false,
                                         }: Props) {
    const handleClick = async () => {
        const plain =
            text ??
            (html
                ? html
                    .replace(/<style[\s\S]*?<\/style>/gi, "")
                    .replace(/<script[\s\S]*?<\/script>/gi, "")
                    .replace(/<[^>]+>/g, "")
                    .replace(/\s+\n/g, "\n")
                    .trim()
                : "");

        // OPTIONAL: save to DB as QUEUED, but not actually sent
        if (alsoQueueToDb) {
            try {
                await fetch("/api/email/queue", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        toEmail,
                        subject,
                        bodyHtml: html,
                        bodyText: plain || text,
                    }),
                });
            } catch {
                // ignore DB errors in alert-only demo
            }
        }

        window.alert(
            `Preview only — not sending\n\nTo: ${toEmail}\nSubject: ${subject}\n\n` +
            (plain || "(no body)")
        );
    };

    return (
        <button
            onClick={handleClick}
            className="px-3 py-2 rounded bg-black text-white hover:opacity-90"
        >
            Send Email
        </button>
    );
}
