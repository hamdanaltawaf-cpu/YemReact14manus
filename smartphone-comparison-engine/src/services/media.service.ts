import { Smartphone } from "../types";

/**
 * Interface representing a structured phone media asset set.
 */
export interface PhoneMedia {
  thumbnailUrl: string;
  heroUrl: string;
  brandLogoSvg: string;
}

export class MediaService {
  /**
   * Safe fallback image URL from a high-quality, publicly accessible CDN (Unsplash and Picsum).
   */
  public static readonly FALLBACK_PHONE_THUMBNAIL = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=300&h=400";
  public static readonly FALLBACK_PHONE_HERO = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800&h=600";

  /**
   * Curated high-quality, publicly accessible device image map on Unsplash
   * grouped by device slugs for precise resolution.
   */
  private static readonly DEVICE_IMAGE_MAP: Record<string, { thumbnail: string; hero: string }> = {
    // Apple Devices
    "iphone-15-pro-max": {
      thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "iphone-15-pro": {
      thumbnail: "https://images.unsplash.com/photo-1695048132843-ea8718f4cf24?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1695048132843-ea8718f4cf24?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "iphone-15": {
      thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "iphone-16-pro-max": {
      thumbnail: "https://images.unsplash.com/photo-1727371360156-f09b5550a26d?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1727371360156-f09b5550a26d?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "iphone-16-pro": {
      thumbnail: "https://images.unsplash.com/photo-1727371360156-f09b5550a26d?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1727371360156-f09b5550a26d?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "iphone-16": {
      thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800&h=600"
    },
    // Samsung Devices
    "samsung-galaxy-s24-ultra": {
      thumbnail: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "samsung-galaxy-s24+": {
      thumbnail: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "samsung-galaxy-s24": {
      thumbnail: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&q=80&w=800&h=600"
    },
    // Google Devices
    "google-pixel-8-pro": {
      thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "google-pixel-8": {
      thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800&h=600"
    },
    // OnePlus Devices
    "oneplus-12": {
      thumbnail: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&q=80&w=800&h=600"
    },
    "oneplus-12r": {
      thumbnail: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?auto=format&fit=crop&q=80&w=800&h=600"
    },
    // Xiaomi & Others
    "xiaomi-14-ultra": {
      thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=300&h=400",
      hero: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800&h=600"
    }
  };

  /**
   * High fidelity inline Vector SVG definitions for leading smartphone brands.
   */
  private static readonly BRAND_LOGOS: Record<string, string> = {
    apple: `
      <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.36-6.17-2.73-2.22-6.57-6.73-11.51-13.5-5.54-7.66-10.15-16.14-13.82-25.46-3.67-9.32-5.52-18.42-5.52-27.3 0-14.4 3.73-25.59 11.19-33.56 7.45-7.97 16.5-11.95 27.13-11.95 5.02 0 10.43 1.34 16.22 4.03 5.8 2.68 9.53 4.03 11.2 4.03 1.34 0 5.14-1.37 11.39-4.1 6.25-2.74 11.75-4.04 16.5-3.9 11.95.45 21.06 4.8 27.32 13.06-9.83 6.03-14.65 14.18-14.44 24.47.22 8.32 3.4 15.18 9.56 20.57 6.15 5.39 13.51 8.24 22.08 8.56 1.89-6.9 4.31-13.41 7.23-19.55zM119.22 9.2c0 8.04-2.92 15.33-8.76 21.87-5.84 6.54-13.1 10.65-21.78 12.33.22-7.59 3.1-14.93 8.65-22.03C102.88 14.28 110.19 10 118.84 9.2c.22.45.38 10 .38 10z"/>
      </svg>
    `,
    samsung: `
      <svg class="w-10 h-3 fill-current shrink-0" viewBox="0 0 250 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.5 31.4c0 3.8-3 6.9-6.7 6.9-3.7 0-6.7-3.1-6.7-6.9s3-6.9 6.7-6.9c3.7 0 6.7 3.1 6.7 6.9zm1.3-13c-4.3-3.6-10.1-5.6-16-5.6C3.5 12.8 0 16.3 0 20.6c0 10 14.7 6 14.7 10.6 0 1.6-1.3 3-3 3-3.3 0-6.3-1.9-8.4-4.2l-2 3c2.7 3.1 6.9 5.2 11.4 5.2 4.3 0 7.8-3.5 7.8-7.8 0-10.4-14.7-6.2-14.7-10.7 0-1.6 1.3-3 3-3 3.1 0 5.7 1.8 7.6 3.9l2-2.9v-.1zm28 20.3h4.4V13.8l-15.3 25h1.2l9.7-15.9V38.7zm28.3 0h4.4V13.8l-15.3 25h1.2l9.7-15.9V38.7zm43.3-14.1c0 8.2-6.7 14.8-14.8 14.8-8.2 0-14.8-6.7-14.8-14.8S102 9.8 110.1 9.8c8.2.1 14.8 6.7 14.8 14.8zm-4.4 0c0-5.8-4.7-10.5-10.5-10.5S104.5 19 104.5 24.7s4.7 10.5 10.5 10.5 10.4-4.7 10.4-10.5zm31.7 14.1h4.4V13.8l-15.3 25h1.2l9.7-15.9V38.7zM186 31.4c0 3.8-3.1 6.9-6.9 6.9s-6.9-3.1-6.9-6.9 3.1-6.9 6.9-6.9c3.8 0 6.9 3.1 6.9 6.9zm1.3-13c-4.3-3.6-10.1-5.6-16-5.6-4.3 0-7.8 3.5-7.8 7.8 0 10 14.7 6 14.7 10.6 0 1.6-1.3 3-3 3-3.3 0-6.3-1.9-8.4-4.2l-2 3c2.7 3.1 6.9 5.2 11.4 5.2 4.3 0 7.8-3.5 7.8-7.8 0-10.4-14.7-6.2-14.7-10.7 0-1.6 1.3-3 3-3 3.1 0 5.7 1.8 7.6 3.9l2-2.9zM218 31c0 4.1-3 7-7.2 7h-6.8v-14h6.8c4.2 0 7.2 2.9 7.2 7zm0-13.8c0 4.1-3 7-7.2 7h-6.8v-14h6.8c4.2 0 7.2 2.9 7.2 7zM245 38.7V13.8h-4.4v24.9H245z"/>
      </svg>
    `,
    google: `
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.76-2.4 3.6l3.72 2.88c2.17-2 3.81-4.95 3.81-8.33z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.72-2.88c-1.03.69-2.35 1.11-4.21 1.11-3.24 0-5.97-2.18-6.95-5.12l-3.85 2.98C3.17 21.03 7.26 24 12 24z"/>
        <path fill="#FBBC05" d="M5.05 14.2c-.25-.75-.39-1.56-.39-2.4s.14-1.65.39-2.4L1.2 6.42C.43 7.96 0 9.7 0 11.5s.43 3.54 1.2 5.08l3.85-2.98z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.26 0 3.17 2.97 1.2 6.42l3.85 2.98c.98-2.94 3.71-5.12 6.95-5.12z"/>
      </svg>
    `,
    oneplus: `
      <svg class="w-4 h-4 fill-current text-red-600 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M22 2H2v20h20V2zm-9 11v4h-2v-4H7v-2h4V7h2v4h4v2h-4z"/>
      </svg>
    `,
    xiaomi: `
      <svg class="w-4 h-4 text-orange-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" h="24" rx="4" />
        <path d="M5 7h4v2H7v8H5V7zm9 0h2v10h-2V9h-2v8h-2V9H9V7h5v10z" fill="#fff"/>
      </svg>
    `
  };

  /**
   * Helper utility to normalize strings for robust fuzzy match keys
   */
  public static generateDeviceSlug(name: string): string {
    return (name || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }

  /**
   * Resolves a smartphone's complete media package depending on available meta and model descriptors.
   */
  public static resolvePhoneMedia(phone: Smartphone): PhoneMedia {
    const slug = this.generateDeviceSlug(phone.name);
    const brandKey = (phone.brand || "").toLowerCase().trim();

    // 1. Resolve product images matching the device map
    let thumbnail = this.FALLBACK_PHONE_THUMBNAIL;
    let hero = this.FALLBACK_PHONE_HERO;

    // Fuzzy lookupper
    const matchedKey = Object.keys(this.DEVICE_IMAGE_MAP).find(
      key => slug.includes(key) || key.includes(slug)
    );

    if (matchedKey) {
      thumbnail = this.DEVICE_IMAGE_MAP[matchedKey].thumbnail;
      hero = this.DEVICE_IMAGE_MAP[matchedKey].hero;
    } else {
      // Direct brand-specific default picture if specific phone representation is absent
      if (brandKey === "apple") {
        thumbnail = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=300&h=400";
        hero = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800&h=600";
      } else if (brandKey === "samsung") {
        thumbnail = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=300&h=400";
        hero = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800&h=600";
      } else if (brandKey === "google") {
        thumbnail = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=300&h=400";
        hero = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800&h=600";
      }
    }

    // 2. Resolve brand logos
    let logoSvg = `
      <svg class="w-4 h-4 fill-current shrink-0 text-slate-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
      </svg>
    `;

    const matchedBrand = Object.keys(this.BRAND_LOGOS).find(
      b => brandKey.includes(b) || b.includes(brandKey)
    );

    if (matchedBrand) {
      logoSvg = this.BRAND_LOGOS[matchedBrand];
    }

    return {
      thumbnailUrl: thumbnail,
      heroUrl: hero,
      brandLogoSvg: logoSvg
    };
  }
}
