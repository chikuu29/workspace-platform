export const colors = {


    brand: {
        100: { value: "#E9E3FF" },
        200: { value: "#422AFB" },
        300: { value: "#422AFB" },
        400: { value: "#7551FF" },
        500: { value: "#422AFB" },
        600: { value: "#3311DB" },
        700: { value: "#02044A" },
        800: { value: "#190793" },
        900: { value: "#11047A" },
    },
    brandScheme: {
        100: { value: "#E9E3FF" },
        200: { value: "#7551FF" },
        300: { value: "#7551FF" },
        400: { value: "#7551FF" },
        500: { value: "#422AFB" },
        600: { value: "#3311DB" },
        700: { value: "#02044A" },
        800: { value: "#190793" },
        900: { value: "#02044A" },
    },
    brandTabs: {
        100: { value: "#E9E3FF" },
        200: { value: "#422AFB" },
        300: { value: "#422AFB" },
        400: { value: "#422AFB" },
        500: { value: "#422AFB" },
        600: { value: "#3311DB" },
        700: { value: "#02044A" },
        800: { value: "#190793" },
        900: { value: "#02044A" },
    },
    secondaryGray: {
        100: { value: "#E0E5F2" },
        200: { value: "#E1E9F8" },
        300: { value: "#F4F7FE" },
        400: { value: "#E9EDF7" },
        500: { value: "#8F9BBA" },
        600: { value: "#A3AED0" },
        700: { value: "#707EAE" },
        800: { value: "#707EAE" },
        900: { value: "#1B2559" },
        1: { value: "hsla(0, 0%, 100%, 0.65)" },
    },
    red: {
        100: { value: "#FEEFEE" },
        500: { value: "#EE5D50" },
        600: { value: "#E31A1A" },
    },
    blue: {
        50: { value: "#EFF4FB" },
        500: { value: "#3965FF" },
    },
    orange: {
        100: { value: "#FFF6DA" },
        500: { value: "#FFB547" },
    },
    green: {
        100: { value: "#E6FAF5" },
        500: { value: "#01B574" },
    },
    navy: {
        50: { value: "#d0dcfb" },
        100: { value: "#aac0fe" },
        200: { value: "#a3b9f8" },
        300: { value: "#728fea" },
        400: { value: "#3652ba" },
        500: { value: "#1b3bbb" },
        600: { value: "#24388a" },
        700: { value: "#1B254B" },
        800: { value: "#111c44" },
        900: { value: "#0b1437" },
    },
    gray: {
        50: { value: "#f9f9f9" },
        100: { value: "#ececec" },
        200: { value: "#e3e3e3" },
        300: { value: "#cdcdcd" },
        400: { value: "#b4b4b4" },
        500: { value: "#9b9b9b" },
        600: { value: "#676767" },
        700: { value: "#424242" },
        750: { value: "#2f2f2f" },
        800: { value: "#212121" },
        900: { value: "#171717" },
        950: { value: "#0d0d0d" },
    }

}

export const semanticTokens = {
    colors: {
        text: {
            default: {
                value: { _light: "{colors.gray.800}", _dark: "hsla(0, 0%, 100%, 0.65)" }
            },
            muted: {
                value: { _light: "{colors.secondaryGray.700}", _dark: "{colors.secondaryGray.400}" }
            },
            brand: {
                value: { _light: "{colors.brand.500}", _dark: "{colors.brand.400}" }
            }
        },
        bg: {
            default: {
                value: { _light: "#f7f7f7", _dark: "colors.navy.900" }
            }
        },

        "app.input.bg": {
            value: {
                _light: "#ffffff",
                _dark: "rgba(255,255,255,0.05)",
            },
        },
        "app.input.border": {
            value: {
                _light: "rgba(203,213,225,0.8)",
                _dark: "rgba(255,255,255,0.1)",
            },
        },
        "app.input.border.focus": {
            value: {
                _light: "#6366f1",
                _dark: "#818cf8",
            },
        },
        "app.input.glow": {
            value: {
                _light: "0 0 0 3px rgba(99,102,241,0.18)",
                _dark: "0 0 0 3px rgba(129,140,248,0.25), 0 0 20px rgba(99,102,241,0.12)",
            },
        },
        // ── Auth text ─────────────────────────────────────────
        "app.text.primary": {
            value: {
                _light: "#0f172a",
                _dark: "#f1f5f9",
            },
        },
        "app.text.muted": {
            value: {
                _light: "#64748b",
                _dark: "#94a3b8",
            },
        },
        "app.text.accent": {
            value: {
                _light: "#6366f1",
                _dark: "#818cf8",
            },
        },

        "app.navbar.border": {
            value: {
                _light: "rgba(99,102,241,0.12)",
                _dark: "rgba(255,255,255,0.06)",
            },
        },
        "app.btn.border": {
            value: {
                _light: "#6366f1",
                _dark: "#818cf8",
            },
        },
        // ── Card / panel surface ──────────────────────────────
        "app.card.bg": {
            value: {
                _light: "colors.white",
                _dark: "colors.navy.800",
            },
        },
        "app.card.border": {
            value: {
                _light: "rgba(99,102,241,0.15)",
                _dark: "rgba(255,255,255,0.08)",
            },
        },
        // // ── Text ─────────────────────────────────────────────
        // "app.text.primary": {
        //     value: {
        //         _light: "#0f172a",
        //         _dark: "#f1f5f9",
        //     },
        // },
        // "app.text.muted": {
        //     value: {
        //         _light: "#64748b",
        //         _dark: "#94a3b8",
        //     },
        // },
        // "app.text.accent": {
        //     value: {
        //         _light: "#6366f1",
        //         _dark: "#818cf8",
        //     },
        // },
        // ── Divider ──────────────────────────────────────────
        "app.divider": {
            value: {
                _light: "rgba(148,163,184,0.3)",
                _dark: "rgba(255,255,255,0.06)",
            },
        },

        // ── Auth page background ──────────────────────────────
        "auth.bg": {
            value: {
                _light: "#f0f4ff",
                _dark: "rgba(15, 23, 42, 0.97)",
            },
        },
        // ── Auth card surface ─────────────────────────────────
        // "auth.card.bg": {
        //     value: {
        //         _light: "rgba(255,255,255,0.95)",
        //         _dark: "rgba(255,255,255,0.04)",
        //     },
        // },
        // "auth.card.border": {
        //     value: {
        //         _light: "rgba(99,102,241,0.15)",
        //         _dark: "rgba(255,255,255,0.08)",
        //     },
        // },
        // ── Input fields ──────────────────────────────────────
        "auth.input.bg": {
            value: {
                _light: "#ffffff",
                _dark: "rgba(255,255,255,0.05)",
            },
        },
        "auth.input.border": {
            value: {
                _light: "rgba(203,213,225,0.8)",
                _dark: "rgba(255,255,255,0.1)",
            },
        },
        "auth.input.border.focus": {
            value: {
                _light: "#6366f1",
                _dark: "#818cf8",
            },
        },
        "auth.input.glow": {
            value: {
                _light: "0 0 0 3px rgba(99,102,241,0.18)",
                _dark: "0 0 0 3px rgba(129,140,248,0.25), 0 0 20px rgba(99,102,241,0.12)",
            },
        },
        // ── Auth text ─────────────────────────────────────────
        "auth.text.primary": {
            value: {
                _light: "#0f172a",
                _dark: "#f1f5f9",
            },
        },
        "auth.text.muted": {
            value: {
                _light: "#64748b",
                _dark: "#94a3b8",
            },
        },
        "auth.text.accent": {
            value: {
                _light: "#6366f1",
                _dark: "#818cf8",
            },
        },
        "auth.btn.bg": {
            value: {
                _light: "#6366f1",
                _dark: "#6366f1",
            },
        },
        "auth.social.bg": {
            value: {
                _light: "#ffffff",
                _dark: "rgba(255,255,255,0.05)",
            },
        },
        "auth.social.border": {
            value: {
                _light: "rgba(203,213,225,0.8)",
                _dark: "rgba(255,255,255,0.1)",
            },
        },
        "auth.divider": {
            value: {
                _light: "rgba(148,163,184,0.4)",
                _dark: "rgba(255,255,255,0.08)",
            },
        }

    }
}
