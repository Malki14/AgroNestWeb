import sqlite3

db_path = r'F:\AgroNest\AgroNestWebApp\data.db'
conn = sqlite3.connect(db_path)
cur = conn.execute("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name;")
rows = cur.fetchall()
print('SCHEMA:')
for name, sql in rows:
    print(f'-- {name}')
    print(sql)
    print()
print('ROW COUNTS:')
for name, _ in rows:
    c = conn.execute(f'SELECT COUNT(*) FROM {name}')
    print(f'{name}: {c.fetchone()[0]}')

print('\nSAMPLE ROWS:')
for name, _ in rows:
    if name == 'sqlite_sequence':
        continue
    print(f'-- {name}')
    c = conn.execute(f'SELECT * FROM {name} LIMIT 5')
    cols = [d[0] for d in c.description] if c.description else []
    print(cols)
    for row in c.fetchall():
        print(row)
    print()
conn.close()
