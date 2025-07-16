import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  connectWallet as connectWeb3Wallet,
  getWalletBalance,
  getAssetBalances,
  calculateTotalValueUsd,
} from "@/lib/web3";

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          // Get MetaMask provider specifically
          let ethereum = window.ethereum;
          if (window.ethereum?.providers?.length > 0) {
            ethereum = window.ethereum.providers.find(
              (provider: any) => provider.isMetaMask
            );
          }

          if (ethereum && ethereum.isMetaMask) {
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
              setIsConnected(true);
              setAddress(accounts[0]);
              const walletBalance = await getWalletBalance(accounts[0]);
              setBalance(walletBalance);
            }
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      // Get MetaMask provider specifically
      let ethereum = window.ethereum;
      if (window.ethereum?.providers?.length > 0) {
        ethereum = window.ethereum.providers.find(
          (provider: any) => provider.isMetaMask
        );
      }

      if (ethereum && ethereum.isMetaMask) {
        ethereum.on("accountsChanged", (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          } else {
            setAddress(null);
            setIsConnected(false);
          }
        });
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        // Get MetaMask provider specifically
        let ethereum = window.ethereum;
        if (window.ethereum?.providers?.length > 0) {
          ethereum = window.ethereum.providers.find(
            (provider: any) => provider.isMetaMask
          );
        }

        if (ethereum && ethereum.isMetaMask) {
          ethereum.removeAllListeners("accountsChanged");
        }
      }
    };
  }, []);

  const connectWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      // Fetch real-time asset balances
      const assetBalances = await getAssetBalances(walletAddress);

      // Calculate total USD value
      const totalValueUsd = await calculateTotalValueUsd(assetBalances);

      const walletData = {
        address: walletAddress,
        ethBalance: assetBalances.eth,
        stethBalance: assetBalances.steth,
        rethBalance: assetBalances.reth,
        cbethBalance: assetBalances.cbeth,
        lrtBalances: assetBalances.lrtBalances,
        totalValueUsd,
        preferences: {},
        availableCapitalMin: "0",
        availableCapitalMax: "0",
        emailAlertsEnabled: false,
        isVerified: false,
        badges: [],
      };

      return apiRequest("POST", "/api/wallets/connect", walletData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const connect = async () => {
    try {
      debugger;
      const walletAddress = await connectWeb3Wallet();
      setAddress(walletAddress);
      setIsConnected(true);

      const walletBalance = await getWalletBalance(walletAddress);

      setBalance(walletBalance);

      // Register wallet in database
      await connectWalletMutation.mutateAsync(walletAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance("0");
  };

  return {
    isConnected,
    address,
    balance,
    connect,
    disconnect,
  };
}
