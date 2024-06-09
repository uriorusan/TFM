import json
import matplotlib.pyplot as plt

def load_transactions(file_path):
    with open(file_path, 'r') as file:
        transactions = json.load(file)
    return transactions

def analyze_transactions(transactions):
    profits = []
    asset_borrow_counts = {}
    avg_profit_per_asset = {}
    transaction_timings = []
    
    for tx in transactions:
        amount = int(tx['returnValues']['amount'])
        premium = int(tx['returnValues']['premium'])
        asset = tx['returnValues']['asset']
        blockNumber = int(tx['blockNumber'])
        
        profit = amount - premium
        profits.append(profit)
        
        if asset in asset_borrow_counts:
            asset_borrow_counts[asset] += 1
            avg_profit_per_asset[asset].append(profit)
        else:
            asset_borrow_counts[asset] = 1
            avg_profit_per_asset[asset] = [profit]
        
        transaction_timings.append(blockNumber)
    
    for asset, profits in avg_profit_per_asset.items():
        avg_profit_per_asset[asset] = sum(profits) / len(profits)
    
    return profits, asset_borrow_counts, avg_profit_per_asset, transaction_timings

def map_asset_names(asset_borrow_counts, asset_names_map):
    asset_borrow_counts_named = {}
    for asset_address, count in asset_borrow_counts.items():
        token_name = asset_names_map.get(asset_address, asset_address)
        asset_borrow_counts_named[token_name] = count
    return asset_borrow_counts_named

def generate_histogram(asset_borrow_counts_named, title='Histogram of Most Borrowed Assets', filename='Histogram of Assets Loaned.png'):
    tokens = list(asset_borrow_counts_named.keys())
    borrow_counts = [asset_borrow_counts_named[token] for token in tokens]

    filtered_and_sorted = sorted(
        [(token, count) for token, count in zip(tokens, borrow_counts) if count >= 100],
        key=lambda x: x[1],
        reverse=True
    )
    
    tokens_filtered = [item[0] for item in filtered_and_sorted]
    borrow_counts_filtered = [item[1] for item in filtered_and_sorted]

    plt.figure(figsize=(10, 6))
    plt.bar(tokens_filtered, borrow_counts_filtered, color='skyblue')
    plt.xlabel('Asset (Token Name)')
    plt.ylabel('Borrow Count')
    plt.title(title)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(filename, dpi=300)
    plt.show()

# Main execution
if __name__ == "__main__":
    file_path = './logs/flash_loans_mainnet.log'
    transactions = load_transactions(file_path)
    profits, asset_borrow_counts, avg_profit_per_asset, transaction_timings = analyze_transactions(transactions)
    
    most_borrowed_assets_names = {
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "WBTC",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
        "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": "wstETH",
        "0x514910771AF9Ca656af840dff83E8264EcF986CA": "LINK",
        "0x0D8775F648430679A709E98d2b0Cb6250d2887EF": "BAT",
        "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0": "LUSD",
    }
    
    asset_borrow_counts_named = map_asset_names(asset_borrow_counts, most_borrowed_assets_names)
    generate_histogram(asset_borrow_counts_named)
