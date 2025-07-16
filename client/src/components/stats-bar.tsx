import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketplaceStats {
  totalWallets: number;
  totalValueUsd: string;
  activeOffers: number;
  dealsClosed: number;
}

interface StatsBarProps {
  stats?: MarketplaceStats;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (!stats) {
    return (
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {formatNumber(stats.totalWallets)}
            </div>
            <div className="text-sm text-muted-foreground">Connected Wallets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalValueUsd)}
            </div>
            <div className="text-sm text-muted-foreground">Total ETH Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {formatNumber(stats.activeOffers)}
            </div>
            <div className="text-sm text-muted-foreground">Active Offers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {formatNumber(stats.dealsClosed)}
            </div>
            <div className="text-sm text-muted-foreground">Deals Closed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
