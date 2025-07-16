import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import WalletConnection from "@/components/wallet-connection";
import MarketplaceTable from "@/components/marketplace-table";
import FilterBar from "@/components/filter-bar";
import StatsBar from "@/components/stats-bar";
import OfferModal from "@/components/offer-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Plus, Clock, TrendingUp } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

interface MarketplaceStats {
  totalWallets: number;
  totalValueUsd: string;
  activeOffers: number;
  dealsClosed: number;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  walletAddress?: string;
}

interface TopOffer {
  id: number;
  title: string;
  fromTag: string;
  category: string;
  rewardValue: string;
}

export default function Home() {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minEth, setMinEth] = useState("");
  const [assetType, setAssetType] = useState("");
  const [sortBy, setSortBy] = useState("totalValueUsd");
  const { isConnected, address, connect, disconnect, balance } = useWallet();
  console.log(isConnected, address, balance, "balance");

  const { data: stats } = useQuery<MarketplaceStats>({
    queryKey: ["/api/stats"],
  });

  const { data: activity } = useQuery<Activity[]>({
    queryKey: ["/api/activity"],
  });

  const { data: topOffers } = useQuery<TopOffer[]>({
    queryKey: ["/api/offers/top"],
  });

  const handleSendOffer = (walletAddress: string) => {
    setSelectedWallet(walletAddress);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold">ETH Liquidity Marketplace</h1>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:block">
                Connect your wallet. Receive bribes, deals & yield offers
                directly.
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnection />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          minEth={minEth}
          setMinEth={setMinEth}
          assetType={assetType}
          setAssetType={setAssetType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Marketplace Table */}
        <MarketplaceTable
          onSendOffer={handleSendOffer}
          searchTerm={searchTerm}
          minEth={minEth}
          assetType={assetType}
          sortBy={sortBy}
        />

        {/* Recent Activity & Top Offers */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {activity?.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <div className="flex-1">
                      <div className="text-sm">{item.description}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-sm text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Top Offers This Week
              </h3>
              <div className="space-y-4">
                {topOffers?.slice(0, 3).map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium">{offer.title}</div>
                      <div className="text-xs text-muted-foreground">
                        From: {offer.fromTag}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  </div>
                )) || (
                  <div className="text-sm text-muted-foreground">
                    No top offers available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coins className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">ETH Liquidity</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The premier marketplace for ETH holders and liquidity seekers to
                connect and transact.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Fees
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ETH Liquidity Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        targetWallet={selectedWallet}
      />
    </div>
  );
}
