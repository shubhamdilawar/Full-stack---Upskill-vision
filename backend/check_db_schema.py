import sqlite3

# Connect to the SQLite database
connection = sqlite3.connect("users.db")
cursor = connection.cursor()

# Get table information for 'users' table
cursor.execute("PRAGMA table_info(users);")
columns = cursor.fetchall()

# Print the column details
for column in columns:
    print(column)

# Close the connection
connection.close()
