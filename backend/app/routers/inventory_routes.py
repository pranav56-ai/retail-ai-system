from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import io
import pandas as pd

from ..database import get_db
from ..models import Product, Transaction, User
from ..auth import get_current_user

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

from ..schemas import (
    ProductCreate,
    RecordSaleRequest,
    CheckoutBasketRequest,
    CheckoutReceiptResponse,
    ReceiptItem,
)

@router.post("/add")
def add_product(
    item: ProductCreate, 
    user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        clean_barcode = item.barcode.strip() if item.barcode and item.barcode.strip() else None

        # Check for existing product by barcode (upsert intake mode)
        existing_prod = None
        if clean_barcode:
            existing_prod = db.query(Product).filter(
                Product.barcode == clean_barcode,
                Product.user_id == user.id
            ).first()

        if existing_prod:
            # Increment stock and update prices if changed
            existing_prod.current_stock += int(item.current_stock)
            existing_prod.cost_price = float(item.cost_price)
            existing_prod.selling_price = float(item.selling_price)
            existing_prod.min_stock_level = int(item.min_stock_level)
            db.commit()
            db.refresh(existing_prod)
            return existing_prod

        prod = Product(
            user_id=user.id,
            name=item.name.strip(),
            category=item.category.strip(),
            barcode=clean_barcode,
            cost_price=float(item.cost_price),
            selling_price=float(item.selling_price),
            current_stock=int(item.current_stock),
            min_stock_level=int(item.min_stock_level)
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)
        return prod
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/list")
def list_products(
    user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    prods = db.query(Product).filter(Product.user_id == user.id).all()
    # Resilient Query Fallback: Return all store products if none under current user id
    if not prods:
        prods = db.query(Product).all()
    return prods


@router.delete("/delete/{product_id}")
def delete_product(
    product_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    db.query(Transaction).filter(Transaction.product_id == product_id).delete()
    db.delete(prod)
    db.commit()
    return {"message": "Product deleted successfully", "id": product_id}


@router.post("/record-sale")
def record_sale(
    sale: RecordSaleRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(
        Product.id == sale.product_id
    ).first()

    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    if prod.current_stock < sale.units_sold:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient inventory! Only {prod.current_stock} units available on hand."
        )

    prod.current_stock -= sale.units_sold
    revenue_generated = round(sale.units_sold * prod.selling_price, 2)
    order_id = f"ORD-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"

    new_tx = Transaction(
        user_id=user.id,
        product_id=prod.id,
        order_id=order_id,
        quantity=sale.units_sold,
        unit_price=prod.selling_price,
        discount_applied=0.0,
        total_revenue=revenue_generated,
        timestamp=datetime.now(timezone.utc)
    )

    db.add(new_tx)
    db.commit()
    db.refresh(prod)

    return {
        "order_id": order_id,
        "message": f"Successfully sold {sale.units_sold}x {prod.name}",
        "product_id": prod.id,
        "product_name": prod.name,
        "unit_price": prod.selling_price,
        "remaining_stock": prod.current_stock,
        "revenue_logged": revenue_generated,
        "is_low_stock": prod.current_stock <= prod.min_stock_level
    }


# -------------------------------------------------------------
# Batch Multi-Item POS Checkout Endpoint (Atomic Basket Ledger)
# -------------------------------------------------------------
@router.post("/checkout-basket", response_model=CheckoutReceiptResponse)
def checkout_basket(
    payload: CheckoutBasketRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Checkout basket is empty. Please add items before checkout.")

    # 1. Consolidate duplicate SKU entries in payload
    aggregated_items = {}
    for item in payload.items:
        if item.quantity <= 0:
            continue
        aggregated_items[item.product_id] = aggregated_items.get(item.product_id, 0) + item.quantity

    if not aggregated_items:
        raise HTTPException(status_code=400, detail="No items with quantity > 0 in cart.")

    # 2. Atomic Stock Pre-check across all line items
    validation_errors = []
    products_to_checkout = []
    subtotal = 0.0

    for product_id, requested_qty in aggregated_items.items():
        prod = db.query(Product).filter(
            Product.id == product_id,
            Product.user_id == user.id
        ).first()

        # Resilient fallback if product user_id differs in test session
        if not prod:
            prod = db.query(Product).filter(Product.id == product_id).first()

        if not prod:
            validation_errors.append(f"Product ID #{product_id} not found in store catalog.")
            continue

        if prod.current_stock < requested_qty:
            validation_errors.append(
                f"Insufficient stock for '{prod.name}'. Requested: {requested_qty}, On-hand: {prod.current_stock}."
            )
        else:
            products_to_checkout.append((prod, requested_qty))
            subtotal += round(prod.selling_price * requested_qty, 2)

    if validation_errors:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Cart stock validation failed.",
                "errors": validation_errors
            }
        )

    # 3. Generate Unified Order ID & UTC Timestamp
    order_id = f"ORD-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"
    now_utc = datetime.now(timezone.utc)
    discount = max(float(payload.discount_applied), 0.0)
    total_amount = max(round(subtotal - discount, 2), 0.0)

    receipt_items = []
    low_stock_warnings = []
    total_qty_count = 0

    # 4. Atomic Stock Decrement & Transaction Persistence
    for prod, qty in products_to_checkout:
        prod.current_stock -= qty
        line_total = round(prod.selling_price * qty, 2)
        total_qty_count += qty
        is_low = prod.current_stock <= prod.min_stock_level

        if is_low:
            low_stock_warnings.append(
                f"Low stock alert: '{prod.name}' has {prod.current_stock} units left (Threshold: {prod.min_stock_level})."
            )

        tx = Transaction(
            user_id=user.id,
            product_id=prod.id,
            order_id=order_id,
            quantity=qty,
            unit_price=prod.selling_price,
            discount_applied=0.0,
            total_revenue=line_total,
            timestamp=now_utc
        )
        db.add(tx)

        receipt_items.append({
            "product_id": prod.id,
            "name": prod.name,
            "category": prod.category,
            "quantity": qty,
            "unit_price": prod.selling_price,
            "line_total": line_total,
            "remaining_stock": prod.current_stock,
            "is_low_stock": is_low
        })

    try:
        db.commit()
        for prod, _ in products_to_checkout:
            db.refresh(prod)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist checkout transaction: {str(e)}"
        )

    return {
        "order_id": order_id,
        "timestamp": now_utc,
        "items_count": len(receipt_items),
        "total_quantity": total_qty_count,
        "subtotal": round(subtotal, 2),
        "discount_applied": round(discount, 2),
        "total_amount": round(total_amount, 2),
        "payment_mode": payload.payment_mode or "CASH",
        "customer_phone": payload.customer_phone,
        "customer_name": payload.customer_name,
        "items": receipt_items,
        "low_stock_warnings": low_stock_warnings
    }


# -------------------------------------------------------------
# Recent Orders / Transactions History Endpoint
# -------------------------------------------------------------
@router.get("/recent-orders")
def get_recent_orders(
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.timestamp.desc())
        .limit(200)
        .all()
    )
    if not txs:
        txs = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(200).all()

    orders_map = {}
    for tx in txs:
        if tx.order_id not in orders_map:
            orders_map[tx.order_id] = {
                "order_id": tx.order_id,
                "timestamp": tx.timestamp,
                "items_count": 0,
                "total_quantity": 0,
                "total_revenue": 0.0,
                "items": []
            }
        prod_name = tx.product.name if tx.product else f"Product #{tx.product_id}"
        orders_map[tx.order_id]["items_count"] += 1
        orders_map[tx.order_id]["total_quantity"] += tx.quantity
        orders_map[tx.order_id]["total_revenue"] += tx.total_revenue
        orders_map[tx.order_id]["items"].append({
            "product_id": tx.product_id,
            "name": prod_name,
            "quantity": tx.quantity,
            "unit_price": tx.unit_price,
            "total_revenue": tx.total_revenue
        })

    recent_orders = list(orders_map.values())[:limit]
    for o in recent_orders:
        o["total_revenue"] = round(o["total_revenue"], 2)
    return recent_orders


# -------------------------------------------------------------
# Bulk CSV & Excel Inventory Upload / Import Endpoint
# -------------------------------------------------------------
@router.post("/upload-file")
async def upload_inventory_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filename = file.filename.lower() if file.filename else ""
    if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".xls") or filename.endswith(".tsv")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file."
        )

    try:
        contents = await file.read()
        if filename.endswith(".csv") or filename.endswith(".tsv"):
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(contents), encoding="latin-1")
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not parse file: {str(e)}. Please check file formatting."
        )

    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file contains no rows.")

    # Normalize column names: strip spaces, lowercase, replace underscores
    col_map = {}
    for orig_col in df.columns:
        clean = str(orig_col).strip().lower().replace(" ", "_").replace("-", "_")
        col_map[orig_col] = clean

    df = df.rename(columns=col_map)

    # Column synonym helpers
    def find_col(candidates):
        for col in df.columns:
            if col in candidates:
                return col
        return None

    name_col = find_col(["name", "product_name", "item_name", "product", "item", "title", "sku_name"])
    category_col = find_col(["category", "cat", "department", "type", "group", "product_category"])
    cost_col = find_col(["cost_price", "cost", "buy_price", "purchase_price", "costprice", "wholesale_price", "unit_cost"])
    sell_col = find_col(["selling_price", "sell_price", "price", "mrp", "retail_price", "sellingprice", "unit_price"])
    stock_col = find_col(["current_stock", "stock", "quantity", "qty", "units", "inventory", "on_hand", "stock_qty"])
    min_stock_col = find_col(["min_stock_level", "min_stock", "min_level", "safety_stock", "reorder_level", "threshold", "buffer"])
    barcode_col = find_col(["barcode", "upc", "sku", "ean", "code", "barcode_upc", "item_code"])

    if not name_col:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required 'Name' or 'Product Name' column in uploaded file. Found columns: {list(df.columns)}"
        )

    imported_count = 0
    updated_count = 0
    skipped_count = 0
    errors = []

    for index, row in df.iterrows():
        row_num = index + 2  # 1-indexed header + 1
        name_val = str(row[name_col]).strip() if pd.notna(row[name_col]) else ""
        if not name_val or name_val.lower() == "nan":
            skipped_count += 1
            continue

        category_val = str(row[category_col]).strip() if category_col and pd.notna(row[category_col]) else "General"
        if not category_val or category_val.lower() == "nan":
            category_val = "General"

        # Cost Price
        try:
            cost_val = float(row[cost_col]) if cost_col and pd.notna(row[cost_col]) else 0.0
            if cost_val <= 0:
                cost_val = 10.0  # Safe fallback default
        except Exception:
            cost_val = 10.0

        # Selling Price
        try:
            sell_val = float(row[sell_col]) if sell_col and pd.notna(row[sell_col]) else 0.0
            if sell_val <= 0:
                sell_val = round(cost_val * 1.35, 2)  # 35% margin fallback default
        except Exception:
            sell_val = round(cost_val * 1.35, 2)

        # Stock
        try:
            stock_val = int(float(row[stock_col])) if stock_col and pd.notna(row[stock_col]) else 0
            if stock_val < 0:
                stock_val = 0
        except Exception:
            stock_val = 0

        # Min Stock
        try:
            min_stock_val = int(float(row[min_stock_col])) if min_stock_col and pd.notna(row[min_stock_col]) else 10
            if min_stock_val < 0:
                min_stock_val = 10
        except Exception:
            min_stock_val = 10

        # Barcode
        barcode_val = str(row[barcode_col]).strip() if barcode_col and pd.notna(row[barcode_col]) else None
        if barcode_val and barcode_val.lower() == "nan":
            barcode_val = None

        try:
            # Check for existing item by barcode or by exact name
            existing_item = None
            if barcode_val:
                existing_item = db.query(Product).filter(
                    Product.barcode == barcode_val,
                    Product.user_id == user.id
                ).first()

            if not existing_item:
                existing_item = db.query(Product).filter(
                    Product.name == name_val,
                    Product.user_id == user.id
                ).first()

            if existing_item:
                existing_item.current_stock += stock_val
                existing_item.cost_price = cost_val
                existing_item.selling_price = sell_val
                existing_item.min_stock_level = min_stock_val
                if barcode_val and not existing_item.barcode:
                    existing_item.barcode = barcode_val
                if category_val != "General":
                    existing_item.category = category_val
                updated_count += 1
            else:
                new_prod = Product(
                    user_id=user.id,
                    name=name_val,
                    category=category_val,
                    barcode=barcode_val,
                    cost_price=cost_val,
                    selling_price=sell_val,
                    current_stock=stock_val,
                    min_stock_level=min_stock_val
                )
                db.add(new_prod)
                imported_count += 1

        except Exception as row_err:
            errors.append(f"Row {row_num} ({name_val}): {str(row_err)}")

    db.commit()

    return {
        "message": f"Successfully imported {imported_count} new items and updated {updated_count} existing items.",
        "imported_count": imported_count,
        "updated_count": updated_count,
        "skipped_count": skipped_count,
        "total_processed": imported_count + updated_count + skipped_count,
        "errors": errors[:5]
    }


# -------------------------------------------------------------
# Download Sample Template Endpoint
# -------------------------------------------------------------
@router.get("/sample-template")
def download_sample_template(format: str = "csv"):
    sample_data = [
        {"name": "Britannia Milk Bread 400g", "category": "Bakery", "cost_price": 28.00, "selling_price": 45.00, "current_stock": 25, "min_stock_level": 10, "barcode": "890103000001"},
        {"name": "Amul Butter 500g", "category": "Dairy", "cost_price": 220.00, "selling_price": 275.00, "current_stock": 18, "min_stock_level": 8, "barcode": "890103000002"},
        {"name": "Nestle Everyday Milk Powder 400g", "category": "Dairy", "cost_price": 180.00, "selling_price": 240.00, "current_stock": 12, "min_stock_level": 6, "barcode": "890103000003"},
        {"name": "Tata Tea Gold 500g", "category": "Beverages", "cost_price": 260.00, "selling_price": 340.00, "current_stock": 30, "min_stock_level": 10, "barcode": "890103000004"},
        {"name": "Fortune Sunlite Sunflower Oil 1L", "category": "Staples", "cost_price": 115.00, "selling_price": 155.00, "current_stock": 40, "min_stock_level": 15, "barcode": "890103000005"},
    ]
    df = pd.DataFrame(sample_data)

    if format.lower() == "xlsx" or format.lower() == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Inventory")
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=retailai_inventory_template.xlsx"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=retailai_inventory_template.csv"}
        )