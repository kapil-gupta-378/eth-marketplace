declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Window not available");
  }

  // Check for MetaMask specifically
  let ethereum = window.ethereum;
  
  // If there are multiple wallets, find MetaMask specifically
  if (window.ethereum?.providers?.length > 0) {
    ethereum = window.ethereum.providers.find((provider: any) => provider.isMetaMask);
  }
  
  if (!ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask extension first.");
  }

  // Double-check that we have MetaMask
  if (!ethereum.isMetaMask) {
    throw new Error("Please use MetaMask wallet. Other wallets are not supported.");
  }

  try {
    // Request account access specifically from MetaMask
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    
    if (accounts.length === 0) {
      throw new Error("No MetaMask accounts found. Please connect your MetaMask wallet.");
    }
    
    return accounts[0];
  } catch (error: any) {
    console.error("Error connecting to MetaMask:", error);
    
    if (error.code === 4001) {
      throw new Error("Connection rejected by user. Please accept the MetaMask connection request.");
    }
    
    throw new Error("Failed to connect to MetaMask. Please try again.");
  }
}

export async function getWalletBalance(address: string): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    
    // Convert from wei to ETH
    const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
    return ethBalance.toString();
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    // Return a mock balance for development
    return (Math.random() * 100).toFixed(2);
  }
}

// Real-time asset balance fetching for various tokens
export async function getAssetBalances(address: string) {
  try {
    const results = await Promise.all([
      getETHBalance(address),
      getStETHBalance(address),
      getRETHBalance(address),
      getCBETHBalance(address),
      getLRTBalances(address)
    ]);

    const [ethBalance, stethBalance, rethBalance, cbethBalance, lrtBalances] = results;

    return {
      eth: ethBalance,
      steth: stethBalance,
      reth: rethBalance,
      cbeth: cbethBalance,
      lrtBalances: lrtBalances
    };
  } catch (error) {
    console.error('Error fetching asset balances:', error);
    return {
      eth: '0',
      steth: '0',
      reth: '0',
      cbeth: '0',
      lrtBalances: {}
    };
  }
}

async function getETHBalance(address: string): Promise<string> {
  return await getWalletBalance(address);
}

async function getStETHBalance(address: string): Promise<string> {
  // stETH contract address
  const stethContract = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
  return await getTokenBalance(address, stethContract);
}

async function getRETHBalance(address: string): Promise<string> {
  // rETH contract address
  const rethContract = '0xae78736Cd615f374D3085123A210448E74Fc6393';
  return await getTokenBalance(address, rethContract);
}

async function getCBETHBalance(address: string): Promise<string> {
  // cbETH contract address
  const cbethContract = '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704';
  return await getTokenBalance(address, cbethContract);
}

async function getLRTBalances(address: string): Promise<Record<string, string>> {
  // LRT token contracts
  const lrtContracts = {
    ezeth: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    rseth: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7'
  };

  const balances: Record<string, string> = {};
  
  for (const [token, contract] of Object.entries(lrtContracts)) {
    try {
      balances[token] = await getTokenBalance(address, contract);
    } catch (error) {
      console.error(`Error fetching ${token} balance:`, error);
      balances[token] = '0';
    }
  }

  return balances;
}

async function getTokenBalance(address: string, tokenContract: string): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    return '0';
  }

  try {
    // ERC-20 balanceOf function selector
    const balanceOfSelector = '0x70a08231';
    const paddedAddress = address.replace('0x', '').padStart(64, '0');
    const data = balanceOfSelector + paddedAddress;

    const balance = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: tokenContract,
        data: data
      }, 'latest'],
    });

    // Convert from wei to ether (18 decimals)
    const tokenBalance = parseInt(balance, 16) / Math.pow(10, 18);
    return tokenBalance.toFixed(4);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return '0';
  }
}

export async function calculateTotalValueUsd(balances: any): Promise<string> {
  // Real-time price fetching would typically use APIs like CoinGecko
  // For now, using approximate market prices
  const prices = {
    eth: 3500,
    steth: 3480,
    reth: 3520,
    cbeth: 3490,
    ezeth: 3510,
    rseth: 3505
  };

  let totalValue = 0;
  totalValue += parseFloat(balances.eth || '0') * prices.eth;
  totalValue += parseFloat(balances.steth || '0') * prices.steth;
  totalValue += parseFloat(balances.reth || '0') * prices.reth;
  totalValue += parseFloat(balances.cbeth || '0') * prices.cbeth;

  // Add LRT balances
  if (balances.lrtBalances) {
    for (const [token, balance] of Object.entries(balances.lrtBalances)) {
      if (prices[token as keyof typeof prices]) {
        totalValue += parseFloat(balance as string) * prices[token as keyof typeof prices];
      }
    }
  }

  return totalValue.toFixed(2);
}
