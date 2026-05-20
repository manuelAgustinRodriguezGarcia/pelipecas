import { ImageResponse } from "next/og";

export function createPwaIcon(size) {
  const radius = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.42);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080808",
          borderRadius: radius,
          border: `${Math.max(2, Math.round(size * 0.04))}px solid #d4af37`,
          color: "#d4af37",
          fontSize,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        P
      </div>
    ),
    { width: size, height: size }
  );
}
