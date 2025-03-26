import { ConnectButton } from '@rainbow-me/rainbowkit';

const projectId = import.meta.env.VITE_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("Project Id is not defined.");
}

// metadata for the app
const metadata = {
  name: 'Xdegen',
  description: 'Master crypto trading with confidence',
  url: 'https://xdegen.xyz',
  icons: ['https://imgur.com/a/oktpbml']
};

const AppKit: React.FC<{ children?: React.ReactNode }> = ({}) => {
  return (
    <ConnectButton />
  );
};

export default AppKit;
