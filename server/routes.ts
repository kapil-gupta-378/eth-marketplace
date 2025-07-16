import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWalletSchema, insertOfferSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get marketplace stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getMarketplaceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch marketplace stats" });
    }
  });

  // Get all wallets with filtering and pagination
  app.get("/api/wallets", async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        minEth = 0, 
        assetType = "", 
        sortBy = "totalValueUsd",
        sortOrder = "desc"
      } = req.query;

      const filters = {
        search: search as string,
        minEth: parseFloat(minEth as string) || 0,
        assetType: assetType as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      };

      const wallets = await storage.getWallets(
        parseInt(page as string),
        parseInt(limit as string),
        filters
      );

      const totalCount = await storage.getWalletsCount(filters);

      res.json({
        wallets,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  // Connect wallet
  app.post("/api/wallets/connect", async (req, res) => {
    try {
      const walletData = insertWalletSchema.parse(req.body);
      
      // Check if wallet already exists
      const existingWallet = await storage.getWalletByAddress(walletData.address);
      
      if (existingWallet) {
        // Update existing wallet with new asset data
        const updatedWallet = await storage.updateWalletAssets(existingWallet.id, {
          ethBalance: walletData.ethBalance,
          stethBalance: walletData.stethBalance,
          rethBalance: walletData.rethBalance,
          cbethBalance: walletData.cbethBalance,
          lrtBalances: walletData.lrtBalances,
          totalValueUsd: walletData.totalValueUsd,
        });
        res.json(updatedWallet);
      } else {
        // Create new wallet with real-time asset data
        const wallet = await storage.connectWallet(walletData);
        res.json(wallet);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid wallet data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to connect wallet" });
      }
    }
  });

  // Update wallet assets
  app.put("/api/wallets/:id/assets", async (req, res) => {
    try {
      const walletId = parseInt(req.params.id);
      const { ethBalance, stethBalance, rethBalance, cbethBalance, lrtBalances, totalValueUsd } = req.body;
      
      const wallet = await storage.updateWalletAssets(walletId, {
        ethBalance,
        stethBalance,
        rethBalance,
        cbethBalance,
        lrtBalances,
        totalValueUsd
      });
      
      res.json(wallet);
    } catch (error) {
      console.error("Error updating wallet assets:", error);
      res.status(500).json({ error: "Failed to update wallet assets" });
    }
  });

  // Get offers for a wallet
  app.get("/api/wallets/:id/offers", async (req, res) => {
    try {
      const walletId = parseInt(req.params.id);
      const offers = await storage.getOffersByWallet(walletId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  // Create new offer
  app.post("/api/offers", async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      res.json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid offer data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create offer" });
      }
    }
  });

  // Accept offer
  app.post("/api/offers/:id/accept", async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const offer = await storage.acceptOffer(offerId);
      res.json(offer);
    } catch (error) {
      console.error("Error accepting offer:", error);
      res.status(500).json({ error: "Failed to accept offer" });
    }
  });

  // Get messages for an offer
  app.get("/api/offers/:id/messages", async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const messages = await storage.getMessagesByOffer(offerId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  // Get recent activity
  app.get("/api/activity", async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  // Get top offers
  app.get("/api/offers/top", async (req, res) => {
    try {
      const offers = await storage.getTopOffers();
      res.json(offers);
    } catch (error) {
      console.error("Error fetching top offers:", error);
      res.status(500).json({ error: "Failed to fetch top offers" });
    }
  });



  // Download project files
  app.get("/download", (req, res) => {
    const filePath = path.join(process.cwd(), "web3-marketplace-project.tar.gz");
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, "web3-marketplace-project.tar.gz", (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send("Error downloading file");
        }
      });
    } else {
      res.status(404).send("Project file not found");
    }
  });

  // Download page
  app.get("/download-page", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Download Web3 Marketplace Project</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            background: #0a0a0a;
            color: #ffffff;
            line-height: 1.6;
          }
          .container {
            background: #1a1a1a;
            padding: 40px;
            border-radius: 12px;
            border: 1px solid #333;
          }
          .download-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            display: inline-block;
            margin: 24px 0;
            transition: transform 0.2s;
          }
          .download-btn:hover {
            transform: translateY(-2px);
          }
          .info {
            background: #2a2a2a;
            padding: 24px;
            border-radius: 8px;
            margin: 24px 0;
            border-left: 4px solid #667eea;
          }
          .code {
            background: #1a1a1a;
            padding: 12px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            border: 1px solid #333;
            color: #a0a0a0;
          }
          h1 { color: #667eea; }
          h3 { color: #ffffff; margin-top: 0; }
          ul li { margin: 8px 0; }
          ol li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Web3 Marketplace Project Download</h1>
          <p>Your complete Web3 liquidity marketplace is ready for download!</p>
          
          <a href="/download" class="download-btn">📥 Download Project (123 KB)</a>
          
          <div class="info">
            <h3>📦 What's included:</h3>
            <ul>
              <li>✅ Complete React frontend with modern UI</li>
              <li>✅ Express.js backend with PostgreSQL</li>
              <li>✅ MetaMask wallet connection</li>
              <li>✅ Real-time blockchain asset fetching</li>
              <li>✅ Marketplace with offer system</li>
              <li>✅ Database schema and migrations</li>
              <li>✅ All configuration files</li>
            </ul>
          </div>
          
          <div class="info">
            <h3>🛠️ Setup Instructions:</h3>
            <ol>
              <li>Extract the downloaded file: <div class="code">tar -xzf web3-marketplace-project.tar.gz</div></li>
              <li>Install dependencies: <div class="code">npm install</div></li>
              <li>Set up PostgreSQL database</li>
              <li>Configure environment variables in <code>.env</code></li>
              <li>Run database migrations: <div class="code">npm run db:push</div></li>
              <li>Start the application: <div class="code">npm run dev</div></li>
            </ol>
          </div>

          <div class="info">
            <h3>🔧 Required Environment Variables:</h3>
            <div class="code">
              DATABASE_URL=postgresql://username:password@localhost:5432/web3_marketplace
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  const httpServer = createServer(app);

  return httpServer;
}
