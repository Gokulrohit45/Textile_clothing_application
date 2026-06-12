import os
import json
import urllib.request
import ssl
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY is not set in .env")
    exit(1)

ctx = ssl._create_unverified_context()

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def fetch_table(table_name, query_params=""):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}"
    if query_params:
        url += f"?{query_params}"
    req = urllib.request.Request(url, headers=get_headers())
    with urllib.request.urlopen(req, context=ctx) as response:
        return json.loads(response.read().decode('utf-8'))

def delete_record(table_name, id_col, id_val):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{table_name}?{id_col}=eq.{id_val}"
    req = urllib.request.Request(url, headers=get_headers(), method='DELETE')
    with urllib.request.urlopen(req, context=ctx) as response:
        return response.status in (200, 204)

def main():
    print("Starting database cleanup...")
    
    # 1. Fetch all customers
    try:
        customers = fetch_table("customers")
    except Exception as e:
        print("Failed to fetch customers:", e)
        return

    allowed_emails = {
        "gokulnath96880@gmail.com",
        "gokulnathm.vtab@gmail.com"
    }

    # 2. Identify target customers for deletion
    targets = []
    for c in customers:
        email = c.get("email", "").lower().strip()
        if email not in allowed_emails:
            targets.append(c)

    if not targets:
        print("No demo customer accounts found to delete.")
        return

    print(f"Found {len(targets)} customer accounts to delete:")
    for t in targets:
        print(f" - ID: {t.get('id')} | Name: {t.get('name')} | Email: {t.get('email')}")

    # 3. Perform cascade deletes for each target customer
    for t in targets:
        cid = t.get('id')
        email = t.get('email')
        print(f"\nCleaning up data for customer {email} ({cid})...")

        # A. Delete reviews
        try:
            reviews = fetch_table("reviews", f"userId=eq.{cid}")
            for r in reviews:
                rid = r.get('id')
                delete_record("reviews", "id", rid)
                print(f"  Deleted review {rid}")
        except Exception as e:
            print("  Error cleaning reviews:", e)

        # B. Delete addresses
        try:
            addresses = fetch_table("addresses", f"userId=eq.{cid}")
            for a in addresses:
                aid = a.get('id')
                delete_record("addresses", "id", aid)
                print(f"  Deleted address {aid}")
        except Exception as e:
            print("  Error cleaning addresses:", e)

        # C. Delete orders & payments
        try:
            orders = fetch_table("orders", f"userId=eq.{cid}")
            for o in orders:
                oid = o.get('id')
                
                # Delete associated payments
                payments = fetch_table("payments", f"orderId=eq.{oid}")
                for p in payments:
                    pid = p.get('id')
                    delete_record("payments", "id", pid)
                    print(f"    Deleted payment {pid} for order {oid}")
                
                # Delete order
                delete_record("orders", "id", oid)
                print(f"  Deleted order {oid}")
        except Exception as e:
            print("  Error cleaning orders/payments:", e)

        # D. Delete customer account
        try:
            delete_record("customers", "id", cid)
            print(f"Successfully deleted customer account {email} ({cid})")
        except Exception as e:
            print("  Error deleting customer account:", e)

    print("\nDatabase cleanup complete!")

if __name__ == '__main__':
    main()
