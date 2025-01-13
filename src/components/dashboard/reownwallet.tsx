import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// 0. Set up Solana Adapter
// const solanaWeb3JsAdapter = new SolanaAdapter({
//   wallets: [
//     new PhantomWalletAdapter(),
//     new SolflareWalletAdapter()
//   ]
// })

const projectId = import.meta.env.VITE_PUBLIC_PROJECT_ID;

// 2. Create a metadata object - optional
const metadata = {
  name: 'Xdegen',
  description: 'Master crypto trading with confidence',
  url: 'https://xdegen.xyz', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Create modal
createAppKit({
  adapters: [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new SolanaAdapter()],
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata: metadata,
  projectId: projectId as string,
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  themeMode: 'dark',
})

const AppKit = () => {
  return (
    <div>
      <appkit-button />
    </div>
  );
};
export default AppKit;
