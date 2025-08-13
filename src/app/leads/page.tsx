// src/app/leads/page.tsx
import prisma from "@/lib/db";

export const dynamic = "force-dynamic"; // always fetch fresh data in dev

export default async function LeadsPage() {
    // TEMP: show all leads. If you want only your user, add: where: { ownerId: "1" }
    const leads = await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        // where: { ownerId: "1" },
    });

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-blue-700">Leads</h1>

            {leads.length === 0 ? (
                <p className="text-sm text-gray-500">No leads found yet.</p>
            ) : (
                <table className="w-full border text-sm text-gray-900">
                    <thead>
                    <tr className="bg-gray-800 text-white font-bold">
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leads.map((l) => (
                        <tr
                            key={l.id}
                            className="border-t hover:bg-gray-100 transition-colors"
                        >
                            <td className="p-2">{l.name}</td>
                            <td className="p-2">{l.email ?? "—"}</td>
                            <td className="p-2">{l.type}</td>
                            <td className="p-2">{l.status}</td>
                            <td className="p-2">
                                {new Date(l.createdAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}
