import { WETH_TOKEN, USDC_TOKEN } from '../../constants';

// Import necessary libraries or typings for fetch if you're in a Node.js environment
// For Node.js, you might need to install node-fetch or similar library

class DefiLlamaAPI {
    private baseUrl: string = 'https://api.llama.fi';
  
    // Method to list all protocols along with their TVL
    async listAllProtocols(): Promise<any> {
      const response = await fetch(`${this.baseUrl}/protocols`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  
    // Method to get historical TVL of a protocol by slug
    async getProtocolTvl(protocolSlug: string): Promise<any> {
      const response = await fetch(`${this.baseUrl}/protocol/${protocolSlug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  
    // Method to get historical TVL of DeFi on all chains
    async getHistoricalChainTvl(): Promise<any> {
      const response = await fetch(`${this.baseUrl}/v2/historicalChainTvl`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  
    // Method to get current TVL of a protocol
    async getCurrentTvl(protocol: string): Promise<any> {
      const response = await fetch(`${this.baseUrl}/tvl/${protocol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  
    // Method to get current prices of tokens by contract address
    async getCurrentPrices(coins: string): Promise<any> {
      const response = await fetch(`${this.baseUrl}/prices/current/${coins}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  }
  
  // Usage
  const api = new DefiLlamaAPI();
  /*
  // Example: List all protocols
api.listAllProtocols().then(protocolList => {
    console.log(protocolList);
}).catch(error => {
    console.error(error);
});
**/
  // Replace 'aave' with the actual protocol slug you're interested in
  api.getProtocolTvl('aave').then(tvlData => {
    console.log(tvlData);
  }).catch(error => {
    console.error(error);
  });
  
  