export const gradients = {
    // Brand Gradients
    brand: {
        value: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)",
    },
    brandAlt: {
        value: "linear-gradient(135deg, #8A64FF 0%, #523DFB 100%)",
    },

    // UI Gradients
    indigoViolet: {
        value: "linear-gradient(to right, #6366f1, #8b5cf6)",
    },
    indigoVioletHover: {
        value: "linear-gradient(to right, #4f46e5, #7c3aed)",
    },
    purplePink: {
        value: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    },
    purplePinkHover: {
        value: "linear-gradient(135deg, #7c3aed, #db2777)",
    },
    blueIndigo: {
        value: "linear-gradient(135deg, #3b82f6, #6366f1)",
    },
    blueIndigoHover: {
        value: "linear-gradient(135deg, #2563eb, #4f46e5)",
    },
    emeraldBlue: {
        value: "linear-gradient(135deg, #10b981, #3b82f6)",
    },
    amberRed: {
        value: "linear-gradient(135deg, #f59e0b, #ef4444)",
    },
    cyanBlue: {
        value: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    },
    tealGreen: {
        value: "linear-gradient(135deg, #14b8a6, #22c55e)",
    },
    purpleLavender: {
        value: "linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)",
    },
    slateGray: {
        value: "linear-gradient(135deg, #64748b, #475569)",
    },

    // Accent & Premium
    premiumGold: {
        value: "linear-gradient(135deg, #dfa35c 0%, #c0823c 50%, #996515 100%)",
    },
    ssoPurple: {
        value: "linear-gradient(135deg, #667eea, #764ba2)",
    },
    ssoPurpleHover: {
        value: "linear-gradient(135deg, #5a67d8, #6b46c1)",
    },
};

export const semanticTokens = {
    gradients: {
        brand: {
            value: {
                _light: "{gradients.brand}",
                _dark: "{gradients.brand}",
            },
        },
        primary: {
            value: {
                _light: "{gradients.indigoViolet}",
                _dark: "{gradients.indigoViolet}",
            },
        },
        secondary: {
            value: {
                _light: "{gradients.blueIndigo}",
                _dark: "{gradients.blueIndigo}",
            },
        },
        success: {
            value: {
                _light: "{gradients.tealGreen}",
                _dark: "{gradients.tealGreen}",
            },
        },
        warning: {
            value: {
                _light: "{gradients.amberRed}",
                _dark: "{gradients.amberRed}",
            },
        },
        premium: {
            value: {
                _light: "{gradients.premiumGold}",
                _dark: "{gradients.premiumGold}",
            },
        },
    },
};
