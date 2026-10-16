from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = Field(default="General")
    cost_price: float = Field(..., gt=0)
    selling_price: float = Field(..., gt=0)
    current_stock: int = Field(..., ge=0)
    min_stock_level: int = Field(default=10, ge=0)
    barcode: Optional[str] = Field(default="", description="Barcode or UPC code")

class RecordSaleRequest(BaseModel):
    product_id: int
    units_sold: int = Field(..., gt=0)

class BasketItem(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0)

class CheckoutBasketRequest(BaseModel):
    items: List[BasketItem]
    discount_applied: float = Field(default=0.0, ge=0)
    payment_mode: Optional[str] = Field(default="CASH")
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None

class ReceiptItem(BaseModel):
    product_id: int
    name: str
    category: str
    quantity: int
    unit_price: float
    line_total: float
    remaining_stock: int
    is_low_stock: bool

class CheckoutReceiptResponse(BaseModel):
    order_id: str
    timestamp: datetime
    items_count: int
    total_quantity: int
    subtotal: float
    discount_applied: float
    total_amount: float
    payment_mode: str
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    items: List[ReceiptItem]
    low_stock_warnings: List[str]
