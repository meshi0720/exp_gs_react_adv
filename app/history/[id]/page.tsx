// app/history/[id]/page.tsx
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import DeleteButton from "./DeleteButton";

export default async function HistoryDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const rows = await db.select().from(sessions).where(eq(sessions.id, Number(id)));
    const row = rows[0];

    if (!row) return <main style={{ padding: 24 }}>見つかりませんでした。</main>;

    return (
        <main style={{ padding: 24, maxWidth: 640 }}>
            <h1 className="text-2xl font-bold">{row.topic}</h1>

            <table className="mt-4 w-full border-collapse border border-gray-300">
                <tbody>
                    <tr>
                        <th className="w-1/3 border border-gray-300 bg-black-50 p-2 text-left">お題</th>
                        <td className="border border-gray-300 p-2">{row.topic}</td>
                    </tr>
                    <tr>
                        <th className="border border-gray-300 bg-black-50 p-2 text-left">😊 笑顔スコア</th>
                        <td className="border border-gray-300 p-2">{row.smileScore ?? 0}%</td>
                    </tr>
                    <tr>
                        <th className="border border-gray-300 bg-black-50 p-2 text-left">🗣 回答</th>
                        <td className="whitespace-pre-wrap border border-gray-300 p-2">{row.answerText}</td>
                    </tr>
                    <tr>
                        <th className="border border-gray-300 bg-black-50 p-2 text-left">🤖 フィードバック</th>
                        <td className="whitespace-pre-wrap border border-gray-300 p-2">{row.feedback}</td>
                    </tr>
                </tbody>
            </table>

            <DeleteButton id={row.id} />
        </main>
    );
}