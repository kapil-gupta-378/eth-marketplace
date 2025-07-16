import { db } from "./db";
import { wallets, offers, marketplaceStats } from "@shared/schema";

export async function initializeDatabase() {
  try {
    // Check if we already have data
    const existingWallets = await db.select().from(wallets).limit(1);
    if (existingWallets.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }

    // Create sample wallets
    const sampleWallets = [
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        ethBalance: "25.5",
        stethBalance: "12.3",
        rethBalance: "8.7",
        cbethBalance: "5.2",
        lrtBalances: { ezeth: "3.4", rseth: "2.1" },
        totalValueUsd: "108643.50",
        preferences: { activities: ["staking", "lending"] },
        availableCapitalMin: "5000",
        availableCapitalMax: "50000",
        emailAlertsEnabled: true,
        isVerified: true,
        badges: ["top-holder"]
      },
      {
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        ethBalance: "45.2",
        stethBalance: "23.1",
        rethBalance: "15.6",
        cbethBalance: "8.9",
        lrtBalances: { ezeth: "6.7", rseth: "4.3" },
        totalValueUsd: "196874.20",
        preferences: { activities: ["defi", "yield-farming"] },
        availableCapitalMin: "10000",
        availableCapitalMax: "100000",
        emailAlertsEnabled: true,
        isVerified: true,
        badges: ["verified", "whale"]
      },
      {
        address: "0x9876543210fedcba9876543210fedcba98765432",
        ethBalance: "12.8",
        stethBalance: "6.4",
        rethBalance: "3.2",
        cbethBalance: "1.8",
        lrtBalances: { ezeth: "1.2", rseth: "0.8" },
        totalValueUsd: "51203.60",
        preferences: { activities: ["nft", "gaming"] },
        availableCapitalMin: "2000",
        availableCapitalMax: "25000",
        emailAlertsEnabled: false,
        isVerified: false,
        badges: []
      }
    ];

    const insertedWallets = await db.insert(wallets).values(sampleWallets).returning();
    console.log(`Inserted ${insertedWallets.length} sample wallets`);

    // Create sample offers
    const sampleOffers = [
      {
        targetWalletId: insertedWallets[0].id,
        fromAnonymousTag: "Protocol Alpha",
        title: "Stake 10 ETH for 30 days - Get $500 bonus",
        description: "We're looking for ETH holders to stake with our protocol for 30 days. Earn our governance token plus a $500 USDC bonus.",
        offerType: "cash" as const,
        category: "defi" as const,
        rewardValue: "500",
        contactInfo: "alpha@protocol.com"
      },
      {
        targetWalletId: insertedWallets[1].id,
        fromAnonymousTag: "Yield Farm Beta",
        title: "Provide LP tokens - Earn 15% APY",
        description: "Join our liquidity pool and earn high yield on your ETH. Limited time offer with bonus rewards.",
        offerType: "tokens" as const,
        category: "defi" as const,
        rewardValue: "1200",
        contactInfo: "beta@yieldfarm.com"
      }
    ];

    const insertedOffers = await db.insert(offers).values(sampleOffers).returning();
    console.log(`Inserted ${insertedOffers.length} sample offers`);

    // Initialize marketplace stats
    const stats = {
      totalWallets: insertedWallets.length,
      totalValueUsd: "356721.30",
      activeOffers: insertedOffers.length,
      dealsClosed: 0
    };

    await db.insert(marketplaceStats).values(stats);
    console.log("Initialized marketplace stats");

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}