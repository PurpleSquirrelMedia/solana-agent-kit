import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { SolanaAgentKit } from "../index";

/**
 * Get the balance of SOL or an SPL token for the agent's wallet
 * @param agent - SolanaAgentKit instance
 * @param token_address - Optional SPL token mint address. If not provided, returns SOL balance
 * @returns Promise resolving to the balance as a number (in UI units) or null if account doesn't exist
 */
export async function get_balance(
  agent: SolanaAgentKit,
  token_address?: PublicKey
): Promise<number | null> {
  if (!token_address) {
    return (
      (await agent.connection.getBalance(agent.wallet_address)) /
      LAMPORTS_PER_SOL
    );
  }

  try {
    // Get the Associated Token Account for this mint and wallet
    const ata = await getAssociatedTokenAddress(
      token_address,
      agent.wallet_address
    );

    const token_account = await agent.connection.getTokenAccountBalance(ata);
    return token_account.value.uiAmount;
  } catch (error: any) {
    // Return null if the token account doesn't exist
    if (
      error.message?.includes("could not find account") ||
      error.message?.includes("Invalid param")
    ) {
      return null;
    }
    throw error;
  }
}
