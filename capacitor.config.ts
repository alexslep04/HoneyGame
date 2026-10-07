import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.alexslep04.honeygame",
  appName: "Honey & Hearth",
  webDir: "dist",
  backgroundColor: "#c6d5af",
  android: {
    backgroundColor: "#c6d5af",
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
