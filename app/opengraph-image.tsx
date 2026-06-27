import { ImageResponse } from "next/og";

export const alt = "Summer Treats — preorder fresh treats & drinks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded preview card shown when the site link is shared (Instagram, etc.).
export default function OpengraphImage() {
  const stripes = Array.from({ length: 24 }, (_, i) => i);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FBF3DC",
          fontFamily: "sans-serif",
        }}
      >
        {/* Awning */}
        <div style={{ display: "flex", height: 70 }}>
          {stripes.map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: i % 2 === 0 ? "#EE8273" : "#ffffff",
              }}
            />
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 60px",
          }}
        >
          <div style={{ display: "flex", fontSize: 110 }}>🍪🧁🍋🥤</div>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 800,
              color: "#EE8273",
              marginTop: 10,
            }}
          >
            Summer Treats
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              color: "#46413B",
              marginTop: 8,
            }}
          >
            Fresh treats &amp; drinks — preorder this week!
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              background: "#2FB0A5",
              color: "#fff",
              fontSize: 34,
              fontWeight: 700,
              padding: "12px 32px",
              borderRadius: 9999,
            }}
          >
            @summertreatskids
          </div>
        </div>
      </div>
    ),
    { ...size, emoji: "twemoji" },
  );
}
