export interface Wallet {
  id: number;
  address: string;
  ethBalance: string;
  stethBalance: string;
  rethBalance: string;
  cbethBalance: string;
  lrtBalances: Record<string, string>;
  totalValueUsd: string;
  preferences: {
    activities?: string[];
    region?: string;
  };
  availableCapitalMin: string;
  availableCapitalMax: string;
  emailAlertsEnabled: boolean;
  email?: string;
  isVerified: boolean;
  badges: string[];
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  offersReceived?: Offer[];
}

export interface Offer {
  id: number;
  targetWalletId: number;
  fromWalletId?: number;
  fromAnonymousTag?: string;
  title: string;
  description: string;
  offerType: 'cash' | 'tokens' | 'nft' | 'irl' | 'other';
  category: 'defi' | 'nft' | 'irl' | 'other';
  rewardValue?: string;
  expiryDate?: string;
  isActive: boolean;
  isAccepted: boolean;
  acceptedAt?: string;
  contactInfo?: string;
  termsLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletFilters {
  search: string;
  minEth: number;
  assetType: string;
  sortBy: string;
  sortOrder: string;
}
