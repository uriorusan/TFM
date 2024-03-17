import { ChainId, SUPPORTED_CHAINS, Token } from '@uniswap/sdk-core'

export const WETH_TOKEN = new Token(
    SUPPORTED_CHAINS[ChainId.MAINNET],
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  )
  
  export const USDC_TOKEN = new Token(
    SUPPORTED_CHAINS[ChainId.MAINNET],
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    6,
    'USDC',
    'USD//C'
  )

  export const ERC20_ABI = [
    // Read-Only Functions
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
  
    // Authenticated Functions
    'function transfer(address to, uint amount) returns (bool)',
  
    // Events
    'event Transfer(address indexed from, address indexed to, uint amount)',
  ] as const;