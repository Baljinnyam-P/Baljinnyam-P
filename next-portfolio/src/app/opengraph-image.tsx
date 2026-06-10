import { ImageResponse } from "next/og";

export const alt = "Baljinnyam Puntsagnorov, Full Stack / AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbfaf7",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "14px",
              background: "#8c3b2f",
              color: "#fbfaf7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "38px",
              fontWeight: 600,
            }}
          >
            B
          </div>
          <div style={{ fontSize: "26px", letterSpacing: "4px", color: "#908b80", textTransform: "uppercase" }}>
            Full Stack / AI Engineer
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "92px", color: "#1b1a17", lineHeight: 1.05 }}>Baljinnyam</div>
          <div style={{ fontSize: "92px", color: "#1b1a17", lineHeight: 1.05 }}>Puntsagnorov</div>
        </div>

        <div style={{ fontSize: "30px", color: "#56524b", maxWidth: "900px", lineHeight: 1.4 }}>
          Production AI systems, RAG and LLM evaluation, and distributed backends handling
          thousands of daily transactions.
        </div>
      </div>
    ),
    { ...size }
  );
}
