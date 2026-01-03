# Token Tools Documentation

This guide covers all token-related tools available in the Solana Agent Kit.

## Overview

The token tools enable AI agents to deploy, manage, and interact with SPL tokens on Solana.

## Available Tools

### deploy_token

Deploy a new SPL token with metadata.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | - | Token name |
| uri | string | Yes | - | Metadata URI (IPFS, Arweave, etc.) |
| symbol | string | Yes | - | Token symbol (e.g., "SOL") |
| decimals | number | No | 9 | Decimal places |
| initialSupply | number | No | - | Initial tokens to mint |

**Example:**
```typescript
import { SolanaAgentKit } from "solana-agent-kit";

const agent = new SolanaAgentKit(privateKey, rpcUrl);

const result = await agent.deployToken({
  name: "My Token",
  uri: "https://arweave.net/metadata.json",
  symbol: "MTK",
  decimals: 9,
  initialSupply: 1000000
});

console.log("Token mint:", result.mint.toBase58());
```

**Returns:**
```typescript
{
  mint: PublicKey  // The token mint address
}
```

---

### transfer

Transfer SPL tokens to another wallet.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| to | PublicKey | Yes | Recipient address |
| amount | number | Yes | Amount to transfer |
| mint | PublicKey | No | Token mint (omit for SOL) |

**Example:**
```typescript
await agent.transfer({
  to: new PublicKey("recipient..."),
  amount: 100,
  mint: new PublicKey("token-mint...")
});
```

---

### get_balance

Get token balance for a wallet.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token_address | PublicKey | No | Token mint (omit for SOL) |

**Example:**
```typescript
// Get SOL balance
const solBalance = await agent.getBalance();

// Get token balance
const tokenBalance = await agent.getBalance(tokenMint);
```

---

### get_token_data

Fetch token metadata and information.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mint | PublicKey | Yes | Token mint address |

**Example:**
```typescript
const data = await agent.getTokenData(tokenMint);
console.log(data.name, data.symbol, data.decimals);
```

---

### fetch_price

Get current token price from Jupiter.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mint | PublicKey | Yes | Token mint address |

**Example:**
```typescript
const price = await agent.fetchPrice(tokenMint);
console.log(`Price: $${price}`);
```

---

### launch_pumpfun_token

Launch a token on pump.fun.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Token name |
| symbol | string | Yes | Token symbol |
| description | string | Yes | Token description |
| imageUrl | string | Yes | Token image URL |

**Example:**
```typescript
const result = await agent.launchPumpfunToken({
  name: "Meme Coin",
  symbol: "MEME",
  description: "The next big meme coin",
  imageUrl: "https://..."
});
```

---

## Error Handling

All token tools throw descriptive errors:

```typescript
try {
  await agent.deployToken({ ... });
} catch (error) {
  if (error.message.includes("insufficient funds")) {
    // Handle insufficient SOL for transaction
  }
  if (error.message.includes("Token deployment failed")) {
    // Handle deployment failure
  }
}
```

## Common Issues

### Insufficient Funds
Ensure you have enough SOL for:
- Transaction fees (~0.00001 SOL per tx)
- Rent for new accounts (~0.002 SOL per token)

### Invalid Metadata URI
The URI must be accessible and return valid JSON metadata:
```json
{
  "name": "Token Name",
  "symbol": "TKN",
  "description": "Token description",
  "image": "https://..."
}
```

### RPC Rate Limits
Use a dedicated RPC endpoint for production:
- Helius
- QuickNode
- Triton

## Best Practices

1. **Always verify transactions** - Check Solscan after operations
2. **Use proper decimals** - Standard is 9 for fungible tokens
3. **Store mint addresses** - Save the returned mint address securely
4. **Test on devnet first** - Use `https://api.devnet.solana.com`
