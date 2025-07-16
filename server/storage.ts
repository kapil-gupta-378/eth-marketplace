import { 
  users, 
  wallets, 
  offers, 
  messages, 
  marketplaceStats,
  type User, 
  type InsertUser,
  type Wallet,
  type InsertWallet,
  type Offer,
  type InsertOffer,
  type Message,
  type InsertMessage,
  type MarketplaceStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, ilike, gte, sql, and, or } from "drizzle-orm";

interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  getWallets(page: number, limit: number, filters: any): Promise<Wallet[]>;
  getWalletsCount(filters: any): Promise<number>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  connectWallet(walletData: InsertWallet): Promise<Wallet>;
  updateWalletAssets(walletId: number, assets: any): Promise<Wallet>;
  
  getOffersByWallet(walletId: number): Promise<Offer[]>;
  createOffer(offerData: InsertOffer): Promise<Offer>;
  acceptOffer(offerId: number): Promise<Offer>;
  getTopOffers(): Promise<Offer[]>;
  
  getMessagesByOffer(offerId: number): Promise<Message[]>;
  createMessage(messageData: InsertMessage): Promise<Message>;
  
  getMarketplaceStats(): Promise<MarketplaceStats>;
  getRecentActivity(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getWallets(page: number, limit: number, filters: any): Promise<Wallet[]> {
    let baseQuery = db.select().from(wallets);
    
    const conditions = [];
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(wallets.address, `%${filters.search}%`),
          sql`${wallets.preferences}::text ILIKE ${`%${filters.search}%`}`
        )
      );
    }
    
    if (filters.minEth > 0) {
      conditions.push(gte(wallets.ethBalance, filters.minEth.toString()));
    }
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    // Apply sorting
    if (filters.sortBy === "totalValueUsd") {
      if (filters.sortOrder === "asc") {
        baseQuery = baseQuery.orderBy(asc(wallets.totalValueUsd));
      } else {
        baseQuery = baseQuery.orderBy(desc(wallets.totalValueUsd));
      }
    } else if (filters.sortBy === "lastActive") {
      baseQuery = baseQuery.orderBy(desc(wallets.lastActive));
    }
    
    const result = await baseQuery.limit(limit).offset((page - 1) * limit);
    return result;
  }

  async getWalletsCount(filters: any): Promise<number> {
    let baseQuery = db.select({ count: sql<number>`count(*)` }).from(wallets);
    
    const conditions = [];
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(wallets.address, `%${filters.search}%`),
          sql`${wallets.preferences}::text ILIKE ${`%${filters.search}%`}`
        )
      );
    }
    
    if (filters.minEth > 0) {
      conditions.push(gte(wallets.ethBalance, filters.minEth.toString()));
    }
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    const result = await baseQuery;
    return result[0]?.count || 0;
  }

  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address));
    return wallet || undefined;
  }

  async connectWallet(walletData: InsertWallet): Promise<Wallet> {
    // Check if wallet already exists
    const existingWallet = await db
      .select()
      .from(wallets)
      .where(eq(wallets.address, walletData.address))
      .limit(1);
    
    if (existingWallet.length > 0) {
      // Update existing wallet
      const [updated] = await db
        .update(wallets)
        .set({ ...walletData, updatedAt: new Date() })
        .where(eq(wallets.id, existingWallet[0].id))
        .returning();
      return updated;
    }
    
    // Create new wallet
    const [wallet] = await db
      .insert(wallets)
      .values(walletData)
      .returning();
    return wallet;
  }

  async updateWalletAssets(walletId: number, assets: any): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ 
        ...assets, 
        updatedAt: new Date(),
        lastActive: new Date()
      })
      .where(eq(wallets.id, walletId))
      .returning();
    return wallet;
  }

  async getOffersByWallet(walletId: number): Promise<Offer[]> {
    const result = await db
      .select()
      .from(offers)
      .where(eq(offers.targetWalletId, walletId))
      .orderBy(desc(offers.createdAt));
    return result;
  }

  async createOffer(offerData: InsertOffer): Promise<Offer> {
    const [offer] = await db
      .insert(offers)
      .values(offerData)
      .returning();
    return offer;
  }

  async acceptOffer(offerId: number): Promise<Offer> {
    const [offer] = await db
      .update(offers)
      .set({ 
        isAccepted: true, 
        acceptedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(offers.id, offerId))
      .returning();
    return offer;
  }

  async getTopOffers(): Promise<Offer[]> {
    const result = await db
      .select()
      .from(offers)
      .where(eq(offers.isActive, true))
      .orderBy(desc(offers.createdAt))
      .limit(10);
    return result;
  }

  async getMessagesByOffer(offerId: number): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.offerId, offerId))
      .orderBy(asc(messages.createdAt));
    return result;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async getMarketplaceStats(): Promise<MarketplaceStats> {
    // Get or create stats
    const existingStats = await db
      .select()
      .from(marketplaceStats)
      .limit(1);
    
    if (existingStats.length === 0) {
      // Create initial stats
      const [stats] = await db
        .insert(marketplaceStats)
        .values({
          totalWallets: 0,
          totalValueUsd: "0",
          activeOffers: 0,
          dealsClosed: 0
        })
        .returning();
      return stats;
    }
    
    return existingStats[0];
  }

  async getRecentActivity(): Promise<any[]> {
    // Get recent offers as activity
    const recentOffers = await db
      .select({
        id: offers.id,
        type: sql<string>`'offer'`,
        description: sql<string>`'New offer: ' || ${offers.title}`,
        timestamp: offers.createdAt,
        walletAddress: sql<string>`null`
      })
      .from(offers)
      .orderBy(desc(offers.createdAt))
      .limit(10);
    
    return recentOffers.map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));
  }
}

export const storage = new DatabaseStorage();