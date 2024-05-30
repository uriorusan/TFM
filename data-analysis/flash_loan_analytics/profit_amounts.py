FILE_PATH = './logs/flash_loan_transaction_profits.log'

def parse_line(line):
    """ Parse a line to extract the wallet address, profit, and currency. """
    # Splitting by the identifier "Profit for" and further splitting by " in transaction"
    parts = line.split()
    wallet_address = parts[2]
    # Identifying the profit and currency by locating 'USDC' or other currency keywords in the line
    try: 
        profit_index = next(i for i, part in enumerate(parts) if part in {"USDC", "WETH", "DAI"}) - 1
        profit = float(parts[profit_index])
        currency = parts[profit_index + 1]
    except: 
        profit = 0
        currency = "Unknown"
    return wallet_address, profit, currency

def main():
    # File path to the text file containing the transaction records
    file_path = './logs/flash_loan_transaction_profits.log'
    
    # Dictionary to store the total profit for each currency
    profits = {}

    # The specific wallet address to calculate profits for
    target_wallet = '0x775C559D9A48cE5a8444C1035C3a8921ab477b8e'

    try:
        # Open the file and process each line
        with open(file_path, 'r') as file:
            for line in file:
                if 'Profit for' in line:
                    wallet_address, profit, currency = parse_line(line)
                    if wallet_address == target_wallet:
                        if currency in profits:
                            profits[currency] += profit
                        else:
                            profits[currency] = profit
    except FileNotFoundError:
        print("File not found. Please check the file path.")
        return
    except Exception as e:
        print(f"An error occurred: {e}")
        return

    # Output the total profits for each currency
    print(f"Total profits for wallet {target_wallet}:")
    for currency, total_profit in profits.items():
        print(f"{currency}: {total_profit:.2f}")

if __name__ == "__main__":
    main()