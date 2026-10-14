import { RelationalDatabase } from "../../db/database";
import { BrandEntity } from "../../db/schema";

export class BrandRepository {
  private db = RelationalDatabase.getInstance();

  /**
   * Fetch complete array of registered manufacturer entities
   */
  public listAll(): BrandEntity[] {
    return Array.from(this.db.brands.values());
  }

  /**
   * Quick key-lookup for manufacturer attributes
   */
  public getById(id: string): BrandEntity | null {
    const key = id.toLowerCase().trim();
    return this.db.brands.get(key) || null;
  }

  /**
   * Upsert or create brand models (e.g. dynamically mapping incoming GSMArena specs)
   */
  public save(brand: BrandEntity): BrandEntity {
    const key = brand.id.toLowerCase().trim();
    this.db.brands.set(key, brand);
    return brand;
  }
}
