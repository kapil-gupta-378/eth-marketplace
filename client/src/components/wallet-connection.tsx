import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { Wallet } from "lucide-react";

export default function WalletConnection() {
  const { isConnected, address, connect, disconnect } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
      toast({
        title: "MetaMask Connected",
        description: "Successfully connected to MetaMask and saved wallet data with real-time asset balances",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from your wallet",
    });
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm">
          <code className="text-muted-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </code>
        </div>
        <Button 
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary hover:bg-primary/90"
    >
      <Wallet className="h-4 w-4 mr-2" />
{isConnecting ? "Connecting to MetaMask..." : "Connect MetaMask"}
    </Button>
  );
}
