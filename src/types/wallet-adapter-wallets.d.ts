declare module '@solana/wallet-adapter-wallets' {
    import { WalletAdapter } from '@solana/wallet-adapter-base';
  
    export class PhantomWalletAdapter extends WalletAdapter {}
    export class SolflareWalletAdapter extends WalletAdapter {}
    // Add other wallet adapters as needed
  }