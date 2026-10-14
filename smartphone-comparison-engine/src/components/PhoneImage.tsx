import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone } from "../types";
import { MediaService } from "../services/media.service";

interface PhoneImageProps {
  phone: Smartphone;
  type?: "thumbnail" | "hero";
  className?: string;
  alt?: string;
}

export default function PhoneImage({
  phone,
  type = "thumbnail",
  className = "",
  alt
}: PhoneImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  const media = MediaService.resolvePhoneMedia(phone);
  const resolvedUrl = type === "thumbnail" ? media.thumbnailUrl : media.heroUrl;

  // Sync state when phone or type changes
  useEffect(() => {
    setSrc(resolvedUrl || null);
    setLoading(true);
    setError(false);
  }, [phone.name, type, resolvedUrl]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    // Secure fallback strategy in case the main source encounters issues
    setSrc(
      type === "thumbnail"
        ? MediaService.FALLBACK_PHONE_THUMBNAIL
        : MediaService.FALLBACK_PHONE_HERO
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950/40 flex items-center justify-center ${className}`}
      id={`phone-image-container-${phone.brand}-${phone.name}`}
    >
      {/* Skeleton screen loader as a pulse animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-905 animate-pulse flex items-center justify-center z-10"
            id={`phone-image-skeleton-${phone.name}`}
          >
            {/* Minimalist device silhouette during load */}
            <svg
              className="w-10 h-10 text-slate-400 dark:text-slate-600 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="1.5" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main product image, lazy-loaded and with referrer-policy set strictly */}
      <motion.img
        src={src || null}
        alt={alt || phone.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-[1.04] ${
          loading ? "opacity-0 invisible" : "opacity-100 visible"
        }`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: loading ? 0 : 1, scale: loading ? 0.96 : 1 }}
        transition={{ duration: 0.45 }}
        id={`phone-image-img-${phone.name}`}
      />

      {/* Beautiful subtle brand layout overlay on error / extreme fallback indicator */}
      {error && (
        <div className="absolute top-1.5 right-1.5 bg-red-500/10 text-red-600 dark:text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md z-1 flex items-center gap-1 border border-red-550/20">
          ⚠️ مغذٍ بديل
        </div>
      )}
    </div>
  );
}
