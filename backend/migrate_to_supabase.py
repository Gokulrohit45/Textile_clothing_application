import os
import json
import urllib.request
import ssl
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

SPREADSHEET_ID = os.getenv("SPREADSHEET_ID")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SPREADSHEET_ID:
    print("Error: SPREADSHEET_ID is not set in .env")
    exit(1)
if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY is not set in .env")
    exit(1)

# Initialize Google Sheets client
SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')
if not os.path.exists(CREDENTIALS_FILE):
    print(f"Error: credentials.json not found at {CREDENTIALS_FILE}")
    exit(1)

creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
client = gspread.authorize(creds)
spreadsheet = client.open_by_key(SPREADSHEET_ID)

# Disable SSL verification for ease in local python environments
ctx = ssl._create_unverified_context()

TABLES = [
    'customers',
    'addresses',
    'products',
    'categories',
    'subcategories',
    'inventory',
    'banners',
    'coupons',
    'reviews',
    'orders',
    'payments',
    'settings'
]

SCHEMAS = {
    'customers': ['id', 'name', 'email', 'password', 'phone', 'role', 'status', 'createdAt', 'avatar'],
    'addresses': ['id', 'userId', 'name', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode', 'isDefault'],
    'products': ['id', 'categoryId', 'subcategoryId', 'name', 'description', 'price', 'originalPrice', 'colors', 'colorNames', 'sizes', 'images', 'videoUrl', 'rating', 'reviewCount', 'isFeatured', 'isNew', 'status', 'tags', 'material'],
    'categories': ['id', 'name', 'slug', 'image', 'status'],
    'subcategories': ['id', 'categoryId', 'name', 'slug'],
    'inventory': ['id', 'productId', 'colorName', 'size', 'stock'],
    'banners': ['id', 'title', 'subtitle', 'cta', 'ctaLink', 'image', 'bgColor', 'textColor', 'status', 'order'],
    'coupons': ['id', 'code', 'type', 'value', 'minOrder', 'maxUses', 'usedCount', 'startsAt', 'expiresAt', 'status'],
    'reviews': ['id', 'productId', 'userId', 'userName', 'rating', 'comment', 'createdAt', 'status'],
    'activity_logs': ['id', 'userId', 'userName', 'userEmail', 'action', 'timestamp'],
    'orders': ['id', 'userId', 'userName', 'addressId', 'items', 'subtotal', 'discount', 'shipping', 'total', 'paymentMethod', 'paymentStatus', 'paymentScreenshot', 'status', 'trackingId', 'couponCode', 'createdAt', 'updatedAt', 'returnReason', 'customerReturnReason'],
    'payments': ['id', 'orderId', 'method', 'amount', 'screenshot', 'status', 'verifiedAt'],
    'settings': ['key', 'value']
}

NUMERIC_FIELDS = {
    'price', 'originalPrice', 'rating', 'reviewCount', 'order',
    'value', 'minOrder', 'maxUses', 'usedCount', 'stock',
    'subtotal', 'discount', 'shipping', 'total', 'amount'
}

BOOLEAN_FIELDS = {'isFeatured', 'isNew', 'isDefault'}
JSON_FIELDS = {'colors', 'colorNames', 'sizes', 'images', 'tags', 'items', 'socialLinks', 'sizeGuide'}

def parse_val(col_name, val):
    if val == '':
        return None
    if col_name in NUMERIC_FIELDS:
        try:
            return int(val) if '.' not in val else float(val)
        except ValueError:
            return val
    if col_name in BOOLEAN_FIELDS:
        return val.lower() == 'true'
    if col_name in JSON_FIELDS:
        try:
            return json.loads(val)
        except Exception:
            return val
    return val

def get_sheet_data_from_google(table_name):
    try:
        ws = spreadsheet.worksheet(table_name)
    except gspread.exceptions.WorksheetNotFound:
        print(f"Worksheet {table_name} not found in Google Sheets. Skipping.")
        return []
        
    all_rows = ws.get_all_values()
    if not all_rows or len(all_rows) <= 1:
        return []
        
    headers = all_rows[0]
    data = []
    
    for row in all_rows[1:]:
        item = {}
        for i, h in enumerate(headers):
            val = row[i] if i < len(row) else ''
            item[h] = parse_val(h, val)
        data.append(item)
    return data

def migrate_table(table_name):
    print(f"\n--- Fetching table from Google Sheets: {table_name} ---")
    try:
        rows = get_sheet_data_from_google(table_name)
        if not rows:
            print(f"No rows found to migrate for {table_name}.")
            return True
            
        print(f"Found {len(rows)} rows. Sending to Supabase...")

        # Bulk upsert to Supabase
        url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        
        data_bytes = json.dumps(rows).encode('utf-8')
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method='POST')
        
        with urllib.request.urlopen(req, context=ctx) as response:
            print(f"Successfully migrated {table_name} to Supabase. Status: {response.status}")
            return True
            
    except urllib.error.HTTPError as he:
        err_msg = he.read().decode('utf-8')
        print(f"HTTP Error migrating {table_name}: {he.code} - {he.reason}")
        print(f"Error details: {err_msg}")
        return False
    except Exception as e:
        print(f"Error migrating {table_name}: {e}")
        return False

def main():
    print("Starting direct Google Sheets -> Supabase Migration...")
    success_count = 0
    for table in TABLES:
        if migrate_table(table):
            success_count += 1
            
    print(f"\nMigration complete: {success_count}/{len(TABLES)} tables successfully migrated.")

if __name__ == '__main__':
    main()
