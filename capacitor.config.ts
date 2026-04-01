import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "plugins": {
    "SystemBars": {
      "insetsHandling": "disable"
    },

    "Keyboard": {
      "resizeOnFullScreen": false
    },

    EdgeToEdge: {
       navigationBarColor: "#000000",
      statusBarColor: "#000000",
    }
  },
};

export default config;
