import { ImageResponse } from "next/og";

export const alt = "Whispering Green Foundation — community waste action in Vasai-West";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview card. Text and shapes only — no remote assets, so it renders
 * identically in development and in production, and no invented logo or
 * photograph is baked into anything we publish.
 */
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
          background: "linear-gradient(135deg, #24422a 0%, #0f1f14 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* abstract leaf mark — drawn with CSS only (no emoji/font dependency) */}
          <div style={{ display: "flex", width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: "#67b13f",
                borderRadius: "50% 0 50% 50%",
                transform: "rotate(45deg)",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#a8d98b", letterSpacing: 4 }}>
            VASAI-WEST · MAHARASHTRA
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, color: "#faf9f4", lineHeight: 1.1, maxWidth: 900 }}>
            Whispering Green Foundation
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#c2d9c1", marginTop: 24, maxWidth: 900 }}>
            Community waste collection, environmental awareness and verified impact.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, color: "#98bf98" }}>
            Segregate · Collect · Recycle
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#86c961" }}>
            Impact from verified records only
          </div>
        </div>
      </div>
    ),
    size
  );
}
