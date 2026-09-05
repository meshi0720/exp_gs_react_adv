"use client";
// src/app/FaceMeter.tsx

import { useEffect, useRef, useState } from "react";
// ↓ トップレベルのimportを削除しました
// import * as faceapi from "@vladmandic/face-api";

//笑顔スコアからラベルと色を判定//
function getSmileLevel(score: number): { label: string; color: string; icon: string } {
    if (score >= 90) return { label: "とても良い", color: "blue", icon: "😄" };
    if (score >= 70) return { label: "良い", color: "green", icon: "😊" };
    if (score >= 50) return { label: "普通", color: "black", icon: "😀" };
    return { label: "改善要", color: "red", icon: "😎" };
}
    
export default function FaceMeter({ onScore }: { onScore: (n: number) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [smile, setSmile] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        let stream: MediaStream | null = null;
        let cancelled = false;

        async function start() {
            // ← ここでブラウザ上に来てから初めて読み込む
            const faceapi = await import("@vladmandic/face-api");

            // ① モデルを読み込む（public/models から）
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
                await faceapi.nets.faceExpressionNet.loadFromUri("/models");
            } catch (e) {
                console.error("モデルの読み込みに失敗しました:", e);
                setError("表情認識モデルの読み込みに失敗しました。public/modelsを確認してください。");
                return;
            }

            if (cancelled) return;

            // ② カメラを起動して video に流す
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });

                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    try {
                        await videoRef.current.play();
                    } catch (playErr: any) {
                        if (playErr?.name !== "AbortError") {
                            throw playErr;
                        }
                    }
                }
            } catch (e) {
                console.error("カメラの起動に失敗しました:", e);
                alert("カメラを使えませんでした。ブラウザのアドレスバーでカメラを『許可』してから、ページを再読み込みしてください。");
                return;
            }

            if (cancelled) return;

            // ③ 0.5秒ごとに表情を測る
            timer = setInterval(async () => {
                if (!videoRef.current) return;
                const result = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceExpressions();
                if (result) {
                    const happy = Math.round(result.expressions.happy * 100);
                    setSmile(happy);
                    onScore(happy);
                }
            }, 500);
        }

        start();

        return () => {
            cancelled = true;
            clearInterval(timer);
            stream?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return (
        <div>
            <video ref={videoRef} autoPlay muted playsInline width={320} height={240} />
            {/*<p>😊 笑顔 {smile}%</p>*/}
            <p style={{ color: getSmileLevel(smile).color }}>
                {getSmileLevel(smile).icon} 笑顔 {smile}%（{getSmileLevel(smile).label}）
            </p>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}