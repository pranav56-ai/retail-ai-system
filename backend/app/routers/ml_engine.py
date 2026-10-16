from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Product, Transaction
from ..auth import get_current_user
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules

router = APIRouter(prefix="/api/ml", tags=["ML Engine"])

@router.get("/recommendations")
def get_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.user_id == user.id).all()
    actions = []
    
    for p in products:
        # Reorder Check
        if p.current_stock <= p.min_stock_level:
            actions.append({
                "type": "REORDER",
                "priority": "HIGH",
                "product": p.name,
                "detail": f"Current stock ({p.current_stock}) below safety threshold ({p.min_stock_level}).",
                "recommended_order": (p.min_stock_level * 2) - p.current_stock
            })
            
    return actions

@router.post("/simulate")
def simulate_discount(product_id: int, discount_pct: float, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.user_id == user.id).first()
    if not product:
        return {"error": "Product not found"}
        
    # Baseline margin calculation
    base_unit_profit = product.selling_price - product.cost_price
    discounted_price = product.selling_price * (1 - (discount_pct / 100))
    discounted_unit_profit = discounted_price - product.cost_price
    
    # Simple elasticity heuristic (-1.5 elasticity of demand)
    expected_sales_boost = (discount_pct * 1.5) / 100
    
    return {
        "original_price": product.selling_price,
        "new_price": round(discounted_price, 2),
        "unit_profit_shift": f"₹{base_unit_profit:.2f} → ₹{discounted_unit_profit:.2f}",
        "projected_sales_multiplier": round(1 + expected_sales_boost, 2),
        "viable_offer": discounted_unit_profit > (0.1 * product.cost_price) # Minimum 10% gross floor
    }