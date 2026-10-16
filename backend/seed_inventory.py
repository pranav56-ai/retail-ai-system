import os
import random
import uuid
from datetime import datetime, timedelta, timezone

from app.database import SessionLocal, engine
from app.models import User, Product, Transaction, Base

ITEMS = [
    {
        "name": "Amul Taaza Toned Milk 1L",
        "category": "Dairy",
        "cost_price": 52.00,
        "selling_price": 56.00,
        "current_stock": 4,
        "min_stock_level": 10,
        "barcode": "8901262010052",
    },
    {
        "name": "Britannia 100% Whole Wheat Bread 400g",
        "category": "Bakery",
        "cost_price": 38.00,
        "selling_price": 50.00,
        "current_stock": 3,
        "min_stock_level": 8,
        "barcode": "8901063142211",
    },
    {
        "name": "Tata Salt Vacuum Evaporated 1kg",
        "category": "Staples",
        "cost_price": 22.00,
        "selling_price": 28.00,
        "current_stock": 24,
        "min_stock_level": 10,
        "barcode": "8901072002474",
    },
    {
        "name": "Aashirvaad Shudh Chakki Atta 5kg",
        "category": "Staples",
        "cost_price": 210.00,
        "selling_price": 255.00,
        "current_stock": 5,
        "min_stock_level": 8,
        "barcode": "8901725181222",
    },
    {
        "name": "Maggi 2-Minute Masala Noodles 280g",
        "category": "Instant Foods",
        "cost_price": 42.00,
        "selling_price": 50.00,
        "current_stock": 35,
        "min_stock_level": 12,
        "barcode": "8901058852418",
    },
    {
        "name": "Coca-Cola Original 750ml PET",
        "category": "Beverages",
        "cost_price": 32.00,
        "selling_price": 45.00,
        "current_stock": 2,
        "min_stock_level": 10,
        "barcode": "8901764012211",
    },
    {
        "name": "Parle-G Gold Biscuits 1kg",
        "category": "Snacks",
        "cost_price": 110.00,
        "selling_price": 140.00,
        "current_stock": 18,
        "min_stock_level": 6,
        "barcode": "8901719101038",
    },
    {
        "name": "Surf Excel Quick Wash Detergent 1kg",
        "category": "Household",
        "cost_price": 165.00,
        "selling_price": 210.00,
        "current_stock": 12,
        "min_stock_level": 5,
        "barcode": "8901030383726",
    },
    {
        "name": "Dettol Original Bathing Soap 125g",
        "category": "Personal Care",
        "cost_price": 45.00,
        "selling_price": 60.00,
        "current_stock": 28,
        "min_stock_level": 10,
        "barcode": "8901396388214",
    },
    {
        "name": "Fortune Sunlite Refined Sunflower Oil 1L",
        "category": "Staples",
        "cost_price": 130.00,
        "selling_price": 155.00,
        "current_stock": 3,
        "min_stock_level": 10,
        "barcode": "8906007280014",
    },
    {
        "name": "Tata Tea Premium 500g",
        "category": "Beverages",
        "cost_price": 210.00,
        "selling_price": 250.00,
        "current_stock": 18,
        "min_stock_level": 8,
        "barcode": "8901052002154",
    },
    {
        "name": "Cadbury Dairy Milk Silk 130g",
        "category": "Confectionery",
        "cost_price": 82.00,
        "selling_price": 100.00,
        "current_stock": 5,
        "min_stock_level": 10,
        "barcode": "8901233024017",
    },
    {
        "name": "Colgate MaxFresh Blue Gel 150g",
        "category": "Personal Care",
        "cost_price": 95.00,
        "selling_price": 120.00,
        "current_stock": 22,
        "min_stock_level": 6,
        "barcode": "8901314010524",
    },
    {
        "name": "Lays Classic Salted Potato Chips 52g",
        "category": "Snacks",
        "cost_price": 16.00,
        "selling_price": 20.00,
        "current_stock": 40,
        "min_stock_level": 15,
        "barcode": "8901491101831",
    },
    {
        "name": "Kissan Fresh Tomato Ketchup 1kg",
        "category": "Condiments",
        "cost_price": 115.00,
        "selling_price": 145.00,
        "current_stock": 3,
        "min_stock_level": 8,
        "barcode": "8901030362141",
    },
]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        users = db.query(User).all()
        if not users:
            # Create default admin user if none exists
            from app.auth import get_password_hash
            default_user = User(
                store_name="Metro Supermarket",
                email="admin@store.com",
                hashed_password=get_password_hash("password123"),
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            users = [default_user]

        print(f"Targeting {len(users)} user account(s)...")

        for user in users:
            print(f"\n--- Importing inventory for Store: {user.store_name} (User ID: {user.id}) ---")
            
            created_products = []
            for item in ITEMS:
                # Check for existing product by barcode or name
                prod = None
                if item["barcode"]:
                    prod = db.query(Product).filter(
                        Product.barcode == item["barcode"],
                        Product.user_id == user.id
                    ).first()
                if not prod:
                    prod = db.query(Product).filter(
                        Product.name == item["name"],
                        Product.user_id == user.id
                    ).first()

                if prod:
                    prod.category = item["category"]
                    prod.cost_price = item["cost_price"]
                    prod.selling_price = item["selling_price"]
                    prod.current_stock = item["current_stock"]
                    prod.min_stock_level = item["min_stock_level"]
                    prod.barcode = item["barcode"]
                    print(f"Updated: {prod.name} (Stock: {prod.current_stock})")
                else:
                    prod = Product(
                        user_id=user.id,
                        name=item["name"],
                        category=item["category"],
                        cost_price=item["cost_price"],
                        selling_price=item["selling_price"],
                        current_stock=item["current_stock"],
                        min_stock_level=item["min_stock_level"],
                        barcode=item["barcode"],
                    )
                    db.add(prod)
                    print(f"Created: {prod.name} (Stock: {prod.current_stock})")
                
                created_products.append(prod)

            db.commit()
            for p in created_products:
                db.refresh(p)

            # Generate realistic multi-basket transaction history for Apriori association mining
            print("Generating association transactions...")
            # Clear old transactions for clean Apriori training
            db.query(Transaction).filter(Transaction.user_id == user.id).delete()
            db.commit()

            # Define strong complementary pairs for Apriori lift
            prod_lookup_by_name = {p.name: p for p in created_products}
            
            co_pairs = [
                ("Britannia 100% Whole Wheat Bread 400g", "Amul Taaza Toned Milk 1L"),
                ("Maggi 2-Minute Masala Noodles 280g", "Kissan Fresh Tomato Ketchup 1kg"),
                ("Tata Tea Premium 500g", "Parle-G Gold Biscuits 1kg"),
                ("Coca-Cola Original 750ml PET", "Lays Classic Salted Potato Chips 52g"),
                ("Aashirvaad Shudh Chakki Atta 5kg", "Fortune Sunlite Refined Sunflower Oil 1L"),
                ("Aashirvaad Shudh Chakki Atta 5kg", "Tata Salt Vacuum Evaporated 1kg"),
                ("Surf Excel Quick Wash Detergent 1kg", "Dettol Original Bathing Soap 125g"),
            ]

            tx_records = []
            now = datetime.now(timezone.utc)

            for order_idx in range(60):
                order_time = now - timedelta(days=random.randint(1, 90), hours=random.randint(1, 12))
                order_id = f"ORD-{order_time.year}-{1000 + order_idx:05d}"
                
                # Pick a co-purchase combo with 70% probability
                if random.random() < 0.70:
                    pair = random.choice(co_pairs)
                    item_a = prod_lookup_by_name.get(pair[0])
                    item_b = prod_lookup_by_name.get(pair[1])
                    if item_a and item_b:
                        qty_a = random.randint(1, 2)
                        tx_records.append(Transaction(
                            user_id=user.id,
                            product_id=item_a.id,
                            order_id=order_id,
                            quantity=qty_a,
                            unit_price=item_a.selling_price,
                            discount_applied=0.0,
                            total_revenue=round(item_a.selling_price * qty_a, 2),
                            timestamp=order_time
                        ))
                        qty_b = random.randint(1, 2)
                        tx_records.append(Transaction(
                            user_id=user.id,
                            product_id=item_b.id,
                            order_id=order_id,
                            quantity=qty_b,
                            unit_price=item_b.selling_price,
                            discount_applied=0.0,
                            total_revenue=round(item_b.selling_price * qty_b, 2),
                            timestamp=order_time
                        ))

                # Add 1-2 random items
                extra_items = random.sample(created_products, k=random.randint(1, 2))
                for extra in extra_items:
                    qty_e = random.randint(1, 3)
                    tx_records.append(Transaction(
                        user_id=user.id,
                        product_id=extra.id,
                        order_id=order_id,
                        quantity=qty_e,
                        unit_price=extra.selling_price,
                        discount_applied=0.0,
                        total_revenue=round(extra.selling_price * qty_e, 2),
                        timestamp=order_time
                    ))

            db.bulk_save_objects(tx_records)
            db.commit()
            print(f"Successfully generated {len(tx_records)} basket transactions for {user.store_name}!")

        print("\n>>> SUCCESS: All 15 inventory items and transactions added to retail.db!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
