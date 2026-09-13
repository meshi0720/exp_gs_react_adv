"use client";
// src/app/page.tsx

import { useState } from "react";
import FaceMeter from "./FaceMeter";   // ← ① 追加
import Recorder from "./Recorder";

export default function Home() {
    const [topic, setTopic] = useState("ラポールを形成する自己紹介を2分で")
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [industry, setIndustry] = useState("銀行")
    const [tone, setTone] = useState("やさしめ"); //
    const [smileScore, setSmileScore] = useState(0);   // ← ② 追加
    
    

    async function handleSubmit() {
        setLoading(true);
        setFeedback("");
        const res = await fetch("/api/coach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, answer, smileScore }),
        });
        const data = await res.json();
        setFeedback(data.feedback);
        setLoading(false);
    }

    async function save() {
        await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, answer, smileScore, feedback }),
        });
        alert("保存しました");
    }

    async function deliver() {
        const res = await fetch("/api/deliver", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feedback }),
        });
        if (res.ok) alert("メールを送りました");
        else alert("メール送信に失敗しました（無料枠では自分の登録メール宛のみ送れます）");
    }

    return (
        <main style={{ padding: 24, maxWidth: 640 }}>
            <h1 className="p-6 text-4xl font-bold text-white text-center">AIロープレコーチ</h1>

            {/* ③ <h1> の下あたりに置く */}
            <FaceMeter onScore={setSmileScore} />
            <p>いまの笑顔率：{smileScore}%</p>

            <div
                className="text-xl mt-2">
                業界:
                <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                    <option value="銀行">銀行</option>
                    <option value="保険">保険</option>
                    <option value="証券">証券</option>
                </select>
            </div>

            <div
                className="text-xl mt-16">
                お題：
                <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="ラポールを形成する自己紹介を2分で">ラポールを形成する自己紹介を2分で</option>
                    <option value="刺さる提案に繋げる課題ヒアリング">刺さる提案に繋げる課題ヒアリング</option>
                    <option value="お客様に寄り添うクロージング">お客様に寄り添うクロージング</option>
                </select>
            </div>
            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5} style={{ width: "100%" }}
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                placeholder="ここに回答を入力" />
            
            {/* textarea の下あたり */} {/* 発展：録音すると、話した内容が answer に入る */}
            <Recorder onText={(t) => setAnswer(t)} />
            
            <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 12 }}>
                {loading ? "生成中…" : "コーチに見てもらう"}
            </button>

            {feedback && (
                <>
                    <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}
                        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                    >{feedback}</p>
                    <button onClick={save}>💾 保存する</button>
                    <button onClick={deliver}>✉ メールで受け取る</button>
                </>
            )}
        </main>
    );
}