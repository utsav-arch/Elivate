import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone, timedelta
import random
import bcrypt
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Convin.ai Customer Data (Real companies in contact center space)
CUSTOMERS = [
    {"name": "Zomato", "industry": "Food Delivery", "region": "South India", "arr": 2500000, "plan": "License"},
    {"name": "Swiggy", "industry": "Food Delivery", "region": "South India", "arr": 2800000, "plan": "License"},
    {"name": "PhonePe", "industry": "Fintech", "region": "South India", "arr": 3500000, "plan": "License"},
    {"name": "HDFC Bank", "industry": "Banking", "region": "West India", "arr": 5000000, "plan": "License"},
    {"name": "ICICI Bank", "industry": "Banking", "region": "West India", "arr": 4500000, "plan": "License"},
    {"name": "Axis Bank", "industry": "Banking", "region": "West India", "arr": 4000000, "plan": "License"},
    {"name": "PolicyBazaar", "industry": "InsurTech", "region": "North India", "arr": 1800000, "plan": "License"},
    {"name": "Ola Cabs", "industry": "Transportation", "region": "South India", "arr": 2200000, "plan": "License"},
    {"name": "Myntra", "industry": "E-commerce", "region": "South India", "arr": 1500000, "plan": "License"},
    {"name": "Flipkart", "industry": "E-commerce", "region": "South India", "arr": 6000000, "plan": "License"},
    {"name": "Paytm", "industry": "Fintech", "region": "North India", "arr": 3000000, "plan": "License"},
    {"name": "MakeMyTrip", "industry": "Travel", "region": "North India", "arr": 2000000, "plan": "License"},
    {"name": "OYO Rooms", "industry": "Hospitality", "region": "North India", "arr": 1700000, "plan": "License"},
    {"name": "BigBasket", "industry": "E-commerce", "region": "South India", "arr": 1300000, "plan": "License"},
    {"name": "Urban Company", "industry": "Services", "region": "North India", "arr": 900000, "plan": "License"},
    {"name": "Cred", "industry": "Fintech", "region": "South India", "arr": 1100000, "plan": "License"},
    {"name": "Razorpay", "industry": "Fintech", "region": "South India", "arr": 2700000, "plan": "License"},
    {"name": "Byju's", "industry": "EdTech", "region": "South India", "arr": 3200000, "plan": "License"},
    {"name": "Unacademy", "industry": "EdTech", "region": "South India", "arr": 1600000, "plan": "License"},
    {"name": "Lenskart", "industry": "E-commerce", "region": "North India", "arr": 1400000, "plan": "License"},
    {"name": "Nykaa", "industry": "E-commerce", "region": "West India", "arr": 1900000, "plan": "License"},
    {"name": "Delhivery", "industry": "Logistics", "region": "North India", "arr": 2100000, "plan": "License"},
    {"name": "Dunzo", "industry": "Delivery", "region": "South India", "arr": 800000, "plan": "License"},
    {"name": "Grofers (Blinkit)", "industry": "E-commerce", "region": "North India", "arr": 1200000, "plan": "License"},
    {"name": "Meesho", "industry": "E-commerce", "region": "South India", "arr": 1000000, "plan": "License"},
    {"name": "Dream11", "industry": "Gaming", "region": "West India", "arr": 2600000, "plan": "License"},
    {"name": "MPL", "industry": "Gaming", "region": "South India", "arr": 1500000, "plan": "License"},
    {"name": "Cars24", "industry": "Auto", "region": "North India", "arr": 1300000, "plan": "License"},
    {"name": "Spinny", "industry": "Auto", "region": "North India", "arr": 900000, "plan": "License"},
    {"name": "Zerodha", "industry": "Fintech", "region": "South India", "arr": 4200000, "plan": "License"},
]

# CSM Team for Convin.ai
CSM_TEAM = [
    # South India Team
    {"name": "Priya Sharma", "email": "priya.sharma@convin.ai", "region": "South India", "role": "CSM"},
    {"name": "Rajesh Kumar", "email": "rajesh.kumar@convin.ai", "region": "South India", "role": "CSM"},
    {"name": "Ananya Reddy", "email": "ananya.reddy@convin.ai", "region": "South India", "role": "CSM"},
    
    # West India Team
    {"name": "Vikram Patel", "email": "vikram.patel@convin.ai", "region": "West India", "role": "CSM"},
    {"name": "Neha Desai", "email": "neha.desai@convin.ai", "region": "West India", "role": "CSM"},
    {"name": "Amit Shah", "email": "amit.shah@convin.ai", "region": "West India", "role": "CSM"},
    
    # North India Team  
    {"name": "Rohit Verma", "email": "rohit.verma@convin.ai", "region": "North India", "role": "CSM"},
    {"name": "Kavita Singh", "email": "kavita.singh@convin.ai", "region": "North India", "role": "CSM"},
    {"name": "Arjun Malhotra", "email": "arjun.malhotra@convin.ai", "region": "North India", "role": "CSM"},
    {"name": "Sneha Gupta", "email": "sneha.gupta@convin.ai", "region": "North India", "role": "CSM"},
]

PRODUCTS = ["Post Call", "RTA", "AI Phone Call", "Convin Sense", "CRM Upgrade", "STT/TTS Solution"]

ACTIVITY_TYPES = [
    "Weekly Sync", "QBR", "MBR", "In-Person Visit", "Product Feedback",
    "Feature Request", "Training Session", "Support Escalation", "Phone Call",
    "Executive Briefing", "Onboarding Session", "Renewal Discussion"
]

RISK_CATEGORIES = {
    "Product Usage Risks": ["Low Login Frequency", "Inactive Users", "Low Feature Adoption"],
    "Onboarding Risks": ["Delayed Milestones", "Low Session Attendance"],
    "Support/Operations Risks": ["SLA Breaches", "High Unresolved Ticket Volume"],
    "Relationship Risks": ["Stakeholder Churn", "Champion Left Organization"],
    "Commercial/Billing Risks": ["Renewal Concerns Expressed", "Budget Constraints"],
}

OPPORTUNITY_TYPES = ["Upsell", "Cross-sell", "Expansion", "Renewal", "New Product"]

async def clear_database():
    """Clear existing data"""
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.customers.delete_many({})
    await db.activities.delete_many({})
    await db.risks.delete_many({})
    await db.opportunities.delete_many({})
    print("✓ Database cleared")

async def seed_users():
    """Create CSM team users"""
    print("\nSeeding CSM team...")
    users = []
    
    # Add admin user
    admin_user = {
        "id": f"user_admin",
        "email": "admin@convin.ai",
        "password": hash_password("admin123"),
        "name": "Admin User",
        "role": "ADMIN",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    users.append(admin_user)
    
    # Add CSM team
    for idx, csm in enumerate(CSM_TEAM):
        user = {
            "id": f"user_{idx+1}",
            "email": csm["email"],
            "password": hash_password("password123"),
            "name": csm["name"],
            "role": csm["role"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        users.append(user)
    
    await db.users.insert_many(users)
    print(f"✓ Created {len(users)} users (1 admin + {len(CSM_TEAM)} CSMs)")
    return users

async def seed_customers(users):
    """Create customer accounts"""
    print("\nSeeding customers...")
    customers = []
    
    # Group CSMs by region
    csm_by_region = {
        "South India": [u for u in users if "south" in u.get("email", "").lower() or u["name"] in ["Priya Sharma", "Rajesh Kumar", "Ananya Reddy"]],
        "West India": [u for u in users if "west" in u.get("email", "").lower() or u["name"] in ["Vikram Patel", "Neha Desai", "Amit Shah"]],
        "North India": [u for u in users if "north" in u.get("email", "").lower() or u["name"] in ["Rohit Verma", "Kavita Singh", "Arjun Malhotra", "Sneha Gupta"]]
    }
    
    for idx, customer_data in enumerate(CUSTOMERS):
        # Assign CSM from same region
        region_csms = csm_by_region.get(customer_data["region"], users[1:4])
        assigned_csm = random.choice(region_csms) if region_csms else users[1]
        
        # Calculate metrics
        active_users = random.randint(50, 500)
        total_users = int(active_users * random.uniform(1.1, 1.5))
        calls_processed = random.randint(10000, 500000)
        
        # Calculate health score
        usage_rate = active_users / total_users
        health_score = 50.0
        if usage_rate >= 0.7:
            health_score += 15
        elif usage_rate >= 0.5:
            health_score += 10
        
        if calls_processed > 100000:
            health_score += 15
        elif calls_processed > 50000:
            health_score += 10
        
        # Add activity bonus
        health_score += random.randint(5, 15)
        health_score = min(100, health_score)
        
        # Determine status
        if health_score >= 80:
            health_status = "Healthy"
        elif health_score >= 50:
            health_status = "At Risk"
        else:
            health_status = "Critical"
        
        # Random dates
        contract_start = datetime.now(timezone.utc) - timedelta(days=random.randint(180, 730))
        contract_end = contract_start + timedelta(days=365)
        renewal_date = contract_end
        go_live = contract_start + timedelta(days=random.randint(30, 90))
        
        # Onboarding status based on go-live
        days_since_golive = (datetime.now(timezone.utc) - go_live).days
        if days_since_golive < 30:
            onboarding_status = "In Progress"
        else:
            onboarding_status = "Completed"
        
        # Select 2-4 products
        products = random.sample(PRODUCTS, random.randint(2, 4))
        
        customer = {
            "id": f"customer_{idx+1}",
            "company_name": customer_data["name"],
            "website": f"https://{customer_data['name'].lower().replace(' ', '')}.com",
            "industry": customer_data["industry"],
            "region": customer_data["region"],
            "plan_type": customer_data["plan"],
            "arr": customer_data["arr"],
            "contract_start_date": contract_start.date().isoformat(),
            "contract_end_date": contract_end.date().isoformat(),
            "renewal_date": renewal_date.date().isoformat(),
            "go_live_date": go_live.date().isoformat(),
            "products_purchased": products,
            "onboarding_status": onboarding_status,
            "health_score": health_score,
            "health_status": health_status,
            "risk_level": "Low" if health_score > 75 else "Medium" if health_score > 60 else "High",
            "primary_objective": random.choice(["QA Automation", "Training", "Audit", "Compliance", "Performance Management"]),
            "calls_processed": calls_processed,
            "active_users": active_users,
            "total_licensed_users": total_users,
            "csm_owner_id": assigned_csm["id"],
            "csm_owner_name": assigned_csm["name"],
            "am_owner_id": None,
            "am_owner_name": None,
            "tags": [],
            "stakeholders": [],
            "last_activity_date": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        customers.append(customer)
    
    await db.customers.insert_many(customers)
    print(f"✓ Created {len(customers)} customers")
    return customers

async def seed_activities(customers, users):
    """Create activity logs"""
    print("\nSeeding activities...")
    activities = []
    
    for customer in customers:
        # Create 3-8 activities per customer
        num_activities = random.randint(3, 8)
        for i in range(num_activities):
            days_ago = random.randint(0, 180)
            activity_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
            
            activity_type = random.choice(ACTIVITY_TYPES)
            sentiments = ["Positive", "Neutral", "Negative"]
            sentiment_weights = [0.6, 0.3, 0.1]
            
            summaries = [
                f"Discussed Q{random.randint(1,4)} performance metrics and identified improvement areas.",
                f"Reviewed product adoption and usage trends. Customer showing strong engagement.",
                f"Training session conducted for {random.randint(10,50)} agents on new features.",
                f"Addressed support tickets and escalations. Resolution time improved.",
                f"Strategic planning session for expansion to additional departments.",
                f"Product feedback collected. Customer requested enhanced reporting capabilities.",
                f"Renewal discussion initiated. Customer expressed satisfaction with ROI.",
                f"Onboarding milestone achieved. All users certified on platform."
            ]
            
            activity = {
                "id": f"activity_{len(activities)+1}",
                "customer_id": customer["id"],
                "customer_name": customer["company_name"],
                "activity_type": activity_type,
                "activity_date": activity_date.isoformat(),
                "title": f"{activity_type} with {customer['company_name']}",
                "summary": random.choice(summaries),
                "internal_notes": f"Follow-up required on action items discussed.",
                "sentiment": random.choices(sentiments, weights=sentiment_weights)[0],
                "follow_up_required": random.choice([True, False]),
                "follow_up_date": (activity_date + timedelta(days=7)).date().isoformat() if random.choice([True, False]) else None,
                "follow_up_status": random.choice(["Pending", "Completed"]),
                "csm_id": customer["csm_owner_id"],
                "csm_name": customer["csm_owner_name"],
                "created_at": activity_date.isoformat()
            }
            activities.append(activity)
    
    await db.activities.insert_many(activities)
    print(f"✓ Created {len(activities)} activities")

async def seed_risks(customers):
    """Create risk entries"""
    print("\nSeeding risks...")
    risks = []
    
    # Create risks for 30% of customers
    at_risk_customers = [c for c in customers if c["health_status"] in ["At Risk", "Critical"]]
    
    for customer in at_risk_customers[:int(len(customers) * 0.3)]:
        # 1-2 risks per at-risk customer
        num_risks = random.randint(1, 2)
        for i in range(num_risks):
            category = random.choice(list(RISK_CATEGORIES.keys()))
            subcategory = random.choice(RISK_CATEGORIES[category])
            
            severity_options = ["Low", "Medium", "High", "Critical"]
            if customer["health_status"] == "Critical":
                severity = random.choice(["High", "Critical"])
            elif customer["health_status"] == "At Risk":
                severity = random.choice(["Medium", "High"])
            else:
                severity = random.choice(["Low", "Medium"])
            
            risk_titles = {
                "Low Login Frequency": f"User engagement declining at {customer['company_name']}",
                "Inactive Users": f"{random.randint(10, 40)}% of licensed users inactive",
                "Low Feature Adoption": f"Core features underutilized by {customer['company_name']}",
                "Delayed Milestones": f"Onboarding delayed by {random.randint(2, 4)} weeks",
                "SLA Breaches": f"Multiple SLA breaches in support tickets",
                "Champion Left Organization": f"Primary champion left {customer['company_name']}",
                "Renewal Concerns Expressed": f"Budget constraints raised for renewal",
            }
            
            identified_date = datetime.now(timezone.utc) - timedelta(days=random.randint(5, 60))
            
            risk = {
                "id": f"risk_{len(risks)+1}",
                "customer_id": customer["id"],
                "customer_name": customer["company_name"],
                "category": category,
                "subcategory": subcategory,
                "severity": severity,
                "status": random.choice(["Open", "In Progress", "Monitoring"]),
                "title": risk_titles.get(subcategory, f"{subcategory} issue"),
                "description": f"Risk identified during regular health check. Requires immediate attention and mitigation.",
                "impact_description": f"Could impact renewal and expansion opportunities worth ${random.randint(50, 500)}K.",
                "mitigation_plan": f"Action plan: 1) Schedule executive alignment call 2) Provide additional training 3) Weekly progress reviews",
                "revenue_impact": random.randint(50000, 500000),
                "churn_probability": random.randint(20, 80),
                "identified_date": identified_date.date().isoformat(),
                "target_resolution_date": (identified_date + timedelta(days=30)).date().isoformat(),
                "resolution_date": None,
                "assigned_to_id": customer["csm_owner_id"],
                "assigned_to_name": customer["csm_owner_name"],
                "created_at": identified_date.isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            risks.append(risk)
    
    if risks:
        await db.risks.insert_many(risks)
    print(f"✓ Created {len(risks)} risks")

async def seed_opportunities(customers):
    """Create opportunity records"""
    print("\nSeeding opportunities...")
    opportunities = []
    
    # Create opportunities for 40% of healthy customers
    healthy_customers = [c for c in customers if c["health_status"] == "Healthy"]
    
    for customer in healthy_customers[:int(len(customers) * 0.4)]:
        # 1-2 opportunities per customer
        num_opps = random.randint(1, 2)
        for i in range(num_opps):
            opp_type = random.choice(OPPORTUNITY_TYPES)
            
            opp_titles = {
                "Upsell": f"Expand from {customer['active_users']} to {customer['active_users'] + random.randint(50, 200)} users",
                "Cross-sell": f"Add {random.choice(['RTA', 'AI Phone Call', 'Convin Sense'])} module",
                "Expansion": f"Expand to {random.choice(['Sales', 'Support', 'Collections'])} department",
                "Renewal": f"Annual renewal for {customer['company_name']}",
                "New Product": f"Add {random.choice(['Advanced Analytics', 'Custom Integration'])} capability"
            }
            
            value = random.randint(50000, 1000000)
            probability = random.randint(40, 90)
            
            stages = ["Identified", "Qualified", "Proposal", "Negotiation"]
            stage = random.choice(stages)
            
            expected_close = datetime.now(timezone.utc) + timedelta(days=random.randint(30, 180))
            
            opportunity = {
                "id": f"opportunity_{len(opportunities)+1}",
                "customer_id": customer["id"],
                "customer_name": customer["company_name"],
                "opportunity_type": opp_type,
                "title": opp_titles.get(opp_type, f"{opp_type} opportunity"),
                "description": f"Strategic expansion opportunity identified during quarterly business review.",
                "value": value,
                "probability": probability,
                "stage": stage,
                "expected_close_date": expected_close.date().isoformat(),
                "owner_id": customer["csm_owner_id"],
                "owner_name": customer["csm_owner_name"],
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(10, 60))).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            opportunities.append(opportunity)
    
    if opportunities:
        await db.opportunities.insert_many(opportunities)
    print(f"✓ Created {len(opportunities)} opportunities")

async def main():
    print("=" * 60)
    print("CONVIN.AI CSM TOOL - DATA SEEDING")
    print("=" * 60)
    
    await clear_database()
    users = await seed_users()
    customers = await seed_customers(users)
    await seed_activities(customers, users)
    await seed_risks(customers)
    await seed_opportunities(customers)
    
    print("\n" + "=" * 60)
    print("✓ DATA SEEDING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"\nLogin credentials:")
    print(f"Admin: admin@convin.ai / admin123")
    print(f"CSM: priya.sharma@convin.ai / password123")
    print(f"(All CSM users use password: password123)")
    print("\n")

if __name__ == "__main__":
    asyncio.run(main())
