import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Mail, 
  Send, 
  User, 
  Wallet 
} from "lucide-react";
import { Wallet as WalletType } from "@/types/wallet";

interface MarketplaceTableProps {
  onSendOffer: (walletAddress: string) => void;
}

interface WalletFilters {
  search: string;
  minEth: number;
  assetType: string;
  sortBy: string;
  sortOrder: string;
}

export default function MarketplaceTable({ onSendOffer }: MarketplaceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<WalletFilters>({
    search: "",
    minEth: 0,
    assetType: "",
    sortBy: "totalValueUsd",
    sortOrder: "desc"
  });

  const { data: walletsData, isLoading } = useQuery({
    queryKey: ["/api/wallets", currentPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: filters.search,
        minEth: filters.minEth.toString(),
        assetType: filters.assetType,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      const response = await fetch(`/api/wallets?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch wallets");
      }
      return response.json();
    },
  });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const formatEth = (value: string) => {
    return parseFloat(value).toFixed(2);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now.getTime() - past.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Active now";
    if (hours < 24) return `Active ${hours}h ago`;
    return `Active ${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const wallets = walletsData?.wallets || [];
  const pagination = walletsData?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet & Status</TableHead>
                  <TableHead>Assets & Value</TableHead>
                  <TableHead>Preferences</TableHead>
                  <TableHead>Offers Received</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet: WalletType) => (
                  <TableRow key={wallet.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-mono">
                              {truncateAddress(wallet.address)}
                            </code>
                            {wallet.isVerified && (
                              <Badge variant="secondary" className="bg-accent text-white">
                                Verified
                              </Badge>
                            )}
                            {wallet.badges && wallet.badges.length > 0 && (
                              <Badge variant="outline" className="bg-warning text-white">
                                🏆 Top Holder
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {getTimeSince(wallet.lastActive)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {formatEth(wallet.ethBalance)} ETH
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({formatCurrency((parseFloat(wallet.ethBalance) * 1958).toString())})
                          </span>
                        </div>
                        {parseFloat(wallet.stethBalance) > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">
                              {formatEth(wallet.stethBalance)} stETH
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({formatCurrency((parseFloat(wallet.stethBalance) * 1958).toString())})
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {parseFloat(wallet.rethBalance) > 0 && (
                            <Badge variant="outline" className="text-xs">rETH</Badge>
                          )}
                          {parseFloat(wallet.cbethBalance) > 0 && (
                            <Badge variant="outline" className="text-xs">cbETH</Badge>
                          )}
                          {wallet.lrtBalances && Object.keys(wallet.lrtBalances).length > 0 && (
                            <Badge variant="outline" className="text-xs">LRTs</Badge>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-accent">
                          Total: {formatCurrency(wallet.totalValueUsd)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {wallet.preferences && wallet.preferences.activities?.map((activity: string) => (
                            <Badge key={activity} variant="secondary" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(wallet.availableCapitalMin)} - {formatCurrency(wallet.availableCapitalMax)} available
                        </div>
                        {wallet.emailAlertsEnabled && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-accent" />
                            <span className="text-xs text-muted-foreground">
                              Email alerts enabled
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-primary text-white">
                            {wallet.offersReceived?.length || 0}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Active Offers</span>
                        </div>
                        <div className="space-y-1">
                          {wallet.offersReceived?.slice(0, 3).map((offer: any) => (
                            <div key={offer.id} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-accent rounded-full" />
                              <span className="text-xs text-muted-foreground">
                                {offer.title}
                              </span>
                            </div>
                          ))}
                        </div>
                        {wallet.offersReceived && wallet.offersReceived.length > 3 && (
                          <button className="text-xs text-primary hover:underline">
                            View all offers →
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={() => onSendOffer(wallet.address)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send Offer
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <User className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{(pagination.page - 1) * 10 + 1}</span> to{" "}
          <span className="font-medium">{Math.min(pagination.page * 10, pagination.total)}</span> of{" "}
          <span className="font-medium">{pagination.total}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
            disabled={currentPage === pagination.pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
