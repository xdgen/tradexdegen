import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { Config } from 'wagmi';

const config: Config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, 
});

export default config;