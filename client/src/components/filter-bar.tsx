import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

export default function FilterBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minEth, setMinEth] = useState("");
  const [assetType, setAssetType] = useState("");
  const [sortBy, setSortBy] = useState("totalValueUsd");

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by wallet address, ETH balance, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={minEth} onValueChange={setMinEth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Min ETH Balance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Balances</SelectItem>
                <SelectItem value="1">1+ ETH</SelectItem>
                <SelectItem value="10">10+ ETH</SelectItem>
                <SelectItem value="100">100+ ETH</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assets</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="stETH">stETH</SelectItem>
                <SelectItem value="rETH">rETH</SelectItem>
                <SelectItem value="LRTs">LRTs</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalValueUsd">Most ETH</SelectItem>
                <SelectItem value="lastActive">Recent Activity</SelectItem>
                <SelectItem value="offersCount">Most Offers</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-1" />
              More Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
