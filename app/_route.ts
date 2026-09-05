// src/app/api/coach/route.ts
export async function POST(request: Request) {
    // ① 入力を受け取る（画面から送られてくる お題 と 回答）
    //   Body が空/JSONでない時に備えて、try で受け止める
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ feedback: "リクエストの形式が不正です（Bodyの内容を確認してください）" }, { status: 400 });
    }
    const { topic, answer, tone, industry } = body;

    // ①.5 必須項目のチェック（空文字・未入力・型違いをまとめて弾く）
    if (!topic || typeof topic !== "string" || !topic.trim()) {
        return Response.json({ feedback: "お題が選択されていません。" }, { status: 400 });
    }
    if (!answer || typeof answer !== "string" || !answer.trim()) {
        return Response.json({ feedback: "回答が空です。テキストを入力してください。" }, { status: 400 });
    }

    // ② AIへの"お願い文"を組み立てる
    const prompt = `あなたは${industry}業界のプレゼン/面接の練習コーチです。
「${tone}」な口調で、次の「お題」に対する「回答」を読んで、良かった点と改善点を、
やさしく具体的に、200文字くらいで日本語でフィードバックしてください。
お題: ${topic}
回答: ${answer}`;

    // ③〜④ Groqを叩いて返事を取り出すところを、まるごとtry/catchで囲む
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [{ role: "user", content: prompt }],
            }),
        });

        // レスポンスがJSONでない場合（Groq側の障害やHTMLエラーページなど）に備える
        let data;
        try {
            data = await res.json();
        } catch (parseErr) {
            const text = await res.text().catch(() => "");
            console.error("Groqのレスポンスがjsonではありません:", res.status, text);
            return Response.json(
                { feedback: "AIサーバーから予期しない応答が返ってきました。ターミナルのログを確認してください。" },
                { status: 502 },
            );
        }

        // Groqがエラーを返した時（キー違い・回数制限など）はここで気づける
        if (!res.ok || !data.choices) {
            console.error("Groqエラー:", data);
            return Response.json(
                { feedback: "AIとの通信に失敗しました。ターミナルの赤い文字（キー違い・回数制限など）を確認してください。" },
                { status: 502 },
            );
        }

        const feedback = data.choices[0].message.content;

        // ⑤ 画面に返す
        return Response.json({ feedback });
    } catch (err) {
        // fetch自体が失敗した場合（ネットワークエラーなど）や、想定外のエラーをここで拾う
        console.error("予期しないエラー:", err);
        return Response.json(
            { feedback: "サーバー内部でエラーが発生しました。ターミナルのログを確認してください。" },
            { status: 500 },
        );
    }
}