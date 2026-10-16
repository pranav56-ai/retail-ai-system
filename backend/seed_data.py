import random
import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import User, Product, Transaction

def seed():
    db = SessionLocal()

    # 1. Fetch the first registered user
    user = db.query(User).first()
    if not user:
        print("[!] No user found in database. Please sign up on http://localhost:5173 first!")
        db.close()
        return

    print(f"[*] Seeding data for store: '{user.store_name}' (User ID: {user.id})")

    # 2. Define realistic catalog items
    catalog = [
        # Fast movers / Essentials
        {"name": "Whole Milk 1L", "category": "Dairy", "cost": 48.0, "sell": 60.0, "stock": 14, "min": 20},
        {"name": "Brown Bread 400g", "category": "Bakery", "cost": 30.0, "sell": 45.0, "stock": 10, "min": 18},
        {"name": "Salted Butter 200g", "category": "Dairy", "cost": 90.0, "sell": 115.0, "stock": 8, "min": 15},
        {"name": "Farm Eggs (Tray 12)", "category": "Dairy", "cost": 75.0, "sell": 96.0, "stock": 25, "min": 12},
        {"name": "Assam Tea 500g", "category": "Pantry", "cost": 180.0, "sell": 240.0, "stock": 18, "min": 10},
        {"name": "Refined Sugar 1kg", "category": "Pantry", "cost": 38.0, "sell": 48.0, "stock": 40, "min": 15},
        
        # Snacks & Beverages
        {"name": "Potato Chips 50g", "category": "Snacks", "cost": 14.0, "sell": 20.0, "stock": 55, "min": 20},
        {"name": "Cola Can 330ml", "category": "Beverage", "cost": 28.0, "sell": 40.0, "stock": 35, "min": 15},
        {"name": "Instant Noodles 4-pack", "category": "Packaged Food", "cost": 45.0, "sell": 60.0, "stock": 22, "min": 12},

        # Slow-moving / Dead Stock Candidates
        {"name": "Imported Olive Oil 500ml", "category": "Pantry", "cost": 650.0, "sell": 890.0, "stock": 38, "min": 5},
        {"name": "Organic Almond Butter 200g", "category": "Pantry", "cost": 320.0, "sell": 450.0, "stock": 24, "min": 5},
        {"name": "Gourmet Dark Chocolate 100g", "category": "Snacks", "cost": 160.0, "sell": 220.0, "stock": 30, "min": 8},
    ]

    # Clean existing test data for this user to allow clean reruns
    db.query(Transaction).filter(Transaction.user_id == user.id).delete()
    db.query(Product).filter(Product.user_id == user.id).delete()
    db.commit()

    # Insert products and store references
    product_map = {}
    for item in catalog:
        prod = Product(
            user_id=user.id,
            name=item["name"],
            category=item["category"],
            cost_price=item["cost"],
            selling_price=item["sell"],
            current_stock=item["stock"],
            min_stock_level=item["min"]
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)
        product_map[prod.name] = prod

    print(f"[+] Added {len(catalog)} catalog products.")

    # 3. Generate 6 Months of Transaction Records with Real-world Patterns
    transactions_batch = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)

    # Co-purchase probability groupings (Market Basket Analysis patterns)
    baskets_weights = [
        (["Whole Milk 1L", "Brown Bread 400g"], 0.35),
        (["Whole Milk 1L", "Brown Bread 400g", "Salted Butter 200g"], 0.25),
        (["Assam Tea 500g", "Refined Sugar 1kg"], 0.20),
        (["Potato Chips 50g", "Cola Can 330ml"], 0.25),
        (["Instant Noodles 4-pack", "Cola Can 330ml"], 0.15),
    ]

    current_day = start_date
    while current_day <= end_date:
        # 4 to 12 customer checkouts per day
        daily_baskets = random.randint(4, 12)

        for _ in range(daily_baskets):
            order_id = f"ORD-{current_day.year}-{str(uuid.uuid4())[:8].upper()}"
            selected_products = []

            # Check if an association basket triggers
            for group, prob in baskets_weights:
                if random.random() < prob:
                    selected_products.extend(group)

            # Random individual purchases
            if random.random() < 0.4:
                selected_products.append("Farm Eggs (Tray 12)")
            if random.random() < 0.3:
                selected_products.append("Potato Chips 50g")

            # Dead stock items rarely sell (only ~3% chance)
            if random.random() < 0.03:
                selected_products.append("Imported Olive Oil 500ml")
            if random.random() < 0.02:
                selected_products.append("Organic Almond Butter 200g")

            selected_products = list(set(selected_products))

            timestamp = current_day + timedelta(
                hours=random.randint(9, 21),
                minutes=random.randint(0, 59)
            )

            for prod_name in selected_products:
                prod = product_map.get(prod_name)
                if not prod:
                    continue

                qty = random.choices([1, 2, 3], weights=[0.8, 0.15, 0.05])[0]
                revenue = round(prod.selling_price * qty, 2)

                tx = Transaction(
                    user_id=user.id,
                    product_id=prod.id,
                    order_id=order_id,
                    quantity=qty,
                    unit_price=prod.selling_price,
                    discount_applied=0.0,
                    total_revenue=revenue,
                    timestamp=timestamp
                )
                transactions_batch.append(tx)

        current_day += timedelta(days=1)

    # Bulk save transactions
    db.bulk_save_objects(transactions_batch)
    db.commit()
    print(f"[+] Successfully seeded {len(transactions_batch)} historical transaction records!")
    db.close()

if __name__ == "__main__":
    seed()