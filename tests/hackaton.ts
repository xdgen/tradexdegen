// import bs58 from 'bs58'; // You might need to install this if the key is base58 encoded
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
// import { Token, TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

import {
  // Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { Hackaton } from "../target/types/hackaton";

describe("usdt_sol_swap", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Hackaton as Program<Hackaton>;

  // Define accounts needed for the tests
  let admin: anchor.web3.Keypair;
  let users: anchor.web3.Keypair;
 
  let programUsdtVault: PublicKey;
  let programSolVault: anchor.web3.PublicKey;
  let oraclePriceFeed: anchor.web3.PublicKey; // Set this to the actual oracle price feed address
  let userKeypair: any;
  let adminKeypair: anchor.web3.Keypair;
  let icoMint: PublicKey;
  let icoAtaForAdmin: PublicKey;
  let icoAtaForIcoProgram: PublicKey;
  let _bump: any;
  let adminPrivateKey: any;
  let userPrivateKey: any;
  let adminPublicKey: any;
  let userPublicKey: any;
  let tokenAccount: PublicKey;
  let admintokenAccount: PublicKey;
  let vaultAccountProgram: any;
  let vaultBump: any;

  const SOL_USDC_FEED = new PublicKey(
    "EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw"
  );
  const CUSTOM_USDT_MINT = new PublicKey(
    "8rRGXfEfawfkzdTg9QVJpDuKBhBF1Ab3gzRt3tMsTSTK"
  );

  before(async () => {
    // Initialize the accounts and mint tokens as needed
    admin = anchor.web3.Keypair.generate();
    users = anchor.web3.Keypair.generate();
    icoMint = new PublicKey(CUSTOM_USDT_MINT);
    // admin = user;
    userSolAccount = anchor.web3.Keypair.generate();
    userUsdtAccount = anchor.web3.Keypair.generate();
    // programUsdtVault = new anchor.web3.PublicKey("2MjB1se3u6Vvn6uwjJaCvmpiZFcM8feeiZRYDGKPU9JC"); // Example price feed
    programUsdtVault = new anchor.web3.PublicKey(
      "FpBwH9XTC3K4Z1asaTFhC9nqVDQhjFAvzTaXfaH4eJDV"
    ); // Associated token account address for USDT
    console.log("🚀 ~ before ~ programUsdtVault:", programUsdtVault);
    programSolVault = new anchor.web3.PublicKey(
      "AJxJbLuKuXp9uTgKfmxtntRexXRcQwKRis9q8w3tWGKp"
    );
    console.log("🚀 ~ before ~ programSolVault:", programSolVault);
    // Token-Program-ID          8kGhgEqhgtEDJwnBpPUUFX8BV3d8GrLZ6jfHkEwGeRmW
    // usdt-vault 2MjB1se3u6Vvn6uwjJaCvmpiZFcM8feeiZRYDGKPU9JC
    // sol-vault AJxJbLuKuXp9uTgKfmxtntRexXRcQwKRis9q8w3tWGKp

    // adminPublicKey = 'AXpiGXaNqNgjRGKgYExZk9Ye3xo2EwVABhMFzcQGbCvf';
    admintokenAccount = new PublicKey(
      "CfCBmfx7HeBuj1H3RixWKJAcmpzKEsuMh9gX5CYJuN8H"
    );

    tokenAccount = new PublicKey(
      "EdLWMKnzUa2nrkyfAuuT3Vv3kdWosC7KZRFCifnKotmF"
    );
    userPrivateKey =
      "2FbWj5unRi86bzkSee4asRwzkf7XeTbKWsahGZLx3VaAEmDp6D3LBkAJ12ZWJCywhPPnPrrTvD31jy8WnAn52UAj";
    // Example: assuming your private key is in base58 format, as Solana keys often are
    const adminPrivateKeyBase58 =
      "4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM";
    // const userPrivateKeyBase58 = '2FbWj5unRi86bzkSee4asRwzkf7XeTbKWsahGZLx3VaAEmDp6D3LBkAJ12ZWJCywhPPnPrrTvD31jy8WnAn52UAj';
    // 4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM
    const adminPrivateKeyBytess = bs58.decode(adminPrivateKeyBase58);
    const userPrivateKeyBase =
      "2FbWj5unRi86bzkSee4asRwzkf7XeTbKWsahGZLx3VaAEmDp6D3LBkAJ12ZWJCywhPPnPrrTvD31jy8WnAn52UAj";

    // Check the length of the decoded key
    console.log("Secret key length:", adminPrivateKeyBytess.length); // Should be 64 bytes
    console.log("Secret key length:", userPrivateKeyBase.length); // Should be 64 bytes

    if (adminPrivateKeyBytess.length === 64) {
      adminKeypair = Keypair.fromSecretKey(adminPrivateKeyBytess);
      console.log("Admin Public Key:", adminKeypair.publicKey.toString());
    } else {
      console.error("Error: Invalid secret key length. Expected 64 bytes.");
    }
    const userPrivateKeyBase58 =
      "2FbWj5unRi86bzkSee4asRwzkf7XeTbKWsahGZLx3VaAEmDp6D3LBkAJ12ZWJCywhPPnPrrTvD31jy8WnAn52UAj";
    const userPrivateKeyBytess = bs58.decode(userPrivateKeyBase58);
    if (userPrivateKeyBytess.length === 64) {
      userKeypair = Keypair.fromSecretKey(userPrivateKeyBytess);
      console.log("user Public Key:", userKeypair.publicKey.toString());
    } else {
      console.error("Error: Invalid secret key length. Expected 64 bytes.");
    }

    // const adminPublicKey = admin.publicKey;
    const mint = new PublicKey("8rRGXfEfawfkzdTg9QVJpDuKBhBF1Ab3gzRt3tMsTSTK");
    adminPublicKey = new PublicKey(
      "AXpiGXaNqNgjRGKgYExZk9Ye3xo2EwVABhMFzcQGbCvf"
    );
    userPublicKey = new PublicKey(
      "E9MR7NgkK3gNpqKQN5GLnbJtzTvrVtLWCDwz3vxicpzT"
    );

    icoAtaForAdmin = anchor.utils.token.associatedAddress({
      mint: mint,
      owner: adminPublicKey,
    });

    console.log("🚀 ~ before ~ icoAtaForAdmin:", icoAtaForAdmin);

    adminPrivateKey =
      "4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM";
    // 4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM
    // Initialize the program's vaults, etc.
    // Private key in hex format
    // privateKeyHex = '2b2d245c5a8a19dc1ed4b05460a2a60cf55855a216c2a994af0955502469b1f3c859e0a19144ab3e6850f43b1faacb84060f9d01b2ec463b0d36f96746d13af1';
    // Convert the base64 encoded string to a buffer
    const adminPrivateKeyBytes = Uint8Array.from(
      Buffer.from(adminPrivateKey, "base64")
    );
    // Convert the private key from hex to Uint8Array
    // privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));

    // Step 2: Create a Keypair from the private key bytes
    //  adminKeypair = Keypair.fromSecretKey(adminPrivateKeyBytes);
    //  adminKeypair = Keypair.fromSecretKey(adminPrivateKeyBytes);

    // Create a Keypair from the private key
    // userKeypair = Keypair.fromSecretKey(privateKeyUint8Array);

    oraclePriceFeed = new anchor.web3.PublicKey(
      "EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw"
    ); // Example price feed

    // Derive program's ATA and data account addresses using the seeds
    [icoAtaForIcoProgram, _bump] = PublicKey.findProgramAddressSync(
      [CUSTOM_USDT_MINT.toBuffer()],
      program.programId
    );

    const [dataAccount, _dataBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("data"), admin.publicKey.toBuffer()],
      program.programId
    );
    [vaultAccountProgram, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("VAULT_DEMO")],
      program.programId
    );
  });

  it("Initialize ICO ATA", async () => {
    const usdtAmount = new BN(2010000000); // 10 USDT

    await program.methods
      .createIcoAta(usdtAmount)
      .accounts({
        //@ts-ignore
        icoAtaForIcoProgram,
        vaultAccountProgram,
        icoMint,
        icoAtaForAdmin: admintokenAccount,
        admin: adminPublicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([adminKeypair])
      .rpc();

    // expect(data.admin.toString()).to.equal(admin.toString());
  });

  it("Buy ICO tokens with SOL", async () => {
    const solAmount = new anchor.BN(2); // 1 SOL
    const [] = PublicKey.findProgramAddressSync(
      [icoMint.toBuffer()],
      program.programId
    );
    let [pda, bump] = PublicKey.findProgramAddressSync(
      [icoMint.toBuffer()],
      program.programId
    );

    await program.methods
      .buyWithSol(bump, vaultBump, solAmount)
      .accounts({
        //@ts-ignore
        icoAtaForIcoProgram,
        icoMint,
        vault: vaultAccountProgram,
        icoAtaForUser: tokenAccount,
        user: userPublicKey,
        admin: adminPublicKey,
        oraclePriceFeed: SOL_USDC_FEED,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([userKeypair])
      .rpc();

    // const userAtaInfo = await Token.getAccountInfo(provider.connection, userAta);
    // expect(userAtaInfo.amount.toNumber()).to.be.gt(0); // User should have received ICO tokens
  });

  it("Should successfully buy ICO with USDT", async () => {
    // Expected ICO amount based on oracle price (e.g. 100 USDT -> X ICO tokens)
    const usdtAmount = new BN(1); // 10 USDT
    let [pda, bump] = PublicKey.findProgramAddressSync(
      [icoMint.toBuffer()],
      program.programId
    );
    // const expectedIcoAmount = new BN(0); // Hypothetical 500 ICO tokens for 10 USDT

    // Call the buy_with_usdt function
    await program.methods
      .buyWithUsdt(bump, vaultBump, usdtAmount)
      .accounts({
        //@ts-ignore
        icoAtaForIcoProgram,
        icoMint,
        vault: vaultAccountProgram,
        icoAtaForUser: tokenAccount,
        user: userPublicKey,
        admin: adminPublicKey,
        oraclePriceFeed: SOL_USDC_FEED,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([userKeypair])
      .rpc();

    //   assert.isTrue(adminBalance < 2 * anchor.web3.LAMPORTS_PER_SOL);
    //   assert.isTrue(userBalance > 0);
  });
});
