export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Aura Noise-Canceling Headphones",
    price: 299.99,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Premium wireless audio with adaptive acoustic noise cancellation.",
    fullDescription: "Immerse yourself in pure studio-grade acoustics. The Aura Noise-Canceling Headphones feature custom 40mm beryllium drivers, active spatial transparency, and over 45 hours of uninterrupted battery life.",
    features: [
      "Custom 40mm Beryllium Drivers",
      "Adaptive Active Noise Cancellation",
      "Multipoint Bluetooth 5.4 Connectivity",
      "45-hour quick-charge battery"
    ],
    rating: 4.8,
    reviewsCount: 142,
    stock: 15
  },
  {
    id: 2,
    name: "Chronos Mechanical Smartwatch",
    price: 349.50,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Sapphire glass smartwatch with titanium chassis and 7-day battery life.",
    fullDescription: "A fusion of horological precision and modern intelligence. Crafted from Aerospace Grade 5 Titanium with a scratch-resistant sapphire crystal front and complete bio-sensor array.",
    features: [
      "Grade 5 Titanium Case with Sapphire Crystal",
      "Continuous ECG & SpO2 Biometric Tracking",
      "5 ATM Water Resistance (50m)",
      "Always-On AMOLED Display"
    ],
    rating: 4.9,
    reviewsCount: 89,
    stock: 8
  },
  {
    id: 3,
    name: "Lumina Ergo Mechanical Keyboard",
    price: 189.00,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Hot-swappable tactile switches with customizable per-key RGB backlighting.",
    fullDescription: "Engineered for maximum typing comfort and zero fatigue. Features gasket-mounted acoustic sound dampening, custom lubed mechanical switches, and full QMK/VIA key remapping.",
    features: [
      "Hot-Swappable 5-Pin Switch Sockets",
      "Gasket Mount Acoustic Dampening",
      "Custom PBT Dye-Sub Keycaps",
      "Tri-mode connectivity: 2.4Ghz, Bluetooth, USB-C"
    ],
    rating: 4.7,
    reviewsCount: 215,
    stock: 22
  },
  {
    id: 4,
    name: "Vantage 4K Ultra-Wide Monitor",
    price: 699.00,
    category: "Displays",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    shortDescription: "34-inch curved QD-OLED display engineered for creators and developers.",
    fullDescription: "Breathtaking visual depth with near-infinite contrast. Boasts 99% DCI-P3 color gamut accuracy, 175Hz refresh rate with 0.03ms response time, and 90W USB-C single cable power delivery.",
    features: [
      "34-inch 1800R Curved QD-OLED Panel",
      "175Hz Refresh Rate & 0.03ms Response Time",
      "99.3% DCI-P3 Factory Calibrated Color",
      "Integrated 90W USB-C Power Hub"
    ],
    rating: 4.9,
    reviewsCount: 67,
    stock: 5
  },
  {
    id: 5,
    name: "Apex Precision Wireless Mouse",
    price: 99.00,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Ultralight ergonomic honeycomb design with 26,000 DPI optical sensor.",
    fullDescription: "Weighing only 58 grams, the Apex Precision delivers lightning-fast tracking and pixel-perfect accuracy for both competitive gaming and intensive daily workflows.",
    features: [
      "Ultra-lightweight 58g chassis",
      "PixArt 3395 26,000 DPI Optical Sensor",
      "Optical micro-switches rated for 100M clicks",
      "Lag-free 1000Hz polling rate wireless"
    ],
    rating: 4.6,
    reviewsCount: 94,
    stock: 30
  },
  {
    id: 6,
    name: "Nebula Ambient Studio Speaker",
    price: 249.99,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    shortDescription: "Room-filling 360-degree high-fidelity spatial audio with Wi-Fi streaming.",
    fullDescription: "A design icon engineered with acoustic room calibration. Fills any space with balanced, lifelike sound and deep resonance. Supports AirPlay 2, Spotify Connect, and Lossless streaming.",
    features: [
      "360-Degree Omnidirectional Sound Waveguide",
      "Automatic Room Calibration Sensor",
      "Lossless High-Resolution 24-bit/192kHz Audio",
      "Multi-room grouping support"
    ],
    rating: 4.7,
    reviewsCount: 78,
    stock: 12
  }
];

export function createProductsPromise(shouldFail = false, delayMs = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Simulated Server Error: Failed to retrieve catalog data."));
      } else {
        resolve(MOCK_PRODUCTS);
      }
    }, delayMs);
  });
}
