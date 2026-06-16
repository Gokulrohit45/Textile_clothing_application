import os
import json
import urllib.request
import ssl
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY is not set in .env")

# SSL context for urllib requests
ctx = ssl._create_unverified_context()

# Define column schemas (headers) for each table (retained for compatibility)
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

# Fields to parse/convert during reading/writing
NUMERIC_FIELDS = {
    'price', 'originalPrice', 'rating', 'reviewCount', 'order',
    'value', 'minOrder', 'maxUses', 'usedCount', 'stock',
    'subtotal', 'discount', 'shipping', 'total', 'amount'
}

INTEGER_FIELDS = {'reviewCount', 'order', 'maxUses', 'usedCount', 'stock'}

BOOLEAN_FIELDS = {'isFeatured', 'isNew', 'isDefault'}

JSON_FIELDS = {'colors', 'colorNames', 'sizes', 'images', 'tags', 'items', 'socialLinks', 'sizeGuide'}

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def parse_val(col_name, val, sheet_name=None):
    if val is None or val == '':
        return None
    if sheet_name == 'reviews' and col_name == 'rating':
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return val
    if col_name in INTEGER_FIELDS:
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return val
    if col_name in NUMERIC_FIELDS:
        try:
            return int(val) if isinstance(val, str) and '.' not in val else float(val)
        except (ValueError, TypeError):
            return val
    if col_name in BOOLEAN_FIELDS:
        if isinstance(val, bool):
            return val
        return str(val).lower() == 'true'
    if col_name in JSON_FIELDS:
        if isinstance(val, (list, dict)):
            return val
        try:
            return json.loads(val)
        except Exception:
            return val
    return val

def format_val(col_name, val):
    if val is None:
        return ''
    if col_name in BOOLEAN_FIELDS:
        return str(val).lower()
    if col_name in JSON_FIELDS:
        return json.dumps(val)
    return str(val)

def clean_for_db(col_name, val, sheet_name=None):
    return parse_val(col_name, val, sheet_name)

def get_all(sheet_name):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{sheet_name}"
    req = urllib.request.Request(url, headers=get_headers())
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            parsed_data = []
            for item in data:
                parsed_item = {}
                for k, v in item.items():
                    parsed_item[k] = parse_val(k, v, sheet_name)
                parsed_data.append(parsed_item)
            return parsed_data
    except Exception as e:
        print(f"Error in sheets_db.get_all({sheet_name}): {e}")
        if hasattr(e, 'read'):
            print("Error details:", e.read().decode('utf-8'))
        return []

def save(sheet_name, item):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{sheet_name}"
    headers = get_headers()
    headers["Prefer"] = "return=representation"
    
    db_item = {}
    for k, v in item.items():
        db_item[k] = clean_for_db(k, v, sheet_name)
        
    data_bytes = json.dumps(db_item).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            if isinstance(res_data, list) and len(res_data) > 0:
                return {k: parse_val(k, v, sheet_name) for k, v in res_data[0].items()}
            return item
    except Exception as e:
        print(f"Error in sheets_db.save({sheet_name}): {e}")
        if hasattr(e, 'read'):
            print("Response error details:", e.read().decode('utf-8'))
        raise e

def update(sheet_name, id_val, updates):
    id_col = 'key' if sheet_name == 'settings' else 'id'
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{sheet_name}?{id_col}=eq.{id_val}"
    headers = get_headers()
    
    db_updates = {}
    for k, v in updates.items():
        if k != id_col:
            db_updates[k] = clean_for_db(k, v, sheet_name)
            
    data_bytes = json.dumps(db_updates).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method='PATCH')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.status in (200, 204)
    except Exception as e:
        print(f"Error in sheets_db.update({sheet_name}, {id_val}): {e}")
        if hasattr(e, 'read'):
            print("Response error details:", e.read().decode('utf-8'))
        return False

def delete(sheet_name, id_val):
    id_col = 'key' if sheet_name == 'settings' else 'id'
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{sheet_name}?{id_col}=eq.{id_val}"
    req = urllib.request.Request(url, headers=get_headers(), method='DELETE')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.status in (200, 204)
    except Exception as e:
        print(f"Error in sheets_db.delete({sheet_name}, {id_val}): {e}")
        return False

def delete_by_column(sheet_name, col_name, value):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{sheet_name}?{col_name}=eq.{value}"
    req = urllib.request.Request(url, headers=get_headers(), method='DELETE')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.status in (200, 204)
    except Exception as e:
        print(f"Error in sheets_db.delete_by_column({sheet_name}, {col_name}): {e}")
        return False

def get_settings():
    rows = get_all('settings')
    settings_dict = {}
    for r in rows:
        key = r.get('key')
        val = r.get('value')
        settings_dict[key] = parse_val(key, val)
    return settings_dict

def update_settings(updates):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/settings"
    headers = get_headers()
    headers["Prefer"] = "resolution=merge-duplicates"
    
    rows_to_upsert = []
    for k, v in updates.items():
        val_str = format_val(k, v)
        rows_to_upsert.append({
            "key": k,
            "value": val_str
        })
        
    if not rows_to_upsert:
        return
        
    data_bytes = json.dumps(rows_to_upsert).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            pass
    except Exception as e:
        print(f"Error in sheets_db.update_settings: {e}")
        if hasattr(e, 'read'):
            print("Response error details:", e.read().decode('utf-8'))

def initialize_database():
    print("Initializing Supabase Database with mock data...")
    # Import mock data locally
    from mock_db_init_data import (
        mockCustomers, mockAddresses, mockProducts, mockCategories,
        mockSubcategories, mockInventory, mockBanners, mockCoupons,
        mockReviews, mockOrders, mockPayments, mockSettings
    )
    
    MOCK_DATA = {
        'customers': mockCustomers,
        'addresses': mockAddresses,
        'products': mockProducts,
        'categories': mockCategories,
        'subcategories': mockSubcategories,
        'inventory': mockInventory,
        'banners': mockBanners,
        'coupons': mockCoupons,
        'reviews': mockReviews,
        'orders': mockOrders,
        'payments': mockPayments
    }
    
    # Check settings first
    try:
        settings_rows = get_all('settings')
        if not settings_rows:
            print("Populating default mock data for settings...")
            update_settings(mockSettings)
        else:
            print("Settings table already populated.")
    except Exception as e:
        print(f"Failed to check/initialize settings: {e}")

    # For other tables, check if empty and populate
    for table_name, mock_list in MOCK_DATA.items():
        try:
            # Special check for payments to prevent orphaned mock payments
            if table_name == 'payments':
                orders_url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/orders?select=id&limit=1"
                orders_req = urllib.request.Request(orders_url, headers=get_headers())
                with urllib.request.urlopen(orders_req, context=ctx) as orders_res:
                    orders_existing = json.loads(orders_res.read().decode('utf-8'))
                    if orders_existing:
                        print("Skipping payments seeding because orders table already has live data.")
                        continue

            url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}?select=id&limit=1"
            req = urllib.request.Request(url, headers=get_headers())
            with urllib.request.urlopen(req, context=ctx) as response:
                existing = json.loads(response.read().decode('utf-8'))
                if not existing:
                    print(f"Populating default mock data for {table_name}...")
                    post_url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}"
                    post_headers = get_headers()
                    post_headers["Prefer"] = "resolution=merge-duplicates"
                    
                    db_rows = []
                    for item in mock_list:
                        db_row = {k: clean_for_db(k, v, table_name) for k, v in item.items()}
                        db_rows.append(db_row)
                        
                    data_bytes = json.dumps(db_rows).encode('utf-8')
                    post_req = urllib.request.Request(post_url, data=data_bytes, headers=post_headers, method='POST')
                    with urllib.request.urlopen(post_req, context=ctx) as post_res:
                        print(f"Populated {table_name}. Status: {post_res.status}")
                else:
                    print(f"Table {table_name} already populated.")
        except Exception as e:
            print(f"Failed to check/initialize table {table_name}: {e}")
            if hasattr(e, 'read'):
                print("Error details:", e.read().decode('utf-8'))
