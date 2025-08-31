from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import JSONResponse
from payment_models import *
from user_database import user_db
from auth import get_current_user_optional
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Define pricing packages - NEVER accept amounts from frontend
PRICING_PACKAGES = {
    "starter": {
        "name": "Starter Plan",
        "price": 4.99,
        "currency": "usd",
        "features": [
            "Full assessment",
            "Up to 3 career suggestions",
            "Limited progress tracking"
        ]
    },
    "pro": {
        "name": "Pro Plan", 
        "price": 9.99,
        "currency": "usd",
        "features": [
            "Unlimited assessments & suggestions",
            "Full progress dashboard",
            "Advanced advice from Athena"
        ]
    },
    "student": {
        "name": "Student Plan",
        "price": 5.99,
        "currency": "usd",
        "features": [
            "Same as Pro",
            "Discounted rate with .edu email or verification"
        ]
    },
    "lifetime": {
        "name": "Lifetime Access",
        "price": 49.99,
        "currency": "usd",
        "features": [
            "All Pro features",
            "One-time payment instead of subscription"
        ]
    }
}

def get_stripe_client(request: Request):
    """Initialize Stripe client with API key and webhook URL."""
    api_key = os.environ.get('STRIPE_SECRET_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe configuration missing")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    
    return StripeCheckout(api_key=api_key, webhook_url=webhook_url)

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    checkout_request: CheckoutRequest,
    request: Request,
    current_user_id: Optional[str] = Depends(get_current_user_optional)
):
    """Create a Stripe checkout session for the specified plan."""
    try:
        # Validate plan exists
        if checkout_request.plan_id not in PRICING_PACKAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid plan ID: {checkout_request.plan_id}"
            )
        
        # Get plan details from server-side definition
        plan_details = PRICING_PACKAGES[checkout_request.plan_id]
        amount = plan_details["price"]
        currency = plan_details["currency"]
        
        # Build success and cancel URLs from frontend origin
        success_url = f"{checkout_request.origin_url}?session_id={{CHECKOUT_SESSION_ID}}&status=success"
        cancel_url = f"{checkout_request.origin_url}?status=cancelled"
        
        # Prepare metadata
        metadata = {
            "plan_id": checkout_request.plan_id,
            "user_id": current_user_id or "anonymous",
            "source": "careerpilot_web"
        }
        
        # Initialize Stripe client
        stripe_client = get_stripe_client(request)
        
        # Create checkout session request
        session_request = CheckoutSessionRequest(
            amount=amount,
            currency=currency,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Create Stripe checkout session
        session_response = await stripe_client.create_checkout_session(session_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            id=str(uuid.uuid4()),
            session_id=session_response.session_id,
            user_id=current_user_id,
            plan_id=checkout_request.plan_id,
            amount=amount,
            currency=currency,
            payment_status=PaymentStatus.INITIATED,
            stripe_session_id=session_response.session_id,
            metadata=metadata
        )
        
        # Save transaction to database
        user_db.payment_transactions.insert_one(transaction.dict())
        
        return CheckoutResponse(
            checkout_url=session_response.url,
            session_id=session_response.session_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )

@router.get("/status/{session_id}", response_model=PaymentStatusResponse)
async def get_payment_status(
    session_id: str,
    request: Request
):
    """Get the payment status for a checkout session."""
    try:
        # Get Stripe client
        stripe_client = get_stripe_client(request)
        
        # Get status from Stripe
        checkout_status = await stripe_client.get_checkout_status(session_id)
        
        # Find transaction in database
        transaction = user_db.payment_transactions.find_one({"stripe_session_id": session_id})
        
        if transaction:
            # Update transaction status if changed
            current_status = PaymentStatus.PENDING
            
            if checkout_status.payment_status == "paid":
                current_status = PaymentStatus.PAID
            elif checkout_status.status == "expired":
                current_status = PaymentStatus.EXPIRED
            elif checkout_status.payment_status == "unpaid" and checkout_status.status == "complete":
                current_status = PaymentStatus.FAILED
                
            # Update database if status changed
            if current_status != transaction.get("payment_status"):
                user_db.payment_transactions.update_one(
                    {"stripe_session_id": session_id},
                    {
                        "$set": {
                            "payment_status": current_status.value,
                            "updated_at": datetime.now()
                        }
                    }
                )
                
                # If payment is successful, you can add plan benefits here
                if current_status == PaymentStatus.PAID and transaction.get("user_id"):
                    await activate_plan_for_user(transaction["user_id"], transaction["plan_id"])
        
        return PaymentStatusResponse(
            status=checkout_status.status,
            payment_status=checkout_status.payment_status,
            amount_total=checkout_status.amount_total,
            currency=checkout_status.currency,
            metadata=checkout_status.metadata,
            plan_id=transaction.get("plan_id") if transaction else None
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get payment status: {str(e)}"
        )

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks."""
    try:
        # Get request body and signature
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Get Stripe client
        stripe_client = get_stripe_client(request)
        
        # Handle webhook
        webhook_response = await stripe_client.handle_webhook(body, signature)
        
        # Update transaction based on webhook event
        if webhook_response.session_id:
            transaction = user_db.payment_transactions.find_one({
                "stripe_session_id": webhook_response.session_id
            })
            
            if transaction:
                # Map webhook status to our status
                new_status = PaymentStatus.PENDING
                if webhook_response.payment_status == "paid":
                    new_status = PaymentStatus.PAID
                elif webhook_response.event_type == "checkout.session.expired":
                    new_status = PaymentStatus.EXPIRED
                
                # Update transaction
                user_db.payment_transactions.update_one(
                    {"stripe_session_id": webhook_response.session_id},
                    {
                        "$set": {
                            "payment_status": new_status.value,
                            "updated_at": datetime.now()
                        }
                    }
                )
                
                # Activate plan if payment successful
                if new_status == PaymentStatus.PAID and transaction.get("user_id"):
                    await activate_plan_for_user(transaction["user_id"], transaction["plan_id"])
        
        return JSONResponse(content={"received": True}, status_code=200)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )

async def activate_plan_for_user(user_id: str, plan_id: str):
    """Activate the purchased plan for the user."""
    try:
        # Update user's plan in database
        user_db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "subscription_plan": plan_id,
                    "plan_activated_at": datetime.now(),
                    "plan_expires_at": None if plan_id == "lifetime" else None  # Add expiration logic if needed
                }
            }
        )
        print(f"Plan {plan_id} activated for user {user_id}")
    except Exception as e:
        print(f"Failed to activate plan for user {user_id}: {str(e)}")

@router.get("/plans")
async def get_pricing_plans():
    """Get all available pricing plans."""
    return {
        "plans": PRICING_PACKAGES,
        "currency": "USD"
    }