export default {
    expo: {
        name: "nurox",
        slug: "nurox",
        scheme: "nurox",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        updates: {
            fallbackToCacheTimeout: 0
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#FFFFFF"
            }
        },
        web: {
            favicon: "./assets/images/favicon.png"
        }
    }
}