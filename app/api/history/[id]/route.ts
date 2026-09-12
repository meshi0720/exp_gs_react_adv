// app/api/history/[id]/route.ts
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await db.delete(sessions).where(eq(sessions.id, Number(id)));
        return Response.json({ success: true });
    } catch (err) {
        console.error("削除に失敗しました:", err);
        return Response.json({ success: false }, { status: 500 });
    }
}