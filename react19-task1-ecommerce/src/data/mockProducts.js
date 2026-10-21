export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Aura Noise-Canceling Headphones",
    price: 299.99,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Premium wireless audio with adaptive acoustic noise cancellation.",
    rating: 4.8,
    stock: 15
  },
  {
    id: 2,
    name: "Chronos Mechanical Smartwatch",
    price: 349.50,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Sapphire glass smartwatch with titanium chassis and 7-day battery life.",
    rating: 4.9,
    stock: 8
  },
  {
    id: 3,
    name: "Lumina Ergo Mechanical Keyboard",
    price: 189.00,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Hot-swappable tactile switches with customizable per-key RGB backlighting.",
    rating: 4.7,
    stock: 22
  },
  {
    id: 4,
    name: "Vantage 4K Ultra-Wide Monitor",
    price: 699.00,
    category: "Displays",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    shortDescription: "34-inch curved QD-OLED display engineered for creators and developers.",
    rating: 4.9,
    stock: 5
  },
  {
    id: 5,
    name: "Apex Precision Wireless Mouse",
    price: 99.00,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Ultralight ergonomic honeycomb design with 26,000 DPI optical sensor.",
    rating: 4.6,
    stock: 30
  },
  {
    id: 6,
    name: "Nebula Ambient Studio Speaker",
    price: 249.99,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    shortDescription: "Room-filling 360-degree high-fidelity spatial audio with Wi-Fi streaming.",
    rating: 4.7,
    stock: 12
  }
];

// Cacheable promise generator to simulate asynchronous data fetching
export function createProductsPromise(shouldFail = false, delayMs = 1200) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Failed to fetch products: Server responded with error 500 (Simulated)."));
      } else {
        resolve(MOCK_PRODUCTS);
      }
    }, delayMs);
  });
}
