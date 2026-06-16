import os
import json
import urllib.request
import datetime
import random
import threading
import base64
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import sheets_db

def save_base64_file(base64_str):
    if not isinstance(base64_str, str):
        return base64_str
        
    is_image = base64_str.startswith("data:image/")
    is_video = base64_str.startswith("data:video/")
    
    if not (is_image or is_video):
        return base64_str
        
    try:
        header, encoded = base64_str.split(",", 1)
        mime_type = header.split(";")[0]  # e.g., "data:image/png" or "data:video/mp4"
        ext = mime_type.split("/")[1]      # e.g., "png" or "mp4"
        if ext == 'jpeg':
            ext = 'jpg'
        ext = ext.split(";")[0]  # Clean any extra parameters
        
        data = base64.b64decode(encoded)
        filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Upload to Supabase Storage if configured
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        if supabase_url and supabase_key:
            try:
                content_type = mime_type.replace("data:", "")
                upload_url = f"{supabase_url.rstrip('/')}/storage/v1/object/uploads/{filename}"
                headers = {
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": content_type
                }
                import ssl
                ctx = ssl._create_unverified_context()
                req = urllib.request.Request(upload_url, data=data, headers=headers, method='POST')
                with urllib.request.urlopen(req, context=ctx) as response:
                    print(f"Uploaded {filename} to Supabase Storage successfully. Status: {response.status}")
                return f"{supabase_url.rstrip('/')}/storage/v1/object/public/uploads/{filename}"
            except Exception as se:
                print(f"Supabase upload failed, falling back to local storage: {se}")
                if hasattr(se, 'read'):
                    print("Error details:", se.read().decode('utf-8'))
        
        # Determine paths fallback
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        upload_dir = os.path.join(backend_dir, 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, 'wb') as f:
            f.write(data)
            
        # Return URL pointing to our Flask server
        return f"{request.host_url}static/uploads/{filename}"
    except Exception as e:
        print(f"Error saving base64 file: {e}")
        return base64_str

def get_next_id(prefix, items):
    if not items:
        return f"{prefix}1"
    max_num = 0
    for item in items:
        id_val = item.get('id')
        if id_val and str(id_val).startswith(prefix):
            try:
                num = int(str(id_val)[len(prefix):])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    return f"{prefix}{max_num + 1}"

def log_activity(user_id, user_name, user_email, action):
    try:
        logs = sheets_db.get_all('activity_logs')
        new_log = {
            "id": get_next_id("log_", logs),
            "userId": user_id,
            "userName": user_name,
            "userEmail": user_email,
            "action": action,
            "timestamp": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        sheets_db.save('activity_logs', new_log)
    except Exception as e:
        print(f"Error writing activity log: {e}")

# Temporary in-memory storage for OTPs: { email: { 'otp': '123456', 'expires_at': datetime } }
otp_storage = {}

load_dotenv()

app = Flask(__name__)
# Enable CORS for frontend local development
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Auto-initialize spreadsheet structure and defaults on startup
with app.app_context():
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
        try:
            sheets_db.initialize_database()
        except Exception as e:
            print(f"Error initializing database: {e}")

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "active",
        "message": "PSP garments and clothing E-Commerce API is running successfully!",
        "version": "1.0.0"
    }), 200

# ==========================================
# AUTHENTICATION & USER MANAGEMENT
# ==========================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    
    customers = sheets_db.get_all('customers')
    if any(c['email'].lower() == email.lower() for c in customers):
        return jsonify({"error": "Email already registered"}), 400
        
    new_user = {
        "id": get_next_id("u", customers),
        "name": data.get('name'),
        "email": email,
        "password": data.get('password'),
        "phone": data.get('phone'),
        "role": "customer",
        "status": "active",
        "createdAt": data.get('createdAt', ''),
        "avatar": ""
    }
    
    sheets_db.save('customers', new_user)
    log_activity(new_user['id'], new_user['name'], new_user['email'], "Login (Register)")
    return jsonify(new_user), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    customers = sheets_db.get_all('customers')
    user = next((c for c in customers if c['email'].lower() == email.lower()), None)
    
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid email or password"}), 401
        
    if user['status'] == 'blocked':
        return jsonify({"error": "Your account has been suspended"}), 403
        
    log_activity(user['id'], user['name'], user['email'], "Login")
    return jsonify(user), 200

@app.route('/api/auth/profile/update', methods=['POST'])
def update_profile():
    data = request.json
    user_id = data.get('id')
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
        
    customers = sheets_db.get_all('customers')
    user = next((c for c in customers if c['id'] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    updates = {}
    
    # Update name if provided
    if 'name' in data:
        updates['name'] = data.get('name')
        
    # Update phone if provided
    if 'phone' in data:
        updates['phone'] = data.get('phone')
        
    # Update password if provided
    if 'password' in data and data.get('password'):
        updates['password'] = data.get('password')
        
    # Update email if provided
    if 'email' in data:
        new_email = data.get('email')
        if new_email.lower() != user['email'].lower():
            # Check if email is already taken by another user
            if any(c['email'].lower() == new_email.lower() and c['id'] != user_id for c in customers):
                return jsonify({"error": "Email is already registered by another user"}), 400
            updates['email'] = new_email

    if not updates:
        return jsonify(user), 200
        
    success = sheets_db.update('customers', user_id, updates)
    if success:
        # Refetch updated user info
        customers = sheets_db.get_all('customers')
        updated_user = next((c for c in customers if c['id'] == user_id), None)
        return jsonify(updated_user), 200
    return jsonify({"error": "Failed to update profile"}), 500

@app.route('/api/auth/logout-log', methods=['POST'])
def logout_log():
    data = request.json
    user_id = data.get('id')
    user_name = data.get('name')
    user_email = data.get('email')
    
    if user_id:
        log_activity(user_id, user_name, user_email, "Logout")
        return jsonify({"message": "Logout activity logged"}), 200
    return jsonify({"error": "Missing user details"}), 400

@app.route('/api/admin/activity-logs', methods=['GET'])
def get_activity_logs():
    logs = sheets_db.get_all('activity_logs')
    logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return jsonify(logs), 200

@app.route('/api/auth/profile/change-password', methods=['POST'])
def change_password():
    data = request.json
    user_id = data.get('id')
    new_pass = data.get('newPassword')
    
    success = sheets_db.update('customers', user_id, {"password": new_pass})
    if success:
        return jsonify({"message": "Password changed successfully"}), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/api/auth/customers', methods=['GET'])
def get_customers():
    # Admin route
    customers = sheets_db.get_all('customers')
    return jsonify(customers), 200

@app.route('/api/auth/customers/status', methods=['POST'])
def update_customer_status():
    data = request.json
    user_id = data.get('id')
    status = data.get('status') # active / blocked
    
    success = sheets_db.update('customers', user_id, {"status": status})
    if success:
        return jsonify({"message": f"User status updated to {status}"}), 200
    return jsonify({"error": "User not found"}), 404

# ==========================================
# BREVO EMAIL & PASSWORD RESET
# ==========================================

def send_brevo_email(to_email, to_name, otp):
    api_key = os.environ.get("BREVO_API_KEY")
    if not api_key:
        print("BREVO_API_KEY is not configured in .env")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    
    try:
        settings = sheets_db.get_settings()
        site_name = settings.get('siteName', 'PSP garments and clothing')
        site_logo = settings.get('logo')
        site_tagline = settings.get('tagline', 'Dress Your Best, Every Day')
        sender_email = os.environ.get("BREVO_SENDER_EMAIL", settings.get('email', 'shanthiprabaa@gmail.com'))
        sender_name = os.environ.get("BREVO_SENDER_NAME", f"{site_name} Support")
    except Exception:
        site_name = 'PSP garments and clothing'
        site_logo = None
        site_tagline = 'Dress Your Best, Every Day'
        sender_email = os.environ.get("BREVO_SENDER_EMAIL", "shanthiprabaa@gmail.com")
        sender_name = os.environ.get("BREVO_SENDER_NAME", "PSP garments and clothing Support")
    
    logo_html = f'<img src="{site_logo}" alt="{site_name}" style="max-height: 80px; margin-bottom: 10px;" />' if site_logo else f'<h1 style="color: #1A1A2E; margin: 0; font-family: \'Playfair Display\', Georgia, serif; font-size: 28px;">{site_name}</h1>'
    
    data = {
        "sender": {
            "name": sender_name,
            "email": sender_email
        },
        "to": [
            {
              "email": to_email,
              "name": to_name
            }
        ],
        "subject": f"Password Reset OTP - {site_name}",
        "htmlContent": f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #F5F0EB; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; bg-color: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        {logo_html}
                        <p style="color: #E8B86D; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">{site_tagline}</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 16px; color: #1A1A2E;">Hello <strong>{to_name}</strong>,</p>
                    <p style="font-size: 14px; color: #555;">We received a request to reset your password. Use the 6-digit One-Time Password (OTP) below to proceed with resetting your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #E8B86D; background-color: #1A1A2E; padding: 12px 24px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(26,26,46,0.15); font-family: monospace;">{otp}</span>
                    </div>
                    <p style="font-size: 13px; color: #777;">This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 11px; text-align: center; color: #999;">{site_name} Customer Support • This is an automated message, please do not reply.</p>
                </div>
            </body>
        </html>
        """
    }
    
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            print(f"Brevo email sent successfully: {res_data}")
            return True
    except Exception as e:
        print(f"Error sending Brevo email: {e}")
        return False

def send_pin_otp_email(to_email, otp):
    api_key = os.environ.get("BREVO_API_KEY")
    if not api_key:
        print("BREVO_API_KEY is not configured in .env")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    
    try:
        settings = sheets_db.get_settings()
        site_name = settings.get('siteName', 'PSP garments and clothing')
        site_logo = settings.get('logo')
        sender_email = os.environ.get("BREVO_SENDER_EMAIL", settings.get('email', 'shanthiprabaa@gmail.com'))
        sender_name = os.environ.get("BREVO_SENDER_NAME", f"{site_name} Support")
    except Exception:
        site_name = 'PSP garments and clothing'
        site_logo = None
        sender_email = os.environ.get("BREVO_SENDER_EMAIL", "shanthiprabaa@gmail.com")
        sender_name = os.environ.get("BREVO_SENDER_NAME", "PSP garments and clothing Support")
        
    logo_html = f'<img src="{site_logo}" alt="{site_name}" style="max-height: 80px; margin-bottom: 10px;" />' if site_logo else f'<h1 style="color: #1A1A2E; margin: 0; font-family: \'Playfair Display\', Georgia, serif; font-size: 28px;">{site_name}</h1>'
    
    data = {
        "sender": {
            "name": sender_name,
            "email": sender_email
        },
        "to": [
            {
              "email": to_email,
              "name": "Admin User"
            }
        ],
        "subject": f"Security PIN Verification OTP - {site_name}",
        "htmlContent": f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #F5F0EB; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E5E0DA;">
                    <div style="background-color: #1A1A2E; padding: 30px; text-align: center; color: #ffffff;">
                        {logo_html}
                        <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: 600; font-family: 'Outfit', sans-serif; letter-spacing: 0.5px;">Security Control Panel</h2>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h3 style="color: #1A1A2E; margin-top: 0; font-size: 18px; font-family: 'Outfit', sans-serif;">PIN Change Verification</h3>
                        <p style="font-size: 14px; color: #555; margin-bottom: 25px;">A request was made to set or change the access Security PIN for the orders and payments tabs. Please use the verification code below to authorize this update.</p>
                        
                        <div style="background-color: #F9F7F5; border-radius: 12px; padding: 20px 30px; text-align: center; margin-bottom: 25px; border: 1px dashed #D0C9C0;">
                            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1A1A2E;">{otp}</span>
                        </div>
                        
                        <p style="font-size: 12px; color: #888;">This OTP is valid for the next 5 minutes. If you did not request this update, you can safely ignore this email.</p>
                    </div>
                    <div style="background-color: #F9F7F5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #E5E0DA;">
                        <p style="margin: 0;">&copy; {site_name}. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """
    }
    
    try:
        import ssl
        ctx = ssl._create_unverified_context()
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, context=ctx) as response:
            res_data = response.read().decode('utf-8')
            print(f"Brevo security PIN OTP email sent successfully: {res_data}")
            return True
    except Exception as e:
        print(f"Error sending Brevo security PIN OTP email: {e}")
        return False


def send_order_email(order, event_type):
    api_key = os.environ.get("BREVO_API_KEY")
    if not api_key:
        print("BREVO_API_KEY is not configured in .env. Skipping transactional email.")
        return False

    try:
        # 1. Fetch customer details
        user_id = order.get('userId')
        customers = sheets_db.get_all('customers')
        customer = next((c for c in customers if c['id'] == user_id), None)
        
        to_email = customer['email'] if customer else None
        if not to_email:
            print(f"No customer email found for userId: {user_id}. Skipping email dispatch.")
            return False
            
        to_name = customer['name'] if customer else order.get('userName', 'Customer')

        # 2. Fetch address details
        address_id = order.get('addressId')
        addresses = sheets_db.get_all('addresses')
        address = next((a for a in addresses if a['id'] == address_id), None)

        if address:
            addr_line2 = address.get('addressLine2', '')
            addr_line2_html = f"{addr_line2}<br/>" if addr_line2 else ""
            shipping_address_html = f"""
                <strong>{address.get('name', to_name)}</strong><br/>
                {address.get('addressLine1', '')}<br/>
                {addr_line2_html}
                {address.get('city', '')}, {address.get('state', '')} - {address.get('pincode', '')}<br/>
                Phone: {address.get('phone', '')}
            """
        else:
            shipping_address_html = "Address details not available"

        # 3. Format items
        items_rows_html = ""
        for item in order.get('items', []):
            item_total = int(item.get('qty', 0)) * float(item.get('price', 0))
            items_rows_html += f"""
            <tr style="border-bottom: 1px solid #EEEEEE;">
                <td style="padding: 12px 10px; text-align: left;">
                    <div style="font-weight: bold; color: #1A1A2E;">{item.get('productName', '')}</div>
                    <div style="font-size: 12px; color: #777;">Color: {item.get('color', '')}</div>
                </td>
                <td style="padding: 12px 10px; text-align: center; color: #555;">{item.get('size', '')}</td>
                <td style="padding: 12px 10px; text-align: center; color: #555;">{item.get('qty', 0)}</td>
                <td style="padding: 12px 10px; text-align: right; color: #555;">₹{item.get('price', 0)}</td>
                <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #1A1A2E;">₹{int(item_total)}</td>
            </tr>
            """

        # Fetch dynamic settings
        try:
            settings = sheets_db.get_settings()
            site_name = settings.get('siteName', 'PSP garments and clothing')
            site_logo = settings.get('logo')
            site_tagline = settings.get('tagline', 'Dress Your Best, Every Day')
            site_email = settings.get('email', 'shanthiprabaa@gmail.com')
            site_address = settings.get('address', 'Delite Building 719, Puliyakulam Road, Dhamu nagar, Coimbatore - 641 045')
            site_phone = settings.get('phone', '8903733144')
            sender_email = os.environ.get("BREVO_SENDER_EMAIL", site_email)
            sender_name = os.environ.get("BREVO_SENDER_NAME", f"{site_name} Support")
        except Exception:
            site_name = 'PSP garments and clothing'
            site_logo = None
            site_tagline = 'Dress Your Best, Every Day'
            site_email = 'shanthiprabaa@gmail.com'
            site_address = 'Delite Building 719, Puliyakulam Road, Dhamu nagar, Coimbatore - 641 045'
            site_phone = '8903733144'
            sender_email = os.environ.get("BREVO_SENDER_EMAIL", "shanthiprabaa@gmail.com")
            sender_name = os.environ.get("BREVO_SENDER_NAME", "PSP garments and clothing Support")

        logo_html = f'<img src="{site_logo}" alt="{site_name}" style="max-height: 80px; margin-bottom: 10px;" />' if site_logo else f'<h1 style="color: #1A1A2E; margin: 0; font-family: \'Playfair Display\', Georgia, serif; font-size: 32px; letter-spacing: 1px;">{site_name}</h1>'

        # 4. Formulate event-specific messaging
        if event_type == 'placed':
            subject = f"Your Order has been Placed - {site_name}"
            title_message = "Thank you for your order!"
            body_message = "Your order has been received and is currently being processed. Here are your invoice details:"
            order_status = "placed"
        else:
            subject = f"Your Order has been Delivered - {site_name}"
            title_message = "Your order has been delivered!"
            body_message = "Great news! Your order has been delivered successfully. Thank you for shopping with us! Here are your invoice details:"
            order_status = "delivered"

        # 5. Format pricing summary
        subtotal = order.get('subtotal', 0)
        discount = order.get('discount', 0)
        shipping = order.get('shipping', 0)
        total = order.get('total', 0)

        discount_row_html = ""
        if discount and float(discount) > 0:
            discount_row_html = f"""
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #EEEEEE; color: #DC2626;">Discount:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #EEEEEE; color: #DC2626;">-₹{int(float(discount))}</td>
            </tr>
            """

        # 6. Format order status badge colors
        if order_status == 'delivered':
            status_bg = "#D1FAE5"
            status_fg = "#059669"
        else:
            status_bg = "#FEF3C7"
            status_fg = "#D97706"

        payment_method_raw = order.get('paymentMethod', '')
        payment_method = "Google Pay / UPI" if payment_method_raw == 'gpay' else "Cash on Delivery"

        # 7. Form HTML body
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; background-color: #F5F0EB; padding: 40px 20px; margin: 0;">
            <div style="max-width: 650px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                    {logo_html}
                    <p style="color: #E8B86D; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">{site_tagline}</p>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #EAEAEA; margin: 25px 0;" />
                
                <!-- Status / Greeting -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1A1A2E; font-size: 20px; margin-top: 0;">{title_message}</h2>
                    <p style="font-size: 15px; color: #555;">Dear <strong>{to_name}</strong>,</p>
                    <p style="font-size: 14px; color: #555;">{body_message}</p>
                </div>
                
                <!-- Order & Invoice Meta Info -->
                <div style="background-color: #F9F9F9; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #EEEEEE;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555;">
                        <tr>
                            <td style="padding: 4px 0; width: 50%;"><strong>Order ID:</strong> #{order.get('id', '')}</td>
                            <td style="padding: 4px 0; width: 50%;"><strong>Date:</strong> {order.get('createdAt', '')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0;"><strong>Payment Method:</strong> {payment_method}</td>
                            <td style="padding: 4px 0;"><strong>Order Status:</strong> <span style="background-color: {status_bg}; color: {status_fg}; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">{order_status}</span></td>
                        </tr>
                    </table>
                </div>
                
                <!-- Shipping Address -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1A1A2E; font-size: 16px; border-bottom: 2px solid #1A1A2E; padding-bottom: 8px; margin-bottom: 15px;">Shipping Destination</h3>
                    <div style="font-size: 14px; color: #555; line-height: 1.5; background-color: #FCFAF8; padding: 15px; border-left: 4px solid #E8B86D; border-radius: 0 8px 8px 0;">
                        {shipping_address_html}
                    </div>
                </div>
                
                <!-- Itemized Products Table -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1A1A2E; font-size: 16px; border-bottom: 2px solid #1A1A2E; padding-bottom: 8px; margin-bottom: 15px;">Order Items</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background-color: #1A1A2E; color: #ffffff;">
                                <th style="padding: 10px; text-align: left; border-radius: 4px 0 0 4px;">Product</th>
                                <th style="padding: 10px; text-align: center;">Size</th>
                                <th style="padding: 10px; text-align: center;">Qty</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                                <th style="padding: 10px; text-align: right; border-radius: 0 4px 4px 0;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_rows_html}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pricing Breakdown -->
                <div style="margin-left: auto; max-width: 300px; margin-bottom: 40px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #EEEEEE;">Subtotal:</td>
                            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #EEEEEE;">₹{int(float(subtotal))}</td>
                        </tr>
                        {discount_row_html}
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #EEEEEE;">Shipping:</td>
                            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #EEEEEE;">₹{int(float(shipping))}</td>
                        </tr>
                        <tr style="font-size: 16px; color: #1A1A2E; font-weight: bold;">
                            <td style="padding: 12px 0;">Net Total:</td>
                            <td style="padding: 12px 0; text-align: right;">₹{int(float(total))}</td>
                        </tr>
                    </table>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #EAEAEA; margin: 25px 0;" />
                
                <!-- Footer -->
                <div style="text-align: center; color: #999; font-size: 12px;">
                    <p style="margin: 5px 0;">If you have any questions, please contact our support team at {site_email} or call {site_phone}.</p>
                    <p style="margin: 5px 0; font-weight: bold;">{site_name} • {site_address}</p>
                </div>
            </div>
        </body>
        </html>
        """

        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": api_key,
            "Content-Type": "application/json",
            "accept": "application/json"
        }
        
        data = {
            "sender": {
                "name": sender_name,
                "email": sender_email
            },
            "to": [
                {
                  "email": to_email,
                  "name": to_name
                }
            ],
            "subject": subject,
            "htmlContent": html_content
        }

        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            print(f"Brevo order {event_type} email sent successfully to {to_email}: {res_data}")
            return True
            
    except Exception as e:
        print(f"Error sending order {event_type} email: {e}")
        return False

def send_order_email_async(order, event_type):
    thread = threading.Thread(target=send_order_email, args=(order, event_type))
    thread.start()

@app.route('/api/auth/forgot-password/request', methods=['POST'])
def forgot_password_request():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    customers = sheets_db.get_all('customers')
    user = next((c for c in customers if c['email'].lower() == email.lower()), None)
    if not user:
        return jsonify({"error": "User with this email does not exist"}), 404
        
    otp = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)
    otp_storage[email.lower()] = {
        "otp": otp,
        "expires_at": expires_at
    }
    
    success = send_brevo_email(user['email'], user['name'], otp)
    if success:
        return jsonify({"message": "OTP sent to your email"}), 200
    else:
        # Development/Fallback bypass if Brevo API is down or key is bad
        return jsonify({
            "message": "OTP generated (Brevo API failed/unconfigured)", 
            "otp_fallback": otp
        }), 200

@app.route('/api/auth/forgot-password/verify', methods=['POST'])
def forgot_password_verify():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('newPassword')
    
    if not email or not otp or not new_password:
        return jsonify({"error": "Missing required fields"}), 400
        
    stored_data = otp_storage.get(email.lower())
    if not stored_data:
        return jsonify({"error": "No OTP requested for this email"}), 400
        
    if datetime.datetime.now() > stored_data['expires_at']:
        otp_storage.pop(email.lower(), None)
        return jsonify({"error": "OTP has expired. Please request a new one."}), 400
        
    if stored_data['otp'] != str(otp).strip():
        return jsonify({"error": "Invalid OTP code"}), 400
        
    customers = sheets_db.get_all('customers')
    user = next((c for c in customers if c['email'].lower() == email.lower()), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    success = sheets_db.update('customers', user['id'], {"password": new_password})
    if success:
        otp_storage.pop(email.lower(), None)
        return jsonify({"message": "Password reset successfully"}), 200
        
    return jsonify({"error": "Failed to update password"}), 500

# ==========================================
# ADDRESS MANAGEMENT
# ==========================================

@app.route('/api/auth/addresses/<userId>', methods=['GET'])
def get_addresses(userId):
    all_addresses = sheets_db.get_all('addresses')
    user_addresses = [a for a in all_addresses if a['userId'] == userId]
    return jsonify(user_addresses), 200

@app.route('/api/auth/addresses/add', methods=['POST'])
def add_address():
    data = request.json
    all_addresses = sheets_db.get_all('addresses')
    
    new_addr = {
        "id": get_next_id("a", all_addresses),
        "userId": data.get('userId'),
        "name": data.get('name'),
        "phone": data.get('phone'),
        "addressLine1": data.get('addressLine1'),
        "addressLine2": data.get('addressLine2', ''),
        "city": data.get('city'),
        "state": data.get('state'),
        "pincode": data.get('pincode'),
        "isDefault": data.get('isDefault', False)
    }
    
    # If this is default, remove default flag from others
    if new_addr['isDefault']:
        for addr in all_addresses:
            if addr['userId'] == new_addr['userId'] and addr['isDefault']:
                sheets_db.update('addresses', addr['id'], {"isDefault": False})
                
    sheets_db.save('addresses', new_addr)
    return jsonify(new_addr), 201

# ==========================================
# PRODUCT CATALOG & MEDIA
# ==========================================

@app.route('/api/products', methods=['GET'])
def get_products():
    products = sheets_db.get_all('products')
    return jsonify(products), 200

@app.route('/api/products/add', methods=['POST'])
def add_product():
    data = request.json
    products = sheets_db.get_all('products')
    
    # Process images and videoUrl from base64 to server static files
    images = data.get('images', [])
    processed_images = [save_base64_file(img) for img in images]
    video_url = data.get('videoUrl', '')
    processed_video_url = save_base64_file(video_url) if video_url else ''
    
    new_product = {
        "id": get_next_id("p", products),
        "categoryId": data.get('categoryId'),
        "subcategoryId": data.get('subcategoryId', ''),
        "name": data.get('name'),
        "description": data.get('description', ''),
        "price": data.get('price'),
        "originalPrice": data.get('originalPrice'),
        "colors": data.get('colors', []),
        "colorNames": data.get('colorNames', []),
        "sizes": data.get('sizes', []),
        "images": processed_images,
        "videoUrl": processed_video_url,
        "rating": 0.0,
        "reviewCount": 0,
        "isFeatured": data.get('isFeatured', False),
        "isNew": data.get('isNew', True),
        "status": data.get('status', 'active'),
        "tags": data.get('tags', []),
        "material": data.get('material', '')
    }
    
    sheets_db.save('products', new_product)
    return jsonify(new_product), 201

@app.route('/api/products/update/<id>', methods=['POST'])
def edit_product(id):
    data = request.json
    
    # Process images and videoUrl from base64 if present
    if 'images' in data:
        data['images'] = [save_base64_file(img) for img in data['images']]
    if 'videoUrl' in data:
        data['videoUrl'] = save_base64_file(data['videoUrl'])
        
    success = sheets_db.update('products', id, data)
    if success:
        return jsonify({"message": "Product updated"}), 200
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/products/delete/<id>', methods=['POST'])
def remove_product(id):
    success = sheets_db.delete('products', id)
    if success:
        # Cascade delete matching inventory records
        sheets_db.delete_by_column('inventory', 'productId', id)
        return jsonify({"message": "Product deleted"}), 200
    return jsonify({"error": "Product not found"}), 404

# ==========================================
# CATEGORIES & SUBCATEGORIES
# ==========================================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = sheets_db.get_all('categories')
    subcategories = sheets_db.get_all('subcategories')
    return jsonify({
        "categories": categories,
        "subcategories": subcategories
    }), 200

@app.route('/api/categories/add', methods=['POST'])
def add_category():
    data = request.json
    categories = sheets_db.get_all('categories')
    
    processed_image = save_base64_file(data.get('image', ''))
    
    new_cat = {
        "id": get_next_id("cat", categories),
        "name": data.get('name'),
        "slug": data.get('slug'),
        "image": processed_image,
        "status": data.get('status', 'active')
    }
    sheets_db.save('categories', new_cat)
    return jsonify(new_cat), 201

@app.route('/api/categories/update/<id>', methods=['POST'])
def edit_category(id):
    data = request.json
    if 'image' in data:
        data['image'] = save_base64_file(data['image'])
    success = sheets_db.update('categories', id, data)
    if success:
        return jsonify({"message": "Category updated"}), 200
    return jsonify({"error": "Category not found"}), 404

@app.route('/api/categories/delete/<id>', methods=['POST'])
def remove_category(id):
    success = sheets_db.delete('categories', id)
    if success:
        return jsonify({"message": "Category deleted"}), 200
    return jsonify({"error": "Category not found"}), 404

@app.route('/api/subcategories/add', methods=['POST'])
def add_subcategory():
    data = request.json
    subs = sheets_db.get_all('subcategories')
    new_sub = {
        "id": get_next_id("sub", subs),
        "categoryId": data.get('categoryId'),
        "name": data.get('name'),
        "slug": data.get('slug')
    }
    sheets_db.save('subcategories', new_sub)
    return jsonify(new_sub), 201

@app.route('/api/subcategories/update/<id>', methods=['POST'])
def edit_subcategory(id):
    data = request.json
    success = sheets_db.update('subcategories', id, data)
    if success:
        return jsonify({"message": "Subcategory updated"}), 200
    return jsonify({"error": "Subcategory not found"}), 404

@app.route('/api/subcategories/delete/<id>', methods=['POST'])
def remove_subcategory(id):
    success = sheets_db.delete('subcategories', id)
    if success:
        return jsonify({"message": "Subcategory deleted"}), 200
    return jsonify({"error": "Subcategory not found"}), 404

# ==========================================
# INVENTORY MANAGEMENT
# ==========================================

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    inventory = sheets_db.get_all('inventory')
    products = sheets_db.get_all('products')
    product_ids = {p['id'] for p in products}
    active_inventory = [item for item in inventory if item['productId'] in product_ids]
    return jsonify(active_inventory), 200

@app.route('/api/inventory/update', methods=['POST'])
def update_inventory():
    data = request.json
    product_id = data.get('productId')
    color_name = data.get('colorName')
    size = data.get('size')
    stock = data.get('stock')
    
    inventory = sheets_db.get_all('inventory')
    existing = next((i for i in inventory if i['productId'] == product_id and i['colorName'] == color_name and i['size'] == size), None)
    
    if existing:
        sheets_db.update('inventory', existing['id'], {"stock": stock})
        updated = {**existing, "stock": stock}
    else:
        new_inv = {
            "id": get_next_id("inv", inventory),
            "productId": product_id,
            "colorName": color_name,
            "size": size,
            "stock": stock
        }
        sheets_db.save('inventory', new_inv)
        updated = new_inv
        
    return jsonify(updated), 200

# ==========================================
# BANNERS MANAGEMENT
# ==========================================

@app.route('/api/banners', methods=['GET'])
def get_banners():
    banners = sheets_db.get_all('banners')
    return jsonify(banners), 200

@app.route('/api/banners/add', methods=['POST'])
def add_banner():
    data = request.json
    banners = sheets_db.get_all('banners')
    
    processed_image = save_base64_file(data.get('image', ''))
    
    new_banner = {
        "id": get_next_id("b", banners),
        "title": data.get('title'),
        "subtitle": data.get('subtitle', ''),
        "cta": data.get('cta', 'Shop Now'),
        "ctaLink": data.get('ctaLink', '/'),
        "image": processed_image,
        "bgColor": data.get('bgColor', '#1A1A2E'),
        "textColor": data.get('textColor', '#FFFFFF'),
        "status": data.get('status', 'active'),
        "order": data.get('order', len(banners) + 1)
    }
    sheets_db.save('banners', new_banner)
    return jsonify(new_banner), 201

@app.route('/api/banners/update/<id>', methods=['POST'])
def edit_banner(id):
    data = request.json
    if 'image' in data:
        data['image'] = save_base64_file(data['image'])
    success = sheets_db.update('banners', id, data)
    if success:
        return jsonify({"message": "Banner updated"}), 200
    return jsonify({"error": "Banner not found"}), 404

@app.route('/api/banners/delete/<id>', methods=['POST'])
def remove_banner(id):
    success = sheets_db.delete('banners', id)
    if success:
        return jsonify({"message": "Banner deleted"}), 200
    return jsonify({"error": "Banner not found"}), 404

# ==========================================
# COUPON CODES
# ==========================================

@app.route('/api/coupons', methods=['GET'])
def get_coupons():
    coupons = sheets_db.get_all('coupons')
    return jsonify(coupons), 200

@app.route('/api/coupons/add', methods=['POST'])
def add_coupon():
    data = request.json
    coupons = sheets_db.get_all('coupons')
    new_coupon = {
        "id": get_next_id("c", coupons),
        "code": data.get('code').upper(),
        "type": data.get('type', 'percentage'),
        "value": data.get('value'),
        "minOrder": data.get('minOrder', 0),
        "maxUses": data.get('maxUses', 999),
        "usedCount": 0,
        "startsAt": data.get('startsAt', ''),
        "expiresAt": data.get('expiresAt', ''),
        "status": data.get('status', 'active')
    }
    sheets_db.save('coupons', new_coupon)
    return jsonify(new_coupon), 201

@app.route('/api/coupons/update/<id>', methods=['POST'])
def edit_coupon(id):
    data = request.json
    success = sheets_db.update('coupons', id, data)
    if success:
        return jsonify({"message": "Coupon updated"}), 200
    return jsonify({"error": "Coupon not found"}), 404

@app.route('/api/coupons/delete/<id>', methods=['POST'])
def remove_coupon(id):
    success = sheets_db.delete('coupons', id)
    if success:
        return jsonify({"message": "Coupon deleted"}), 200
    return jsonify({"error": "Coupon not found"}), 404

# ==========================================
# CUSTOMER REVIEWS
# ==========================================

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    reviews = sheets_db.get_all('reviews')
    return jsonify(reviews), 200

@app.route('/api/reviews/add', methods=['POST'])
def add_review():
    data = request.json
    reviews = sheets_db.get_all('reviews')
    new_review = {
        "id": get_next_id("r", reviews),
        "productId": data.get('productId'),
        "userId": data.get('userId'),
        "userName": data.get('userName'),
        "rating": data.get('rating', 5),
        "comment": data.get('comment'),
        "createdAt": data.get('createdAt', ''),
        "status": "approved" # Auto-approved immediately
    }
    sheets_db.save('reviews', new_review)
    
    # Recalculate average rating and review count for the product
    prod_id = new_review['productId']
    all_reviews = reviews + [new_review]
    prod_reviews = [r for r in all_reviews if r['productId'] == prod_id and r['status'] == 'approved']
    if prod_reviews:
        avg_rating = sum(r['rating'] for r in prod_reviews) / len(prod_reviews)
        sheets_db.update('products', prod_id, {
            "rating": round(avg_rating, 1),
            "reviewCount": len(prod_reviews)
        })
        
    return jsonify(new_review), 201

@app.route('/api/reviews/status/<id>', methods=['POST'])
def update_review_status(id):
    data = request.json
    status = data.get('status') # approved
    
    success = sheets_db.update('reviews', id, {"status": status})
    if success:
        # Re-calculate product average rating if approved
        reviews = sheets_db.get_all('reviews')
        rev = next((r for r in reviews if r['id'] == id), None)
        if rev and status == 'approved':
            prod_id = rev['productId']
            prod_reviews = [r for r in reviews if r['productId'] == prod_id and r['status'] == 'approved']
            if prod_reviews:
                avg_rating = sum(r['rating'] for r in prod_reviews) / len(prod_reviews)
                sheets_db.update('products', prod_id, {
                    "rating": round(avg_rating, 1),
                    "reviewCount": len(prod_reviews)
                })
        return jsonify({"message": f"Review status updated to {status}"}), 200
    return jsonify({"error": "Review not found"}), 404

@app.route('/api/reviews/delete/<id>', methods=['POST'])
def remove_review(id):
    success = sheets_db.delete('reviews', id)
    if success:
        return jsonify({"message": "Review deleted"}), 200
    return jsonify({"error": "Review not found"}), 404

# ==========================================
# ORDERS SYSTEM
# ==========================================

@app.route('/api/orders/all', methods=['GET'])
def get_all_orders():
    orders = sheets_db.get_all('orders')
    return jsonify(orders), 200

@app.route('/api/orders/user/<userId>', methods=['GET'])
def get_user_orders(userId):
    all_orders = sheets_db.get_all('orders')
    user_orders = [o for o in all_orders if o['userId'] == userId]
    return jsonify(user_orders), 200

@app.route('/api/orders/place', methods=['POST'])
def place_order():
    data = request.json
    orders = sheets_db.get_all('orders')
    
    order_id = get_next_id("ord", orders)
    
    screenshot_data = data.get('paymentScreenshot')
    screenshot_url = None
    if screenshot_data:
        screenshot_url = save_base64_file(screenshot_data)
        
    new_order = {
        "id": order_id,
        "userId": data.get('userId'),
        "userName": data.get('userName'),
        "addressId": data.get('addressId'),
        "items": data.get('items', []),
        "subtotal": data.get('subtotal'),
        "discount": data.get('discount', 0),
        "shipping": data.get('shipping', 0),
        "total": data.get('total'),
        "paymentMethod": data.get('paymentMethod'),
        "paymentStatus": "pending",
        "paymentScreenshot": screenshot_url,
        "status": "pending",
        "trackingId": "",
        "couponCode": data.get('couponCode'),
        "createdAt": data.get('createdAt', ''),
        "updatedAt": data.get('createdAt', '')
    }
    
    # Save the order
    sheets_db.save('orders', new_order)
    
    # Increment Coupon uses if applied
    c_code = data.get('couponCode')
    if c_code:
        coupons = sheets_db.get_all('coupons')
        coupon = next((c for c in coupons if c['code'] == c_code), None)
        if coupon:
            sheets_db.update('coupons', coupon['id'], {"usedCount": coupon['usedCount'] + 1})
            
    # Decrement Inventory stock levels for each item
    inventory = sheets_db.get_all('inventory')
    for item in data.get('items', []):
        p_id = item['productId']
        color = item['color']
        size = item['size']
        qty = item['qty']
        
        inv_item = next((i for i in inventory if i['productId'] == p_id and i['colorName'] == color and i['size'] == size), None)
        if inv_item:
            new_stock = max(0, inv_item['stock'] - qty)
            sheets_db.update('inventory', inv_item['id'], {"stock": new_stock})
            
    # Create Payments record if GPay/UPI
    if new_order['paymentMethod'] == 'gpay':
        payments = sheets_db.get_all('payments')
        new_pay = {
            "id": get_next_id("pay", payments),
            "orderId": order_id,
            "method": "gpay",
            "amount": new_order['total'],
            "screenshot": screenshot_url or "",
            "status": "pending",
            "verifiedAt": ""
        }
        sheets_db.save('payments', new_pay)
        
    try:
        send_order_email_async(new_order, 'placed')
    except Exception as e:
        print(f"Error dispatching order placed email: {e}")
        
    return jsonify(new_order), 201

@app.route('/api/orders/update-status', methods=['POST'])
def update_order_status():
    data = request.json
    order_id = data.get('id')
    status = data.get('status')
    tracking_id = data.get('trackingId', '')
    updated_at = data.get('updatedAt', '')
    
    update_data = {
        "status": status,
        "updatedAt": updated_at
    }
    if tracking_id:
        update_data["trackingId"] = tracking_id
    if 'returnReason' in data:
        update_data["returnReason"] = data.get('returnReason')
    if 'customerReturnReason' in data:
        update_data["customerReturnReason"] = data.get('customerReturnReason')
    if status == 'delivered':
        update_data["paymentStatus"] = "verified"
        
    if status == 'return_approved':
        try:
            # Fetch current order to see if it is already approved to avoid double incrementing
            orders = sheets_db.get_all('orders')
            order = next((o for o in orders if str(o['id']) == str(order_id)), None)
            if order and order.get('status') != 'return_approved':
                inventory = sheets_db.get_all('inventory')
                items = order.get('items', [])
                if isinstance(items, str):
                    try:
                        items = json.loads(items)
                    except Exception:
                        items = []
                for item in items:
                    p_id = item.get('productId')
                    color = item.get('color')
                    size = item.get('size')
                    qty = int(item.get('qty', 0))
                    
                    inv_item = next((i for i in inventory if i['productId'] == p_id and i['colorName'] == color and i['size'] == size), None)
                    if inv_item:
                        new_stock = inv_item['stock'] + qty
                        sheets_db.update('inventory', inv_item['id'], {"stock": new_stock})
        except Exception as e:
            print(f"Error restoring inventory stock on return approval: {e}")
            
    success = sheets_db.update('orders', order_id, update_data)
    if success:
        if status == 'delivered':
            try:
                orders = sheets_db.get_all('orders')
                order = next((o for o in orders if str(o['id']) == str(order_id)), None)
                if order:
                    send_order_email_async(order, 'delivered')
            except Exception as e:
                print(f"Error dispatching order delivered email: {e}")
        return jsonify({"message": f"Order status updated to {status}"}), 200
    return jsonify({"error": "Order not found"}), 404

# ==========================================
# PAYMENTS VERIFICATION
# ==========================================

@app.route('/api/payments', methods=['GET'])
def get_payments():
    # Admin route
    payments = sheets_db.get_all('payments')
    return jsonify(payments), 200

@app.route('/api/payments/screenshot', methods=['POST'])
def upload_screenshot():
    data = request.json
    order_id = data.get('orderId')
    screenshot = data.get('screenshot') # base64 image data
    
    # Update orders screenshot
    orders = sheets_db.get_all('orders')
    order = next((o for o in orders if o['id'] == order_id), None)
    if order:
        sheets_db.update('orders', order_id, {"paymentScreenshot": screenshot})
        
    # Update payments screenshot
    payments = sheets_db.get_all('payments')
    payment = next((p for p in payments if p['orderId'] == order_id), None)
    if payment:
        sheets_db.update('payments', payment['id'], {"screenshot": screenshot})
        return jsonify({"message": "Screenshot uploaded successfully"}), 200
        
    return jsonify({"error": "Payment record not found"}), 404

@app.route('/api/payments/verify', methods=['POST'])
def verify_payment():
    data = request.json
    order_id = data.get('orderId')
    approved = data.get('approved') # boolean
    verified_at = data.get('verifiedAt', '')
    
    status = 'verified' if approved else 'rejected'
    order_status = 'processing' if approved else 'payment_rejected'
    
    # Update payment status
    payments = sheets_db.get_all('payments')
    payment = next((p for p in payments if p['orderId'] == order_id), None)
    if payment:
        sheets_db.update('payments', payment['id'], {
            "status": status,
            "verifiedAt": verified_at
        })
        
    # Update order payment status
    orders = sheets_db.get_all('orders')
    order = next((o for o in orders if o['id'] == order_id), None)
    if order:
        sheets_db.update('orders', order_id, {
            "paymentStatus": status,
            "status": order_status,
            "updatedAt": verified_at
        })
        return jsonify({"message": f"Payment verified successfully as {status}"}), 200
        
    return jsonify({"error": "Order not found"}), 404

# ==========================================
# SITE SETTINGS
# ==========================================

@app.route('/api/settings', methods=['GET'])
def get_site_settings():
    settings = sheets_db.get_settings()
    settings.pop('adminSecurityPin', None)  # Strip out secure PIN from public API
    return jsonify(settings), 200

@app.route('/api/settings/update', methods=['POST'])
def edit_site_settings():
    data = request.json
    
    # Process base64 uploads in settings (logo, upiQrCode, loginBg, etc.)
    processed_data = {}
    for k, v in data.items():
        if k == 'adminSecurityPin':
            continue  # Block changing PIN through generic settings update
        if isinstance(v, str) and (v.startswith("data:image/") or v.startswith("data:video/")):
            processed_data[k] = save_base64_file(v)
        else:
            processed_data[k] = v
            
    sheets_db.update_settings(processed_data)
    return jsonify({"message": "Settings updated"}), 200

# ==========================================
# ACCESS SECURITY PIN MANAGEMENT
# ==========================================

import time
import random

pin_otps = {}

@app.route('/api/settings/request-pin-otp', methods=['POST'])
def request_pin_otp():
    # Send the OTP code to the test email gokulnath96880@gmail.com
    test_email = "gokulnath96880@gmail.com"
    
    otp = str(random.randint(100000, 999999))
    expires_at = time.time() + 300  # 5 minutes validity
    
    pin_otps['active_otp'] = {
        "code": otp,
        "expires_at": expires_at
    }
    
    success = send_pin_otp_email(test_email, otp)
    if success:
        return jsonify({"message": "OTP sent successfully to gokulnath96880@gmail.com"}), 200
    else:
        return jsonify({"error": "Failed to send OTP email"}), 500

@app.route('/api/settings/verify-and-update-pin', methods=['POST'])
def verify_and_update_pin():
    data = request.json
    otp_code = data.get('otp')
    new_pin = data.get('pin')
    
    if not otp_code or not new_pin:
        return jsonify({"error": "OTP and New PIN are required"}), 400
        
    active = pin_otps.get('active_otp')
    if not active:
        return jsonify({"error": "No active OTP found. Please request a new OTP"}), 400
        
    if time.time() > active['expires_at']:
        pin_otps.pop('active_otp', None)
        return jsonify({"error": "OTP has expired. Please request a new one"}), 400
        
    if active['code'] != otp_code:
        return jsonify({"error": "Invalid OTP code"}), 400
        
    # Clear the verified OTP
    pin_otps.pop('active_otp', None)
    
    # Update PIN in settings database
    try:
        sheets_db.update_settings({"adminSecurityPin": str(new_pin)})
        return jsonify({"message": "Security PIN updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to save PIN: {str(e)}"}), 500

@app.route('/api/settings/verify-pin', methods=['POST'])
def verify_admin_pin():
    data = request.json
    entered_pin = data.get('pin')
    
    if not entered_pin:
        return jsonify({"error": "PIN is required"}), 400
        
    try:
        settings = sheets_db.get_settings()
        stored_pin = settings.get('adminSecurityPin', '1234')  # Default PIN is '1234'
        if str(entered_pin) == str(stored_pin):
            return jsonify({"success": True}), 200
        else:
            return jsonify({"success": False, "error": "Invalid security PIN"}), 400
    except Exception as e:
        return jsonify({"error": "Failed to verify PIN"}), 500

# ==========================================
# SERVER INITIATION
# ==========================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
