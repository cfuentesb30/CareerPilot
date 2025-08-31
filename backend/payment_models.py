from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    PENDING = "pending"
    INITIATED = "initiated"
    PAID = "paid"
    FAILED = "failed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class PricingPlan(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    STUDENT = "student"
    LIFETIME = "lifetime"

class CheckoutRequest(BaseModel):
    """Request to create a checkout session."""
    plan_id: str = Field(..., description="The pricing plan ID (starter, pro, student, lifetime)")
    origin_url: str = Field(..., description="The frontend origin URL for success/cancel redirects")

class PaymentTransaction(BaseModel):
    """Payment transaction record."""
    id: Optional[str] = None
    session_id: str = Field(..., description="Stripe checkout session ID")
    user_id: Optional[str] = Field(None, description="User ID if authenticated")
    plan_id: str = Field(..., description="The pricing plan purchased")
    amount: float = Field(..., description="Payment amount in dollars")
    currency: str = Field(default="usd", description="Payment currency")
    payment_status: PaymentStatus = Field(default=PaymentStatus.PENDING, description="Current payment status")
    stripe_session_id: str = Field(..., description="Stripe session ID")
    metadata: Optional[Dict[str, str]] = Field(None, description="Additional metadata")
    created_at: datetime = Field(default_factory=datetime.now, description="Transaction creation time")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update time")

class CheckoutResponse(BaseModel):
    """Response from checkout session creation."""
    checkout_url: str = Field(..., description="Stripe checkout URL to redirect to")
    session_id: str = Field(..., description="Checkout session ID")

class PaymentStatusResponse(BaseModel):
    """Response for payment status check."""
    status: str = Field(..., description="Payment session status")
    payment_status: str = Field(..., description="Payment completion status")
    amount_total: int = Field(..., description="Total amount in cents")
    currency: str = Field(..., description="Payment currency")
    metadata: Dict[str, str] = Field(..., description="Session metadata")
    plan_id: Optional[str] = Field(None, description="Associated plan ID")