import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { TOKENS, DEFAULT_OPTIONS, JUP_API } from "../constants";

/**
 * Swap tokens using Jupiter Exchange
 * @param agent SolanaAgentKit instance
 * @param outputMint Target token mint address
 * @param inputAmount Amount to swap (in human-readable format, e.g., 1.5 SOL or 100 USDC)
 * @param inputMint Source token mint address (defaults to USDC)
 * @param slippageBps Slippage tolerance in basis points (default: 300 = 3%)
 * @param inputDecimals Decimals for the input token (default: 6 for USDC, use 9 for SOL)
 * @returns Transaction signature
 */
export async function trade(
  agent: SolanaAgentKit,
  outputMint: PublicKey,
  inputAmount: number,
  inputMint: PublicKey = TOKENS.USDC,
  slippageBps: number = DEFAULT_OPTIONS.SLIPPAGE_BPS,
  inputDecimals: number = 6, // Default to USDC decimals since inputMint defaults to USDC
): Promise<string> {
  try {
    // Convert human-readable amount to base units using correct decimals
    const amountInBaseUnits = Math.floor(inputAmount * Math.pow(10, inputDecimals));

    const quoteResponse = await (
      await fetch(
        `${JUP_API}/quote?` +
          `inputMint=${inputMint.toString()}` +
          `&outputMint=${outputMint.toString()}` +
          `&amount=${amountInBaseUnits}` +
          `&slippageBps=${slippageBps}` +
          `&onlyDirectRoutes=true` +
          `&maxAccounts=20`,
      )
    ).json();

    // Get serialized transaction
    const { swapTransaction } = await (
      await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: agent.wallet_address.toString(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      })
    ).json();
    // Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, "base64");

    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    // Sign and send transaction
    transaction.sign([agent.wallet]);
    const signature = await agent.connection.sendTransaction(transaction);

    return signature;
  } catch (error: any) {
    throw new Error(`Swap failed: ${error.message}`);
  }
}
