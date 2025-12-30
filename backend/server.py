from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import csv
import io
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    CSM = "CSM"
    AM = "AM"
    ADMIN = "ADMIN"

class PlanType(str, Enum):
    HOURLY = "Hourly"
    LICENSE = "License"

class HealthStatus(str, Enum):
    HEALTHY = "Healthy"
    AT_RISK = "At Risk"
    CRITICAL = "Critical"

class OnboardingStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class RiskSeverity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class RiskStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    MONITORING = "Monitoring"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

class ActivityType(str, Enum):
    WEEKLY_SYNC = "Weekly Sync"
    QBR = "QBR"
    MBR = "MBR"
    IN_PERSON_VISIT = "In-Person Visit"
    PRODUCT_FEEDBACK = "Product Feedback"
    FEATURE_REQUEST = "Feature Request"
    TRAINING_SESSION = "Training Session"
    SUPPORT_ESCALATION = "Support Escalation"
    EMAIL_COMMUNICATION = "Email Communication"
    PHONE_CALL = "Phone Call"
    EXECUTIVE_BRIEFING = "Executive Briefing"
    ONBOARDING_SESSION = "Onboarding Session"
    RENEWAL_DISCUSSION = "Renewal Discussion"
    UPSELL_DISCUSSION = "Upsell/Cross-sell Discussion"
    OTHER = "Other"

class TaskType(str, Enum):
    FOLLOW_UP_CALL = "Follow-up Call"
    FOLLOW_UP_EMAIL = "Follow-up Email"
    SCHEDULE_MEETING = "Schedule Meeting"
    SEND_DOCUMENT = "Send Document"
    REVIEW_ACCOUNT = "Review Account"
    PREPARE_QBR = "Prepare for QBR"
    TRAINING_SESSION = "Training Session"
    TECHNICAL_SETUP = "Technical Setup"
    RENEWAL_PREP = "Renewal Preparation"
    ONBOARDING_ACTIVITY = "Onboarding Activity"
    DOCUMENTATION = "Documentation"
    ESCALATION = "Escalation"
    OTHER = "Other"

class TaskStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    BLOCKED = "Blocked"
    WAITING_CUSTOMER = "Waiting on Customer"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class TaskPriority(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

# Pydantic Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.CSM

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Stakeholder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    role_type: Optional[str] = None
    is_primary: bool = False

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    plan_type: Optional[PlanType] = None
    arr: Optional[float] = None
    contract_start_date: Optional[str] = None
    contract_end_date: Optional[str] = None
    renewal_date: Optional[str] = None
    go_live_date: Optional[str] = None
    products_purchased: List[str] = []
    onboarding_status: OnboardingStatus = OnboardingStatus.NOT_STARTED
    health_score: float = 50.0
    health_status: HealthStatus = HealthStatus.AT_RISK
    risk_level: Optional[str] = None
    primary_objective: Optional[str] = None
    calls_processed: int = 0
    active_users: int = 0
    total_licensed_users: int = 0
    csm_owner_id: Optional[str] = None
    csm_owner_name: Optional[str] = None
    am_owner_id: Optional[str] = None
    am_owner_name: Optional[str] = None
    tags: List[str] = []
    stakeholders: List[Stakeholder] = []
    last_activity_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    company_name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    plan_type: Optional[PlanType] = None
    arr: Optional[float] = None
    contract_start_date: Optional[str] = None
    contract_end_date: Optional[str] = None
    renewal_date: Optional[str] = None
    go_live_date: Optional[str] = None
    products_purchased: List[str] = []
    onboarding_status: OnboardingStatus = OnboardingStatus.NOT_STARTED
    primary_objective: Optional[str] = None
    calls_processed: int = 0
    active_users: int = 0
    total_licensed_users: int = 0
    csm_owner_id: Optional[str] = None
    am_owner_id: Optional[str] = None
    tags: List[str] = []
    stakeholders: List[Stakeholder] = []

class Activity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: Optional[str] = None
    activity_type: ActivityType
    activity_date: datetime
    title: str
    summary: str
    internal_notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[str] = None
    follow_up_status: Optional[str] = None
    csm_id: str
    csm_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityCreate(BaseModel):
    customer_id: str
    activity_type: ActivityType
    activity_date: datetime
    title: str
    summary: str
    internal_notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[str] = None

class Risk(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    severity: RiskSeverity
    status: RiskStatus
    title: str
    description: str
    impact_description: Optional[str] = None
    mitigation_plan: Optional[str] = None
    revenue_impact: Optional[float] = None
    churn_probability: Optional[int] = None
    identified_date: str
    target_resolution_date: Optional[str] = None
    resolution_date: Optional[str] = None
    assigned_to_id: str
    assigned_to_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RiskCreate(BaseModel):
    customer_id: str
    category: str
    subcategory: Optional[str] = None
    severity: RiskSeverity
    title: str
    description: str
    impact_description: Optional[str] = None
    mitigation_plan: Optional[str] = None
    revenue_impact: Optional[float] = None
    churn_probability: Optional[int] = None
    identified_date: str
    target_resolution_date: Optional[str] = None
    assigned_to_id: str

class Opportunity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: Optional[str] = None
    opportunity_type: str
    title: str
    description: Optional[str] = None
    value: Optional[float] = None
    probability: Optional[int] = None
    stage: str
    expected_close_date: Optional[str] = None
    owner_id: str
    owner_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OpportunityCreate(BaseModel):
    customer_id: str
    opportunity_type: str
    title: str
    description: Optional[str] = None
    value: Optional[float] = None
    probability: Optional[int] = None
    stage: str = "Identified"
    expected_close_date: Optional[str] = None
    owner_id: str

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: Optional[str] = None
    task_type: TaskType
    title: str
    description: Optional[str] = None
    priority: TaskPriority
    status: TaskStatus
    assigned_to_id: str
    assigned_to_name: Optional[str] = None
    due_date: str
    completed_date: Optional[str] = None
    created_by_id: str
    created_by_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    customer_id: str
    task_type: TaskType
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.NOT_STARTED
    assigned_to_id: str
    due_date: str

class DataLabsReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    customer_name: Optional[str] = None
    report_date: str
    report_title: str
    report_link: str
    report_type: str
    description: Optional[str] = None
    sent_to: List[str] = []
    created_by_id: str
    created_by_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DataLabsReportCreate(BaseModel):
    customer_id: str
    report_date: str
    report_title: str
    report_link: str
    report_type: str
    description: Optional[str] = None
    sent_to: List[str] = []

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def calculate_health_score(customer: Dict) -> float:
    score = 50.0
    
    # Usage score (40% weight)
    if customer.get('active_users', 0) > 0 and customer.get('total_licensed_users', 0) > 0:
        usage_rate = customer['active_users'] / customer['total_licensed_users']
        if usage_rate >= 0.7:
            score += 15
        elif usage_rate >= 0.5:
            score += 10
        elif usage_rate >= 0.3:
            score += 5
    
    if customer.get('calls_processed', 0) > 1000:
        score += 10
    elif customer.get('calls_processed', 0) > 500:
        score += 5
    
    # Engagement score (25% weight)
    last_activity = customer.get('last_activity_date')
    if last_activity:
        try:
            days_since = (datetime.now(timezone.utc) - datetime.fromisoformat(last_activity)).days
            if days_since < 7:
                score += 15
            elif days_since < 14:
                score += 10
            elif days_since < 30:
                score += 5
        except:
            pass
    
    # Onboarding status (10% weight)
    if customer.get('onboarding_status') == 'Completed':
        score += 10
    elif customer.get('onboarding_status') == 'In Progress':
        score += 5
    
    return min(100, max(0, score))

def determine_health_status(score: float) -> str:
    if score >= 80:
        return "Healthy"
    elif score >= 50:
        return "At Risk"
    else:
        return "Critical"

# Authentication Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token(user.id, user.email, user.role)
    
    return Token(access_token=token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_dict = await db.users.find_one({"email": credentials.email})
    
    if not user_dict or not verify_password(credentials.password, user_dict['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_dict['created_at'], str):
        user_dict['created_at'] = datetime.fromisoformat(user_dict['created_at'])
    
    user = User(**{k: v for k, v in user_dict.items() if k != 'password'})
    token = create_access_token(user.id, user.email, user.role)
    
    return Token(access_token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: Dict = Depends(get_current_user)):
    user_dict = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password": 0})
    if not user_dict:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_dict['created_at'], str):
        user_dict['created_at'] = datetime.fromisoformat(user_dict['created_at'])
    
    return User(**user_dict)

# User Routes
@api_router.get("/users", response_model=List[User])
async def get_users(current_user: Dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

# Customer Routes
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: Dict = Depends(get_current_user)):
    # Get CSM details if provided
    csm_name = None
    if customer_data.csm_owner_id:
        csm = await db.users.find_one({"id": customer_data.csm_owner_id}, {"_id": 0})
        if csm:
            csm_name = csm['name']
    
    am_name = None
    if customer_data.am_owner_id:
        am = await db.users.find_one({"id": customer_data.am_owner_id}, {"_id": 0})
        if am:
            am_name = am['name']
    
    customer = Customer(
        **customer_data.model_dump(),
        csm_owner_name=csm_name,
        am_owner_name=am_name
    )
    
    # Calculate health score
    customer_dict = customer.model_dump()
    customer_dict['health_score'] = calculate_health_score(customer_dict)
    customer_dict['health_status'] = determine_health_status(customer_dict['health_score'])
    customer_dict['created_at'] = customer_dict['created_at'].isoformat()
    customer_dict['updated_at'] = customer_dict['updated_at'].isoformat()
    
    await db.customers.insert_one(customer_dict)
    
    if isinstance(customer_dict['created_at'], str):
        customer_dict['created_at'] = datetime.fromisoformat(customer_dict['created_at'])
    if isinstance(customer_dict['updated_at'], str):
        customer_dict['updated_at'] = datetime.fromisoformat(customer_dict['updated_at'])
    
    return Customer(**customer_dict)

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(current_user: Dict = Depends(get_current_user)):
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    for customer in customers:
        if isinstance(customer['created_at'], str):
            customer['created_at'] = datetime.fromisoformat(customer['created_at'])
        if isinstance(customer['updated_at'], str):
            customer['updated_at'] = datetime.fromisoformat(customer['updated_at'])
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: Dict = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if isinstance(customer['created_at'], str):
        customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    if isinstance(customer['updated_at'], str):
        customer['updated_at'] = datetime.fromisoformat(customer['updated_at'])
    
    return Customer(**customer)

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: CustomerCreate, current_user: Dict = Depends(get_current_user)):
    existing = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get CSM/AM details
    csm_name = None
    if customer_data.csm_owner_id:
        csm = await db.users.find_one({"id": customer_data.csm_owner_id}, {"_id": 0})
        if csm:
            csm_name = csm['name']
    
    am_name = None
    if customer_data.am_owner_id:
        am = await db.users.find_one({"id": customer_data.am_owner_id}, {"_id": 0})
        if am:
            am_name = am['name']
    
    update_dict = customer_data.model_dump()
    update_dict['csm_owner_name'] = csm_name
    update_dict['am_owner_name'] = am_name
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    update_dict['health_score'] = calculate_health_score({**existing, **update_dict})
    update_dict['health_status'] = determine_health_status(update_dict['health_score'])
    
    await db.customers.update_one({"id": customer_id}, {"$set": update_dict})
    
    updated = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated['updated_at'], str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return Customer(**updated)

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.customers.delete_one({"id": customer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

# Health Status Update with optional risk creation
class HealthStatusUpdate(BaseModel):
    health_status: str

@api_router.put("/customers/{customer_id}/health")
async def update_customer_health(customer_id: str, health_update: HealthStatusUpdate, current_user: Dict = Depends(get_current_user)):
    existing = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Map health status to score range
    health_score_map = {
        "Healthy": 85,
        "At Risk": 65,
        "Critical": 35
    }
    
    new_health_score = health_score_map.get(health_update.health_status, existing.get('health_score', 50))
    
    update_dict = {
        'health_status': health_update.health_status,
        'health_score': new_health_score,
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.customers.update_one({"id": customer_id}, {"$set": update_dict})
    
    return {"message": "Health status updated", "health_status": health_update.health_status, "health_score": new_health_score}

# Bulk Upload Response Model
class BulkUploadResult(BaseModel):
    success_count: int
    error_count: int
    total_rows: int
    errors: List[Dict[str, Any]] = []

@api_router.post("/customers/bulk-upload", response_model=BulkUploadResult)
async def bulk_upload_customers(file: UploadFile = File(...), current_user: Dict = Depends(get_current_user)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    success_count = 0
    error_count = 0
    errors = []
    total_rows = 0
    
    for row_num, row in enumerate(reader, start=2):  # Start at 2 to account for header
        total_rows += 1
        try:
            # Validate required field
            if not row.get('company_name'):
                errors.append({"row": row_num, "error": "Missing company_name"})
                error_count += 1
                continue
            
            # Check for existing customer
            existing = await db.customers.find_one({"company_name": row['company_name']})
            if existing:
                errors.append({"row": row_num, "error": f"Customer '{row['company_name']}' already exists"})
                error_count += 1
                continue
            
            # Get CSM owner ID from email if provided
            csm_owner_id = None
            csm_owner_name = None
            if row.get('csm_email'):
                csm = await db.users.find_one({"email": row['csm_email']}, {"_id": 0})
                if csm:
                    csm_owner_id = csm['id']
                    csm_owner_name = csm['name']
            
            # Create customer
            customer_dict = {
                "id": str(uuid.uuid4()),
                "company_name": row['company_name'],
                "website": row.get('website', ''),
                "industry": row.get('industry', ''),
                "region": row.get('region', ''),
                "plan_type": row.get('plan_type', 'License'),
                "arr": float(row['arr']) if row.get('arr') else 0,
                "renewal_date": row.get('renewal_date', ''),
                "onboarding_status": "Not Started",
                "health_score": 75,
                "health_status": "Healthy",
                "csm_owner_id": csm_owner_id,
                "csm_owner_name": csm_owner_name,
                "products_purchased": [],
                "active_users": 0,
                "total_licensed_users": 0,
                "tags": [],
                "stakeholders": [],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.customers.insert_one(customer_dict)
            success_count += 1
            
        except Exception as e:
            errors.append({"row": row_num, "error": str(e)})
            error_count += 1
    
    return BulkUploadResult(
        success_count=success_count,
        error_count=error_count,
        total_rows=total_rows,
        errors=errors
    )

# Activity Routes
@api_router.post("/activities", response_model=Activity)
async def create_activity(activity_data: ActivityCreate, current_user: Dict = Depends(get_current_user)):
    # Get customer name
    customer = await db.customers.find_one({"id": activity_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get CSM name
    csm = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    activity = Activity(
        **activity_data.model_dump(),
        customer_name=customer.get('company_name'),
        csm_id=current_user['user_id'],
        csm_name=csm.get('name') if csm else None
    )
    
    activity_dict = activity.model_dump()
    activity_dict['activity_date'] = activity_dict['activity_date'].isoformat()
    activity_dict['created_at'] = activity_dict['created_at'].isoformat()
    
    await db.activities.insert_one(activity_dict)
    
    # Update customer last activity date
    await db.customers.update_one(
        {"id": activity_data.customer_id},
        {"$set": {"last_activity_date": datetime.now(timezone.utc).isoformat()}}
    )
    
    if isinstance(activity_dict['activity_date'], str):
        activity_dict['activity_date'] = datetime.fromisoformat(activity_dict['activity_date'])
    if isinstance(activity_dict['created_at'], str):
        activity_dict['created_at'] = datetime.fromisoformat(activity_dict['created_at'])
    
    return Activity(**activity_dict)

@api_router.get("/activities", response_model=List[Activity])
async def get_activities(customer_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if customer_id:
        query['customer_id'] = customer_id
    
    activities = await db.activities.find(query, {"_id": 0}).sort("activity_date", -1).to_list(1000)
    for activity in activities:
        if isinstance(activity['activity_date'], str):
            activity['activity_date'] = datetime.fromisoformat(activity['activity_date'])
        if isinstance(activity['created_at'], str):
            activity['created_at'] = datetime.fromisoformat(activity['created_at'])
    return activities

# Risk Routes
@api_router.post("/risks", response_model=Risk)
async def create_risk(risk_data: RiskCreate, current_user: Dict = Depends(get_current_user)):
    # Get customer name
    customer = await db.customers.find_one({"id": risk_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get assigned user name
    assigned_user = await db.users.find_one({"id": risk_data.assigned_to_id}, {"_id": 0})
    
    risk = Risk(
        **risk_data.model_dump(),
        customer_name=customer.get('company_name'),
        assigned_to_name=assigned_user.get('name') if assigned_user else None,
        status=RiskStatus.OPEN
    )
    
    risk_dict = risk.model_dump()
    risk_dict['created_at'] = risk_dict['created_at'].isoformat()
    risk_dict['updated_at'] = risk_dict['updated_at'].isoformat()
    
    await db.risks.insert_one(risk_dict)
    
    if isinstance(risk_dict['created_at'], str):
        risk_dict['created_at'] = datetime.fromisoformat(risk_dict['created_at'])
    if isinstance(risk_dict['updated_at'], str):
        risk_dict['updated_at'] = datetime.fromisoformat(risk_dict['updated_at'])
    
    return Risk(**risk_dict)

@api_router.get("/risks", response_model=List[Risk])
async def get_risks(customer_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if customer_id:
        query['customer_id'] = customer_id
    
    risks = await db.risks.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for risk in risks:
        if isinstance(risk['created_at'], str):
            risk['created_at'] = datetime.fromisoformat(risk['created_at'])
        if isinstance(risk['updated_at'], str):
            risk['updated_at'] = datetime.fromisoformat(risk['updated_at'])
    return risks

@api_router.put("/risks/{risk_id}", response_model=Risk)
async def update_risk(risk_id: str, risk_data: RiskCreate, current_user: Dict = Depends(get_current_user)):
    existing = await db.risks.find_one({"id": risk_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    update_dict = risk_data.model_dump()
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.risks.update_one({"id": risk_id}, {"$set": update_dict})
    
    updated = await db.risks.find_one({"id": risk_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated['updated_at'], str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return Risk(**updated)

# Opportunity Routes
@api_router.post("/opportunities", response_model=Opportunity)
async def create_opportunity(opp_data: OpportunityCreate, current_user: Dict = Depends(get_current_user)):
    # Get customer name
    customer = await db.customers.find_one({"id": opp_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get owner name
    owner = await db.users.find_one({"id": opp_data.owner_id}, {"_id": 0})
    
    opportunity = Opportunity(
        **opp_data.model_dump(),
        customer_name=customer.get('company_name'),
        owner_name=owner.get('name') if owner else None
    )
    
    opp_dict = opportunity.model_dump()
    opp_dict['created_at'] = opp_dict['created_at'].isoformat()
    opp_dict['updated_at'] = opp_dict['updated_at'].isoformat()
    
    await db.opportunities.insert_one(opp_dict)
    
    if isinstance(opp_dict['created_at'], str):
        opp_dict['created_at'] = datetime.fromisoformat(opp_dict['created_at'])
    if isinstance(opp_dict['updated_at'], str):
        opp_dict['updated_at'] = datetime.fromisoformat(opp_dict['updated_at'])
    
    return Opportunity(**opp_dict)

@api_router.get("/opportunities", response_model=List[Opportunity])
async def get_opportunities(customer_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if customer_id:
        query['customer_id'] = customer_id
    
    opportunities = await db.opportunities.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for opp in opportunities:
        if isinstance(opp['created_at'], str):
            opp['created_at'] = datetime.fromisoformat(opp['created_at'])
        if isinstance(opp['updated_at'], str):
            opp['updated_at'] = datetime.fromisoformat(opp['updated_at'])
    return opportunities

# Task Routes
@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: Dict = Depends(get_current_user)):
    # Get customer name
    customer = await db.customers.find_one({"id": task_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get assigned user name
    assigned_user = await db.users.find_one({"id": task_data.assigned_to_id}, {"_id": 0})
    created_by = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    task = Task(
        **task_data.model_dump(),
        customer_name=customer.get('company_name'),
        assigned_to_name=assigned_user.get('name') if assigned_user else None,
        created_by_id=current_user['user_id'],
        created_by_name=created_by.get('name') if created_by else None
    )
    
    task_dict = task.model_dump()
    task_dict['created_at'] = task_dict['created_at'].isoformat()
    task_dict['updated_at'] = task_dict['updated_at'].isoformat()
    
    await db.tasks.insert_one(task_dict)
    
    if isinstance(task_dict['created_at'], str):
        task_dict['created_at'] = datetime.fromisoformat(task_dict['created_at'])
    if isinstance(task_dict['updated_at'], str):
        task_dict['updated_at'] = datetime.fromisoformat(task_dict['updated_at'])
    
    return Task(**task_dict)

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(customer_id: Optional[str] = None, assigned_to_id: Optional[str] = None, status: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if customer_id:
        query['customer_id'] = customer_id
    if assigned_to_id:
        query['assigned_to_id'] = assigned_to_id
    if status:
        query['status'] = status
    
    tasks = await db.tasks.find(query, {"_id": 0}).sort("due_date", 1).to_list(1000)
    for task in tasks:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if isinstance(task['updated_at'], str):
            task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    return tasks

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_data: TaskCreate, current_user: Dict = Depends(get_current_user)):
    existing = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_dict = task_data.model_dump()
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # If status changed to Completed, set completed_date
    if task_data.status == TaskStatus.COMPLETED and existing.get('status') != 'Completed':
        update_dict['completed_date'] = datetime.now(timezone.utc).date().isoformat()
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_dict})
    
    updated = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated['updated_at'], str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return Task(**updated)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: Dict = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# Data Labs Reports Routes
@api_router.post("/datalabs-reports", response_model=DataLabsReport)
async def create_datalabs_report(report_data: DataLabsReportCreate, current_user: Dict = Depends(get_current_user)):
    # Get customer name
    customer = await db.customers.find_one({"id": report_data.customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get created by user name
    created_by = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    
    report = DataLabsReport(
        **report_data.model_dump(),
        customer_name=customer.get('company_name'),
        created_by_id=current_user['user_id'],
        created_by_name=created_by.get('name') if created_by else None
    )
    
    report_dict = report.model_dump()
    report_dict['created_at'] = report_dict['created_at'].isoformat()
    
    await db.datalabs_reports.insert_one(report_dict)
    
    if isinstance(report_dict['created_at'], str):
        report_dict['created_at'] = datetime.fromisoformat(report_dict['created_at'])
    
    return DataLabsReport(**report_dict)

@api_router.get("/datalabs-reports", response_model=List[DataLabsReport])
async def get_datalabs_reports(customer_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    query = {}
    if customer_id:
        query['customer_id'] = customer_id
    
    reports = await db.datalabs_reports.find(query, {"_id": 0}).sort("report_date", -1).to_list(1000)
    for report in reports:
        if isinstance(report['created_at'], str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    return reports

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: Dict = Depends(get_current_user)):
    total_customers = await db.customers.count_documents({})
    total_arr = await db.customers.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$arr"}}}
    ]).to_list(1)
    
    healthy_count = await db.customers.count_documents({"health_status": "Healthy"})
    at_risk_count = await db.customers.count_documents({"health_status": "At Risk"})
    critical_count = await db.customers.count_documents({"health_status": "Critical"})
    
    open_risks = await db.risks.count_documents({"status": "Open"})
    critical_risks = await db.risks.count_documents({"severity": "Critical"})
    
    active_opportunities = await db.opportunities.count_documents({"stage": {"$ne": "Closed Won"}})
    pipeline_value = await db.opportunities.aggregate([
        {"$match": {"stage": {"$ne": "Closed Won"}}},
        {"$group": {"_id": None, "total": {"$sum": "$value"}}}
    ]).to_list(1)
    
    # Task stats
    my_tasks = await db.tasks.count_documents({"assigned_to_id": current_user['user_id'], "status": {"$ne": "Completed"}})
    overdue_tasks = await db.tasks.count_documents({
        "assigned_to_id": current_user['user_id'],
        "status": {"$ne": "Completed"},
        "due_date": {"$lt": datetime.now(timezone.utc).date().isoformat()}
    })
    
    return {
        "total_customers": total_customers,
        "total_arr": total_arr[0]['total'] if total_arr and total_arr[0].get('total') else 0,
        "healthy_customers": healthy_count,
        "at_risk_customers": at_risk_count,
        "critical_customers": critical_count,
        "open_risks": open_risks,
        "critical_risks": critical_risks,
        "active_opportunities": active_opportunities,
        "pipeline_value": pipeline_value[0]['total'] if pipeline_value and pipeline_value[0].get('total') else 0,
        "my_tasks": my_tasks,
        "overdue_tasks": overdue_tasks
    }

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
