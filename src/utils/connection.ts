import { Connection } from "@solana/web3.js";

const network = "https://devnet.helius-rpc.com/?api-key=38caa145-8a0a-4499-a141-be31c8f4c784";

// Current index to track which connection to return
let currentIndex = 0

// Load RPC URLs from environment variables
const SOLANA_RPC_URL_ARRAY: string[] = import.meta.env.VITE_SOLANA_RPC_URL_ARRAY
  ? import.meta.env.VITE_SOLANA_RPC_URL_ARRAY.split(',').map((url: string) => url.trim())
  : [network]

// if (SOLANA_RPC_URL_ARRAY.length === 0) {
//   throw new Error('SOLANA_RPC_URL_ARRAY must not be empty.')
// }
if (!import.meta.env.VITE_SOLANA_RPC_URL_ARRAY || SOLANA_RPC_URL_ARRAY.length === 0){
    console.warn("Bro add RPCs to env file,and use comma < , > to separate them ")
    console.log("Example: SOLANA_RPC_URL_ARRAY=https://rpc...,https://rpc... ")
  }


// Shared connection pool (initialize it once)
const connectionPool: { rpcUrl: string; connection: Connection }[] =
  SOLANA_RPC_URL_ARRAY.map((rpcUrl) => ({
    rpcUrl,
    connection: new Connection(rpcUrl.trim(), {
      commitment: 'confirmed',
    }), // Create a new connection for each RPC URL
  }))

  export const getNextConnection = (): Connection => {
    if (connectionPool.length === 0) {
      throw new Error(
        'Connection pool is empty. Ensure SOLANA_RPC_URL_ARRAY is configured.'
      )
    }
  
    // Get the current connection from the pool
    const connection = connectionPool[currentIndex].connection
  
    // Update the index to the next connection (circular rotation)
    currentIndex = (currentIndex + 1) % connectionPool.length
  
    console.log(
      `Returning connection for RPC URL: ${connectionPool[currentIndex].rpcUrl}`
    )
    return connection
  }