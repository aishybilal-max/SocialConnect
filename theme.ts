// theme.ts — Matcha + Black professional dark theme
export const theme = {
  colors: {
    bg:          "#0A0A0A",
    surface:     "#111111",
    surfaceHigh: "#1A1A1A",
    border:      "#222222",
    overlay:     "rgba(0,0,0,0.75)",

    primary:     "#6DBE8C",
    primarySoft: "rgba(109,190,140,0.12)",

    accent:      "#B8975A",
    accentSoft:  "rgba(184,151,90,0.12)",

    danger:      "#D95F5F",
    success:     "#6DBE8C",

    text:        "#EFEFEF",
    textSub:     "#888888",
    textMuted:   "#444444",
  },
  radius: {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   18,
    xl:   24,
    full: 999,
  },
  font: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    xxl:  26,   // ← yeh missing tha
  },
};