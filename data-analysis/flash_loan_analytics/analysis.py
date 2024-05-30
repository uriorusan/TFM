import json
import matplotlib.pyplot as plt
import matplotlib.pyplot as plt
import numpy as np

# Assuming `transactions` is your list of transaction dictionaries
def prepare_visualization_data(transactions):
    profits = []
    asset_borrow_counts = {}
    profit_over_time = {}

    for tx in transactions:
        amount = int(tx['returnValues']['amount'])
        premium = int(tx['returnValues']['premium'])
        asset = tx['returnValues']['asset']
        blockNumber = int(tx['blockNumber'])
        
        profit = float(amount - premium)  # Ensure profit is a float
        profits.append(profit)

        if asset in asset_borrow_counts:
            asset_borrow_counts[asset] += 1
        else:
            asset_borrow_counts[asset] = 1
        
        if blockNumber not in profit_over_time:
            profit_over_time[blockNumber] = []
        profit_over_time[blockNumber].append(profit)
    
    # Calculate average profit for each blockNumber (time proxy)
    avg_profit_over_time = {block: np.mean(profits) for block, profits in profit_over_time.items()}

    return profits, asset_borrow_counts, avg_profit_over_time


def visualize_data(profits, asset_borrow_counts, avg_profit_over_time):
    # Histogram of Profits
    plt.figure(figsize=(10, 6))
    plt.hist(profits, bins=30, color='blue')
    plt.xlabel('Profit')
    plt.ylabel('Frequency')
    plt.title('Histogram of Profits')
    plt.yscale('log')  # Set y-axis scale to logarithmic
    plt.savefig('Histogram of Profits.png', dpi=300)  # Saves the plot as a PNG file with 300 dpi
    plt.show()

    # Histogram of the Most Borrowed Assets
    assets = list(asset_borrow_counts.keys())
    borrow_counts = list(asset_borrow_counts.values())
    plt.figure(figsize=(10, 6))
    plt.bar(assets, borrow_counts, color='green')
    plt.xlabel('Asset')
    plt.ylabel('Borrow Count')
    plt.title('Histogram of the Most Borrowed Assets')
    plt.xticks(rotation=45, ha='right')
    plt.savefig('Histogram of Borrowed Assets.png', dpi=300)  # Saves the plot as a PNG file with 300 dpi
    plt.show()

    # Avg Profit per Transaction Over Time
    blockNumbers = sorted(list(avg_profit_over_time.keys()))
    avg_profits = [avg_profit_over_time[block] for block in blockNumbers]
    plt.figure(figsize=(10, 6))
    plt.plot(blockNumbers, avg_profits, marker='o', linestyle='-', color='red')
    plt.xlabel('Block Number (Proxy for Time)')
    plt.ylabel('Average Profit')
    plt.title('Average Profit per Transaction Over Time')
    plt.savefig('Histogram of Avg Profit.png', dpi=300)  # Saves the plot as a PNG file with 300 dpi
    plt.show()

def read_transactions(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def analyze_transactions(transactions):
    analytics = {}
    for tx in transactions:
        address = tx['returnValues']['target']
        amount = int(tx['returnValues']['amount'])
        premium = int(tx['returnValues']['premium'])
        asset = tx['returnValues']['asset']
        
        if address not in analytics:
            analytics[address] = {'total_borrowed': 0, 'assets_borrowed': set(), 'total_profit': 0}
        
        analytics[address]['total_borrowed'] += amount
        analytics[address]['assets_borrowed'].add(asset)
        # Assuming profit is calculated as amount borrowed minus premium paid
        analytics[address]['total_profit'] += (amount - premium)
        
    # Convert assets borrowed from set to list for JSON serialization
    for address in analytics:
        analytics[address]['assets_borrowed'] = list(analytics[address]['assets_borrowed'])
        
    return analytics

def main():
    file_path = './logs/flash_loans_mainnet.log' # Update this with the actual file path
    transactions = read_transactions(file_path)
    
    # Main execution
    profits, asset_borrow_counts, avg_profit_over_time = prepare_visualization_data(transactions)
    visualize_data(profits, asset_borrow_counts, avg_profit_over_time)

if __name__ == "__main__":
    main()


