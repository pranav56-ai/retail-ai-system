from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import uuid
import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules
from pydantic import BaseModel

from ..database import get_db
from ..models import Product, Transaction, User
from ..auth import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Prescriptive Engine"])

class SimulatorRequest(BaseModel):
    product_id: int
    discount_pct: float  # e.g., 10.0 for 10%
    price_elasticity: float = -1.5  # Standard retail elasticity

@router.get("/prescriptive-insights")
def get_prescriptive_insights(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = db.query(Product).filter(Product.user_id == user.id).all()
    if not products:
        return {"health_score": 100, "urgent_actions": [], "bundles": [], "dead_stock": [], "metrics": {}}

    prod_lookup = {p.id: p for p in products}

    # Fetch last 180 days of transactions
    cutoff_date = datetime.utcnow() - timedelta(days=180)
    tx_records = db.query(Transaction).filter(
        Transaction.user_id == user.id,
        Transaction.timestamp >= cutoff_date
    ).all()

    urgent_actions = []
    dead_stock_items = []
    bundle_recommendations = []

    if tx_records:
        df_tx = pd.DataFrame([{
            "product_id": t.product_id,
            "order_id": t.order_id,
            "quantity": t.quantity,
            "revenue": t.total_revenue,
            "timestamp": t.timestamp
        } for t in tx_records])

        last_30_days = datetime.utcnow() - timedelta(days=30)
        recent_sales = df_tx[df_tx["timestamp"] >= last_30_days].groupby("product_id")["quantity"].sum().to_dict()
    else:
        df_tx = pd.DataFrame()
        recent_sales = {}

    total_inventory_value = 0.0
    trapped_capital_value = 0.0

    for p in products:
        unit_val = p.cost_price * p.current_stock
        total_inventory_value += unit_val
        units_sold_30d = recent_sales.get(p.id, 0)
        daily_run_rate = units_sold_30d / 30.0

        # Urgent Stockout Check
        if p.current_stock <= p.min_stock_level:
            reorder_qty = max((p.min_stock_level * 2) - p.current_stock, 10)
            urgent_actions.append({
                "type": "REORDER",
                "severity": "CRITICAL",
                "product_id": p.id,
                "product_name": p.name,
                "badge": "Stockout Risk",
                "detail": f"Stock is {p.current_stock} units (Threshold: {p.min_stock_level}). Run-rate is {daily_run_rate:.1f} units/day.",
                "action": f"Reorder {reorder_qty} units now to prevent supply disruption."
            })

        # Dead Stock / Idle Capital Check
        elif p.current_stock > (p.min_stock_level * 1.5) and units_sold_30d <= 1:
            trapped_capital = round(p.cost_price * p.current_stock, 2)
            trapped_capital_value += trapped_capital
            dead_stock_items.append({
                "product_id": p.id,
                "name": p.name,
                "category": p.category,
                "current_stock": p.current_stock,
                "cost_price": p.cost_price,
                "trapped_capital": trapped_capital,
                "units_sold_30d": units_sold_30d
            })
            urgent_actions.append({
                "type": "DEAD_STOCK",
                "severity": "WARNING",
                "product_id": p.id,
                "product_name": p.name,
                "badge": "Trapped Capital",
                "detail": f"₹{trapped_capital:,.2f} tied up in idle stock with {units_sold_30d} sales in 30 days.",
                "action": "Bundle with high-turnover item or initiate a 12% clearance discount."
            })

    # Association Rule Mining (Apriori via MLxtend & Basket Ledger Aggregation)
    affinity_matrix = {}
    if not df_tx.empty and df_tx["order_id"].nunique() >= 3:
        try:
            # Group line items strictly by unified order_id to form discrete customer baskets
            grouped_orders = df_tx.groupby("order_id")["product_id"].apply(lambda s: list(set(s))).to_dict()
            total_orders = max(len(grouped_orders), 1)

            # Build one-hot transaction matrix for Apriori
            basket_df = (df_tx.groupby(["order_id", "product_id"])["quantity"]
                         .sum().unstack().reset_index().fillna(0)
                         .set_index("order_id"))
            basket_encoded = (basket_df > 0).astype(bool)

            # Adaptive min_support based on transaction volume
            adaptive_support = max(0.015, min(0.05, 2.0 / total_orders))
            frequent_itemsets = apriori(basket_encoded, min_support=adaptive_support, use_colnames=True)

            if not frequent_itemsets.empty:
                rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.02)
                rules = rules[rules["confidence"] >= 0.15].sort_values(by="lift", ascending=False)

                seen_pairs = set()
                for _, row in rules.iterrows():
                    antecedents = list(row["antecedents"])
                    consequents = list(row["consequents"])

                    if len(antecedents) == 1 and len(consequents) == 1:
                        prod_a_id = int(antecedents[0])
                        prod_b_id = int(consequents[0])
                        pair_key = tuple(sorted([prod_a_id, prod_b_id]))
                        
                        # Populate data-driven affinity matrix
                        if prod_a_id not in affinity_matrix:
                            affinity_matrix[prod_a_id] = {}
                        affinity_matrix[prod_a_id][prod_b_id] = round(float(row["confidence"]) * 100, 1)

                        if pair_key in seen_pairs:
                            continue
                        seen_pairs.add(pair_key)

                        prod_a = prod_lookup.get(prod_a_id)
                        prod_b = prod_lookup.get(prod_b_id)

                        if prod_a and prod_b:
                            combo_orig = round(prod_a.selling_price + prod_b.selling_price, 2)
                            suggested_price = round(combo_orig * 0.90, 2)
                            bundle_recommendations.append({
                                "primary_id": prod_a.id,
                                "paired_id": prod_b.id,
                                "primary_item": prod_a.name,
                                "paired_item": prod_b.name,
                                "support": round(float(row["support"]) * 100, 1),
                                "confidence": round(float(row["confidence"]) * 100, 1),
                                "lift": round(float(row["lift"]), 2),
                                "original_total": combo_orig,
                                "suggested_bundle_price": suggested_price,
                                "savings": round(combo_orig - suggested_price, 2),
                                "rationale": f"Customers buying {prod_a.name} have a {int(row['confidence']*100)}% likelihood to also buy {prod_b.name} (Lift {row['lift']:.2f}x)."
                            })
        except Exception as e:
            print("Apriori mining notice:", e)

    # Direct Co-occurrence Pair Fallback if Apriori returns few items
    if len(bundle_recommendations) < 2 and not df_tx.empty:
        try:
            order_baskets = df_tx.groupby("order_id")["product_id"].apply(lambda s: list(set(s))).tolist()
            multi_baskets = [b for b in order_baskets if len(b) > 1]
            pair_counts = {}
            item_counts = {}
            for b in order_baskets:
                for item in b:
                    item_counts[item] = item_counts.get(item, 0) + 1
            for b in multi_baskets:
                for i in range(len(b)):
                    for j in range(i + 1, len(b)):
                        pair = tuple(sorted([b[i], b[j]]))
                        pair_counts[pair] = pair_counts.get(pair, 0) + 1

            for (id_a, id_b), count in sorted(pair_counts.items(), key=lambda x: x[1], reverse=True)[:6]:
                prod_a = prod_lookup.get(id_a)
                prod_b = prod_lookup.get(id_b)
                if prod_a and prod_b and (id_a, id_b) not in [tuple(sorted([b["primary_id"], b["paired_id"]])) for b in bundle_recommendations if "primary_id" in b]:
                    support_pct = round((count / max(len(order_baskets), 1)) * 100, 1)
                    conf_a = round((count / max(item_counts.get(id_a, 1), 1)) * 100, 1)
                    lift_val = round((count * len(order_baskets)) / max(item_counts.get(id_a, 1) * item_counts.get(id_b, 1), 1), 2)
                    combo_orig = round(prod_a.selling_price + prod_b.selling_price, 2)
                    suggested_price = round(combo_orig * 0.90, 2)
                    bundle_recommendations.append({
                        "primary_id": prod_a.id,
                        "paired_id": prod_b.id,
                        "primary_item": prod_a.name,
                        "paired_item": prod_b.name,
                        "support": support_pct,
                        "confidence": conf_a,
                        "lift": max(lift_val, 1.15),
                        "original_total": combo_orig,
                        "suggested_bundle_price": suggested_price,
                        "savings": round(combo_orig - suggested_price, 2),
                        "rationale": f"High co-purchase frequency: {count} customer baskets contained both items (Co-occurrence rate {support_pct}%)."
                    })
        except Exception as fallback_err:
            print("Fallback co-occurrence notice:", fallback_err)

    # Calculate Business Health Score (0 - 100)
    stockout_penalty = min(len([a for a in urgent_actions if a["type"] == "REORDER"]) * 14, 45)
    capital_ratio = (trapped_capital_value / total_inventory_value) if total_inventory_value > 0 else 0
    capital_penalty = min(capital_ratio * 60, 35)
    health_score = max(int(100 - stockout_penalty - capital_penalty), 25)

    return {
        "health_score": health_score,
        "metrics": {
            "total_inventory_value": round(total_inventory_value, 2),
            "trapped_capital_value": round(trapped_capital_value, 2),
            "dead_stock_count": len(dead_stock_items),
            "reorder_alerts_count": len([a for a in urgent_actions if a["type"] == "REORDER"]),
            "total_orders_analyzed": int(df_tx["order_id"].nunique()) if not df_tx.empty else 0
        },
        "urgent_actions": urgent_actions,
        "bundle_recommendations": bundle_recommendations[:6],
        "affinity_matrix": affinity_matrix,
        "dead_stock": dead_stock_items
    }

# -------------------------------------------------------------
# What-If Elasticity Simulator Endpoint
# -------------------------------------------------------------
@router.post("/simulate-pricing")
def simulate_pricing(
    payload: SimulatorRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == payload.product_id, Product.user_id == user.id).first()
    if not prod:
        prod = db.query(Product).filter(Product.id == payload.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    # Baseline calculations
    base_price = prod.selling_price
    cost = prod.cost_price
    base_margin_unit = base_price - cost
    discount_decimal = payload.discount_pct / 100.0
    new_price = round(base_price * (1 - discount_decimal), 2)
    new_margin_unit = new_price - cost

    # Estimate baseline 30-day monthly units
    recent_txs = db.query(Transaction).filter(
        Transaction.product_id == prod.id,
        Transaction.timestamp >= datetime.utcnow() - timedelta(days=30)
    ).all()
    baseline_units = sum([t.quantity for t in recent_txs])
    if baseline_units == 0:
        baseline_units = max(int(prod.current_stock * 0.3), 15)  # reasonable baseline proxy

    # Price Elasticity Formula: % Change in Quantity = Elasticity * % Change in Price
    pct_price_change = -discount_decimal
    pct_qty_change = payload.price_elasticity * pct_price_change
    projected_units = max(int(round(baseline_units * (1 + pct_qty_change))), 1)

    baseline_revenue = round(baseline_units * base_price, 2)
    baseline_profit = round(baseline_units * base_margin_unit, 2)

    projected_revenue = round(projected_units * new_price, 2)
    projected_profit = round(projected_units * new_margin_unit, 2)
    profit_delta = round(projected_profit - baseline_profit, 2)

    return {
        "product_name": prod.name,
        "current_price": base_price,
        "new_price": new_price,
        "discount_applied_pct": payload.discount_pct,
        "baseline_units": baseline_units,
        "projected_units": projected_units,
        "units_delta_pct": round(pct_qty_change * 100, 1),
        "baseline_revenue": baseline_revenue,
        "projected_revenue": projected_revenue,
        "baseline_profit": baseline_profit,
        "projected_profit": projected_profit,
        "profit_delta": profit_delta,
        "recommendation": (
            "Recommended: Discount creates high sales volume that increases overall net profit."
            if profit_delta > 0 else
            "Caution: Margin compression outweighs volume surge; net profit will decline."
        )
    }

# -------------------------------------------------------------
# Auto-Sync AI Transactions Button Endpoint
# -------------------------------------------------------------
@router.post("/generate-transactions")
def generate_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    products = db.query(Product).filter(Product.user_id == user.id).all()
    if not products:
        products = db.query(Product).all()

    if len(products) < 2:
        raise HTTPException(status_code=400, detail="Add at least 2 products to generate customer transactions.")

    # Remove old transactions for clean rerun
    db.query(Transaction).filter(Transaction.user_id == user.id).delete()
    db.commit()

    tx_list = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    current_day = start_date

    # Pick complementary affinity pairs for realistic mining
    pairs = []
    if len(products) >= 2:
        pairs.append((products[0], products[1]))
    if len(products) >= 4:
        pairs.append((products[2], products[3]))
    if len(products) >= 6:
        pairs.append((products[4], products[5]))

    order_seq = 1000
    while current_day <= end_date:
        daily_baskets = random.randint(3, 7)
        for _ in range(daily_baskets):
            order_seq += 1
            order_id = f"ORD-{current_day.year}-{order_seq:05d}"
            selected = []

            # 55% chance of association pair
            if pairs and random.random() < 0.55:
                chosen_pair = random.choice(pairs)
                selected.extend(chosen_pair)

            # 1-2 random items
            other_sample_k = min(random.randint(1, 2), len(products))
            selected.extend(random.sample(products, k=other_sample_k))
            selected = list({p.id: p for p in selected}.values())

            time_stamp = current_day + timedelta(hours=random.randint(9, 21), minutes=random.randint(0, 59))

            for prod in selected:
                qty = random.choices([1, 2, 3], weights=[0.8, 0.15, 0.05])[0]
                line_rev = round(prod.selling_price * qty, 2)
                tx = Transaction(
                    user_id=user.id,
                    product_id=prod.id,
                    order_id=order_id,
                    quantity=qty,
                    unit_price=prod.selling_price,
                    discount_applied=0.0,
                    total_revenue=line_rev,
                    timestamp=time_stamp
                )
                tx_list.append(tx)

        current_day += timedelta(days=1)

    db.bulk_save_objects(tx_list)
    db.commit()
    return {"message": f"Generated {order_seq - 1000} customer basket orders ({len(tx_list)} line items) for Apriori mining."}