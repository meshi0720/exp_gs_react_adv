"use client";

import { useState } from "react";
import FaceMeter from "./FaceMeter";   // ← ① 追加

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

    // 自分のAPI(/api/coach)を呼ぶ（Groqのキーはこの先＝サーバー側にある）
    // 通信やAPI側の失敗で画面が無反応にならないよう try/catch/finally で守る
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, answer, tone, industry }),
      });
      const data = await res.json();
      setFeedback(data.feedback ?? "エラーが起きました。もう一度お試しください。");
    } catch {
      setFeedback("通信に失敗しました。ネットワークを確認してください。");
    } finally {
      setLoading(false);
    }
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
        className="text-xl mt-2 "> 
        口調：
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="やさしめ">やさしめ</option>
          <option value="スパルタ">スパルタ</option>
          <option value="ていねい">ていねい</option>
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
        rows={5}
        className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
        placeholder="ここに回答を入力"
      />

      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="mt-3 block mx-auto rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        {loading ? "生成中…" : "コーチに見てもらう"}
      </button>

      {feedback && (
        <p
          style={{ whiteSpace: "pre-wrap", marginTop: 16 }}
          className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
        >{feedback}
        </p>
    )}
  </main >
);
}