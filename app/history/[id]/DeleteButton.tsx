"use client";
// app/history/[id]/DeleteButton.tsx

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: number }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        const ok = confirm("この履歴を削除しますか？この操作は取り消せません。");
        if (!ok) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
            if (!res.ok) {
                alert("削除に失敗しました。もう一度お試しください。");
                setDeleting(false);
                return;
            }
            router.push("/history"); // ← 一覧ページのパスに合わせて調整してください
            router.refresh();
        } catch {
            alert("通信に失敗しました。ネットワークを確認してください。");
            setDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
            {deleting ? "削除中…" : "🗑 この履歴を削除"}
        </button>
    );
}