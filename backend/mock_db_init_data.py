mockCustomers = [
  {
    "id": "u1", "name": "Admin User", "email": "admin@StyleHaven.com", "password": "admin123",
    "phone": "9876543210", "role": "admin", "status": "active", "createdAt": "2024-01-01",
    "avatar": None
  },
  {
    "id": "u2", "name": "Priya Sharma", "email": "priya@email.com", "password": "pass123",
    "phone": "9876543211", "role": "customer", "status": "active", "createdAt": "2024-02-15",
    "avatar": None
  },
  {
    "id": "u3", "name": "Rahul Verma", "email": "rahul@email.com", "password": "pass123",
    "phone": "9876543212", "role": "customer", "status": "active", "createdAt": "2024-03-10",
    "avatar": None
  },
  {
    "id": "u4", "name": "Anjali Singh", "email": "anjali@email.com", "password": "pass123",
    "phone": "9876543213", "role": "customer", "status": "blocked", "createdAt": "2024-03-20",
    "avatar": None
  }
]

mockAddresses = [
  { "id": "a1", "userId": "u2", "name": "Priya Sharma", "phone": "9876543211", "addressLine1": "12 MG Road", "addressLine2": "Near City Mall", "city": "Bangalore", "state": "Karnataka", "pincode": "560001", "isDefault": True },
  { "id": "a2", "userId": "u3", "name": "Rahul Verma", "phone": "9876543212", "addressLine1": "45 Park Street", "addressLine2": "", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001", "isDefault": True }
]

mockCategories = [
  { "id": "cat1", "name": "Men", "slug": "men", "image": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop", "status": "active" },
  { "id": "cat2", "name": "Women", "slug": "women", "image": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop", "status": "active" },
  { "id": "cat3", "name": "Kids", "slug": "kids", "image": "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=600&auto=format&fit=crop", "status": "active" }
]

mockSubcategories = [
  { "id": "sub1", "categoryId": "cat1", "name": "Shirts", "slug": "shirts" },
  { "id": "sub2", "categoryId": "cat1", "name": "T-Shirts", "slug": "t-shirts" },
  { "id": "sub3", "categoryId": "cat1", "name": "Jeans", "slug": "jeans" },
  { "id": "sub4", "categoryId": "cat1", "name": "Hoodies", "slug": "hoodies" },
  { "id": "sub5", "categoryId": "cat1", "name": "Trousers", "slug": "trousers" },
  { "id": "sub6", "categoryId": "cat2", "name": "Dresses", "slug": "dresses" },
  { "id": "sub7", "categoryId": "cat2", "name": "Tops", "slug": "tops" },
  { "id": "sub8", "categoryId": "cat2", "name": "Skirts", "slug": "skirts" },
  { "id": "sub9", "categoryId": "cat2", "name": "Knitwear", "slug": "knitwear" },
  { "id": "sub10", "categoryId": "cat2", "name": "Jeans", "slug": "jeans-women" },
  { "id": "sub11", "categoryId": "cat3", "name": "Tees", "slug": "kids-tees" },
  { "id": "sub12", "categoryId": "cat3", "name": "Shorts", "slug": "kids-shorts" },
  { "id": "sub13", "categoryId": "cat3", "name": "Sets", "slug": "kids-sets" },
  { "id": "sub14", "categoryId": "cat3", "name": "Dresses", "slug": "kids-dresses" }
]

mockProducts = [
  {
    "id": "p1", "categoryId": "cat1", "subcategoryId": "sub1", "name": "Classic Oxford Shirt",
    "description": "A timeless oxford shirt crafted from 100% premium cotton. Perfect for formal and smart-casual occasions.",
    "price": 1299, "originalPrice": 1899,
    "colors": ["#FFFFFF", "#87CEEB", "#1A1A2E", "#D2B48C"],
    "colorNames": ["White", "Sky Blue", "Navy", "Khaki"],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4f1caa?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "rating": 4.5, "reviewCount": 2, "isFeatured": True, "isNew": False, "status": "active",
    "tags": ["formal", "office", "classic"]
  },
  {
    "id": "p2", "categoryId": "cat1", "subcategoryId": "sub2", "name": "Urban Graphic Tee",
    "description": "A soft, breathable graphic tee with modern urban artwork. Made from combed cotton.",
    "price": 699, "originalPrice": 999,
    "colors": ["#1A1A2E", "#808080", "#FFFFFF", "#556B2F"],
    "colorNames": ["Navy", "Slate", "White", "Olive"],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": True, "isNew": True, "status": "active",
    "tags": ["casual", "graphic", "everyday"]
  },
  {
    "id": "p3", "categoryId": "cat1", "subcategoryId": "sub3", "name": "Slim Fit Dark Jeans",
    "description": "Slim fit jeans with a modern tapered leg. Made from stretch denim for all-day comfort.",
    "price": 1799, "originalPrice": 2499,
    "colors": ["#2C3E50", "#1A1A2E", "#808080"],
    "colorNames": ["Dark Wash", "Black", "Grey"],
    "sizes": ["28", "30", "32", "34", "36"],
    "images": [
      "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": False, "isNew": False, "status": "active",
    "tags": ["denim", "slim", "everyday"]
  },
  {
    "id": "p4", "categoryId": "cat1", "subcategoryId": "sub4", "name": "Premium Zip Hoodie",
    "description": "Soft-fleece hoodie with zip front closure and kangaroo pockets. Ideal for casual outings.",
    "price": 1599, "originalPrice": 2199,
    "colors": ["#1A1A2E", "#808080", "#556B2F", "#A0522D"],
    "colorNames": ["Navy", "Charcoal", "Olive", "Brown"],
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "images": [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": True, "isNew": False, "status": "active",
    "tags": ["hoodie", "casual", "winter"]
  },
  {
    "id": "p5", "categoryId": "cat1", "subcategoryId": "sub5", "name": "Linen Chino Trousers",
    "description": "Lightweight linen blend chinos for warm weather. Features side pockets and a relaxed straight fit.",
    "price": 1399, "originalPrice": 1899,
    "colors": ["#F5F0EB", "#D2B48C", "#808080", "#1A1A2E"],
    "colorNames": ["Cream", "Khaki", "Light Grey", "Navy"],
    "sizes": ["28", "30", "32", "34", "36"],
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": False, "isNew": True, "status": "active",
    "tags": ["linen", "chino", "smart-casual"]
  },
  {
    "id": "p6", "categoryId": "cat2", "subcategoryId": "sub6", "name": "Floral Midi Dress",
    "description": "A beautiful floral print midi dress with a flared skirt and cinched waist. Perfect for any occasion.",
    "price": 1999, "originalPrice": 2799,
    "colors": ["#FF69B4", "#87CEEB", "#FFF8DC"],
    "colorNames": ["Rose Pink", "Sky Blue", "Cream"],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 5.0, "reviewCount": 1, "isFeatured": True, "isNew": False, "status": "active",
    "tags": ["floral", "midi", "summer"]
  },
  {
    "id": "p7", "categoryId": "cat2", "subcategoryId": "sub7", "name": "Linen Tie-Front Top",
    "description": "Effortlessly chic linen blend top with a front tie knot. Breathable and light for warm weather.",
    "price": 899, "originalPrice": 1299,
    "colors": ["#FFFFFF", "#FF69B4", "#E8B86D", "#87CEEB"],
    "colorNames": ["White", "Pink", "Mustard", "Blue"],
    "sizes": ["XS", "S", "M", "L"],
    "images": [
      "https://images.unsplash.com/photo-1583496661160-fb5218f5bec0?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": False, "isNew": True, "status": "active",
    "tags": ["tops", "linen", "casual"]
  },
  {
    "id": "p8", "categoryId": "cat2", "subcategoryId": "sub8", "name": "Pleated Mini Skirt",
    "description": "A stylish pleated mini skirt that transitions effortlessly from day to night. Available in bold colors.",
    "price": 1099, "originalPrice": 1499,
    "colors": ["#1A1A2E", "#808080", "#FF69B4", "#F5F0EB"],
    "colorNames": ["Black", "Grey", "Pink", "Cream"],
    "sizes": ["XS", "S", "M", "L"],
    "images": [
      "https://images.unsplash.com/photo-1582142839970-2b9e04b60f65?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": False, "isNew": False, "status": "active",
    "tags": ["skirt", "mini", "trendy"]
  },
  {
    "id": "p9", "categoryId": "cat2", "subcategoryId": "sub9", "name": "Cable Knit Sweater",
    "description": "A cozy cable-knit sweater with a relaxed fit and ribbed edges. Made from soft acrylic blend.",
    "price": 1699, "originalPrice": 2299,
    "colors": ["#F5F0EB", "#D2B48C", "#87CEEB", "#1A1A2E"],
    "colorNames": ["Cream", "Camel", "Blue", "Navy"],
    "sizes": ["XS", "S", "M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": True, "isNew": False, "status": "active",
    "tags": ["knit", "sweater", "winter"]
  },
  {
    "id": "p10", "categoryId": "cat2", "subcategoryId": "sub10", "name": "High-Rise Skinny Jeans",
    "description": "Flattering high-rise skinny jeans with a hint of stretch for comfortable all-day wear.",
    "price": 1899, "originalPrice": 2599,
    "colors": ["#2C3E50", "#1A1A2E", "#808080"],
    "colorNames": ["Dark Blue", "Black", "Grey"],
    "sizes": ["24", "26", "28", "30", "32"],
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": True, "isNew": False, "status": "active",
    "tags": ["jeans", "skinny", "high-rise"]
  },
  {
    "id": "p11", "categoryId": "cat3", "subcategoryId": "sub11", "name": "Dino Print Kids Tee",
    "description": "Fun and vibrant dinosaur print tee for little adventurers. Soft cotton for all-day play.",
    "price": 499, "originalPrice": 699,
    "colors": ["#87CEEB", "#FFF8DC", "#FF69B4"],
    "colorNames": ["Blue", "Yellow", "Pink"],
    "sizes": ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    "images": [
      "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558171813-36bf28b71d0f?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 5.0, "reviewCount": 1, "isFeatured": True, "isNew": False, "status": "active",
    "tags": ["kids", "casual", "fun"]
  },
  {
    "id": "p12", "categoryId": "cat3", "subcategoryId": "sub12", "name": "Cargo Shorts Set",
    "description": "Comfortable and durable cargo shorts for active kids. Features multiple pockets and elastic waistband.",
    "price": 699, "originalPrice": 999,
    "colors": ["#556B2F", "#D2B48C", "#808080"],
    "colorNames": ["Olive", "Khaki", "Grey"],
    "sizes": ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    "images": [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": False, "isNew": True, "status": "active",
    "tags": ["kids", "shorts", "casual"]
  },
  {
    "id": "p13", "categoryId": "cat3", "subcategoryId": "sub13", "name": "Striped Coord Set",
    "description": "Cute matching top and pants set in classic stripes. Perfect for school and outings.",
    "price": 899, "originalPrice": 1299,
    "colors": ["#87CEEB", "#FF69B4", "#F5F0EB"],
    "colorNames": ["Blue Stripe", "Pink Stripe", "Cream Stripe"],
    "sizes": ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    "images": [
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1471286174890-9c112ac6823b?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": True, "isNew": False, "status": "active",
    "tags": ["kids", "set", "stripes"]
  },
  {
    "id": "p14", "categoryId": "cat3", "subcategoryId": "sub14", "name": "Frilly Princess Dress",
    "description": "Adorable frilly dress for little princesses. Available in pastel colors for birthday parties.",
    "price": 1199, "originalPrice": 1699,
    "colors": ["#FF69B4", "#87CEEB", "#E8B86D"],
    "colorNames": ["Pink", "Lilac", "Yellow"],
    "sizes": ["2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    "images": [
      "https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=600&auto=format&fit=crop"
    ],
    "videoUrl": "",
    "rating": 0.0, "reviewCount": 0, "isFeatured": False, "isNew": True, "status": "active",
    "tags": ["kids", "girls", "dress", "party"]
  }
]

mockInventory = [
  { "id": "inv1", "productId": "p1", "colorName": "White", "size": "S", "stock": 15 },
  { "id": "inv2", "productId": "p1", "colorName": "White", "size": "M", "stock": 23 },
  { "id": "inv3", "productId": "p1", "colorName": "White", "size": "L", "stock": 8 },
  { "id": "inv4", "productId": "p1", "colorName": "Navy", "size": "M", "stock": 3 },
  { "id": "inv5", "productId": "p1", "colorName": "Navy", "size": "L", "stock": 0 },
  { "id": "inv6", "productId": "p2", "colorName": "Navy", "size": "M", "stock": 30 },
  { "id": "inv7", "productId": "p2", "colorName": "Slate", "size": "L", "stock": 2 },
  { "id": "inv8", "productId": "p3", "colorName": "Dark Wash", "size": "32", "stock": 18 },
  { "id": "inv9", "productId": "p4", "colorName": "Navy", "size": "L", "stock": 12 },
  { "id": "inv10", "productId": "p6", "colorName": "Rose Pink", "size": "S", "stock": 9 },
  { "id": "inv11", "productId": "p6", "colorName": "Rose Pink", "size": "M", "stock": 14 },
  { "id": "inv12", "productId": "p7", "colorName": "White", "size": "S", "stock": 0 },
  { "id": "inv13", "productId": "p11", "colorName": "Blue", "size": "4-5Y", "stock": 20 },
  { "id": "inv14", "productId": "p13", "colorName": "Blue Stripe", "size": "3-4Y", "stock": 5 }
]

mockBanners = [
  {
    "id": "b1", "title": "New Season Arrivals", "subtitle": "Explore the latest trends in Men's fashion", "cta": "Shop Men", "ctaLink": "/category/men",
    "image": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop",
    "bgColor": "#1A1A2E", "textColor": "#FFFFFF", "status": "active", "order": 1
  },
  {
    "id": "b2", "title": "Summer Collection", "subtitle": "Light, breezy styles made for sunny days", "cta": "Shop Women", "ctaLink": "/category/women",
    "image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop",
    "bgColor": "#F5F0EB", "textColor": "#1A1A2E", "status": "active", "order": 2
  },
  {
    "id": "b3", "title": "Kids' Favourites", "subtitle": "Comfortable & playful styles for little ones", "cta": "Shop Kids", "ctaLink": "/category/kids",
    "image": "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1200&auto=format&fit=crop",
    "bgColor": "#E8B86D", "textColor": "#1A1A2E", "status": "active", "order": 3
  }
]

mockCoupons = [
  { "id": "c1", "code": "WELCOME10", "type": "percentage", "value": 10, "minOrder": 500, "maxUses": 1000, "usedCount": 234, "startsAt": "2024-01-01", "expiresAt": "2025-12-31", "status": "active" },
  { "id": "c2", "code": "FLAT200", "type": "fixed", "value": 200, "minOrder": 1500, "maxUses": 500, "usedCount": 87, "startsAt": "2024-01-01", "expiresAt": "2025-12-31", "status": "active" },
  { "id": "c3", "code": "FREESHIP", "type": "shipping", "value": 100, "minOrder": 999, "maxUses": 2000, "usedCount": 412, "startsAt": "2024-01-01", "expiresAt": "2025-09-30", "status": "active" },
  { "id": "c4", "code": "SUMMER20", "type": "percentage", "value": 20, "minOrder": 1000, "maxUses": 300, "usedCount": 298, "startsAt": "2024-01-01", "expiresAt": "2025-08-31", "status": "inactive" }
]

mockReviews = [
  { "id": "r1", "productId": "p1", "userId": "u2", "userName": "Priya S.", "rating": 5, "comment": "Absolutely love this shirt! Great quality and perfect fit.", "createdAt": "2024-04-10", "status": "approved" },
  { "id": "r2", "productId": "p1", "userId": "u3", "userName": "Rahul V.", "rating": 4, "comment": "Good quality fabric. The sizing runs a bit large.", "createdAt": "2024-04-15", "status": "approved" },
  { "id": "r3", "productId": "p6", "userId": "u2", "userName": "Priya S.", "rating": 5, "comment": "Beautiful dress! Got so many compliments. Highly recommend!", "createdAt": "2024-05-01", "status": "approved" },
  { "id": "r4", "productId": "p4", "userId": "u3", "userName": "Rahul V.", "rating": 4, "comment": "Very comfortable hoodie. Warm and cozy for winters.", "createdAt": "2024-05-10", "status": "pending" },
  { "id": "r5", "productId": "p11", "userId": "u2", "userName": "Priya S.", "rating": 5, "comment": "My son loves this tee! He wears it every day.", "createdAt": "2024-05-20", "status": "approved" }
]

mockOrders = [
  {
    "id": "ord1", "userId": "u2", "userName": "Priya Sharma", "addressId": "a1",
    "items": [
      { "productId": "p6", "productName": "Floral Midi Dress", "size": "M", "color": "Rose Pink", "qty": 1, "price": 1999 },
      { "productId": "p7", "productName": "Linen Tie-Front Top", "size": "S", "color": "White", "qty": 2, "price": 899 }
    ],
    "subtotal": 3797, "discount": 0, "shipping": 99, "total": 3896,
    "paymentMethod": "gpay", "paymentStatus": "verified", "paymentScreenshot": None,
    "status": "shipped", "trackingId": "TRK123456789", "couponCode": None,
    "createdAt": "2024-05-25", "updatedAt": "2024-05-27"
  },
  {
    "id": "ord2", "userId": "u3", "userName": "Rahul Verma", "addressId": "a2",
    "items": [
      { "productId": "p1", "productName": "Classic Oxford Shirt", "size": "L", "color": "Navy", "qty": 1, "price": 1299 },
      { "productId": "p3", "productName": "Slim Fit Dark Jeans", "size": "32", "color": "Dark Wash", "qty": 1, "price": 1799 }
    ],
    "subtotal": 3098, "discount": 310, "shipping": 0, "total": 2788,
    "paymentMethod": "cod", "paymentStatus": "pending", "paymentScreenshot": None,
    "status": "processing", "trackingId": None, "couponCode": "WELCOME10",
    "createdAt": "2024-05-28", "updatedAt": "2024-05-28"
  },
  {
    "id": "ord3", "userId": "u2", "userName": "Priya Sharma", "addressId": "a1",
    "items": [
      { "productId": "p13", "productName": "Striped Coord Set", "size": "4-5Y", "color": "Blue Stripe", "qty": 1, "price": 899 }
    ],
    "subtotal": 899, "discount": 0, "shipping": 99, "total": 998,
    "paymentMethod": "gpay", "paymentStatus": "pending", "paymentScreenshot": None,
    "status": "pending", "trackingId": None, "couponCode": None,
    "createdAt": "2024-06-01", "updatedAt": "2024-06-01"
  }
]

mockPayments = [
  { "id": "pay1", "orderId": "ord1", "method": "gpay", "amount": 3896, "screenshot": None, "status": "verified", "verifiedAt": "2024-05-25" },
  { "id": "pay2", "orderId": "ord3", "method": "gpay", "amount": 998, "screenshot": None, "status": "pending", "verifiedAt": None }
]

mockSettings = {
  "siteName": "PSP garments and clothing",
  "logo": "https://ujfgmnwydzonuggcsehz.supabase.co/storage/v1/object/public/uploads/logo_bf961e2dd970470786fd63943c39fcaa.jpg",
  "loginImage": None,
  "tagline": "Dress Your Best, Every Day",
  "phone": "8903733144",
  "whatsapp": "7708533144",
  "email": "shanthiprabaa@gmail.com",
  "address": "Delite Building 719, Puliyakulam Road, Dhamu nagar, Coimbatore - 641 045",
  "gpayUPI": "stylehaven@upi",
  "gpayQR": None,
  "socialLinks": {
    "instagram": "https://instagram.com/stylehaven",
    "facebook": "https://facebook.com/stylehaven",
    "twitter": "https://twitter.com/stylehaven",
    "youtube": "https://youtube.com/stylehaven"
  },
  "shippingCharge": 99,
  "freeShippingAbove": 999,
  "privacyPolicy": "Your privacy is important to us...",
  "returnPolicy": "We accept returns within 7 days of delivery...",
  "termsAndConditions": "By using our website, you agree to our terms...",
  "promoText": "Use code WELCOME10 for 10% off",
  "promoBannerBadge": "Limited Time Offer",
  "promoBannerTitle": "Up to 40% Off",
  "promoBannerText": "Explore our curated collection of premium styles at unbeatable prices.",
  "promoBannerBtn": "Shop the Sale",
  "promoBannerLink": "/sale",
  "sizeGuide": [
    { "size": "S", "chest": "38 in", "length": "27 in", "shoulder": "17.5 in" },
    { "size": "M", "chest": "40 in", "length": "28 in", "shoulder": "18 in" },
    { "size": "L", "chest": "42 in", "length": "29 in", "shoulder": "18.5 in" },
    { "size": "XL", "chest": "44 in", "length": "30 in", "shoulder": "19 in" },
    { "size": "XXL", "chest": "46 in", "length": "30.5 in", "shoulder": "19.5 in" }
  ]
}
