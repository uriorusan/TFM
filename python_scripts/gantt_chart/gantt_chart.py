import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import numpy as np

# Define the project tasks and their start and end dates
tasks_refined = [
    ("Research, State of the Art and Conceptual Understanding", "2024-02-05", "2024-03-12"),
    ("Environment Setup and Smart Contract Development", "2024-02-28", "2024-03-31"),
    ("Simulation and Testing", "2024-03-18", "2024-04-22"),
    ("Scale Up", "2024-04-01", "2024-05-20"),
    ("Deployment and Real-world Testing", "2024-05-06", "2024-06-11"),
    ("Finish write up and preparing presentation", "2024-06-03", "2024-06-18")
]

# Convert dates to datetime objects for the refined tasks
tasks_refined = list(reversed([(task, datetime.strptime(start, "%Y-%m-%d"), datetime.strptime(end, "%Y-%m-%d")) for task, start, end in tasks_refined]))

# Setup plot with refined tasks again, correcting the date locator issue
fig, ax = plt.subplots(figsize=(12, 8))

# Define a palette with distinct colors
colors = plt.cm.tab10(np.linspace(0, 1, len(tasks_refined)))

# Plot refined tasks with corrected date handling
for i, (task, start, end) in enumerate(tasks_refined):
    ax.barh(task, (end - start).days, left=start, color=colors[i], edgecolor='black', alpha=0.7)

# Format the x-axis to show dates
plt.gca().xaxis.set_major_locator(mdates.MonthLocator())
plt.gca().xaxis.set_minor_locator(mdates.WeekdayLocator(byweekday=mdates.MO, interval=1)) # Set ticks to show every Monday
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
plt.gcf().autofmt_xdate() # Rotation

# Enhancing the visual appearance with more detailed X-axis
plt.xlabel("Timeline")
plt.title("TFM Oriol Cortés Gantt Chart")
plt.grid(axis='x', which='major', linestyle='--', linewidth=0.5)
plt.grid(axis='x', which='minor', linestyle='--', linewidth=0.1)
ax.set_axisbelow(True)

plt.tight_layout()
# Save the figure to an image file
plt.savefig('TFM_Oriol_Cortes_Gantt_Chart.png', dpi=300)  # Saves the plot as a PNG file with 300 dpi
# Show the plot
plt.show()
