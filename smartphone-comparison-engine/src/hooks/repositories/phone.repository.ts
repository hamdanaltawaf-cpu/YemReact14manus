import { RelationalDatabase } from "../../db/database";
import { PhoneEntity, ReviewEntity } from "../../db/schema";
import { Smartphone } from "../../types";

/**
 * Repository Pattern governing specifications access. 
 * Completely abstracts WHERE the data is loaded/loaded from.
 */
export class PhoneRepository {
  private readonly db = RelationalDatabase.getInstance();

  /**
   * Fetch individual smartphone by id slug, with complete relation hydration (joined view)
   */
  public getById(id: string): Smartphone | null {
    const slug = this.db.generateSlug(id);
    return this.db.getMergedSmartphone(slug);
  }

  /**
   * List all smartphones with optional brand and pagination parameters
   */
  public listAll(options: { brandId?: string; limit?: number; offset?: number } = {}): Smartphone[] {
    const list: Smartphone[] = [];
    for (const slug of this.db.phones.keys()) {
      const p = this.db.getMergedSmartphone(slug);
      if (p) {
        if (options.brandId && p.brand.toLowerCase() !== options.brandId.toLowerCase()) {
          continue;
        }
        list.push(p);
      }
    }
    const offset = options.offset || 0;
    const limit = options.limit !== undefined ? options.limit : list.length;
    return list.slice(offset, offset + limit);
  }

  /**
   * Upsert a target device. Handles full deconstruction and mapping across the system tables.
   */
  public save(phone: Smartphone, confidenceScore = 100): Smartphone {
    this.db.insertOrUpdatePhone(phone, confidenceScore);
    const slug = this.db.generateSlug(phone.name);
    return this.db.getMergedSmartphone(slug) || phone;
  }

  /**
   * Retrieves user reviews for a device from the localized relation Map
   */
  public getReviews(phoneId: string): ReviewEntity[] {
    const slug = this.db.generateSlug(phoneId);
    return this.db.reviews.get(slug) || [];
  }

  /**
   * Appends review records, validating constraints and generating unique identifiers
   */
  public addReview(phoneId: string, author: string, rating: number, comment: string): ReviewEntity[] {
    const slug = this.db.generateSlug(phoneId);
    if (!this.db.phones.has(slug)) {
      // Create a shell phone entity if user is writing a review on a pre-cached/just added slug
      const name = phoneId.replace(/-/g, " ");
      this.db.insertOrUpdatePhone({
        name,
        brand: name.split(" ")[0] || "الشركة العامة",
        screen: "غير متوفر",
        processor: "غير متوفر",
        camera: "غير متوفر",
        battery: "غير متوفر",
        charging: "غير متوفر",
        storage: "غير متوفر"
      }, 50);
    }

    const current = this.db.reviews.get(slug) || [];
    const newReview: ReviewEntity = {
      id: `${slug}-review-${Date.now()}`,
      phoneId: slug,
      userName: author,
      rating: rating,
      comment: comment,
      createdAt: new Date().toISOString()
    };

    const updated = [newReview, ...current];
    this.db.reviews.set(slug, updated);
    return updated;
  }
}
