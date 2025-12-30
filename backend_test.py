#!/usr/bin/env python3
"""
Backend API Testing for Convin Elevate CSM Platform
Tests all backend APIs including authentication, tasks, data labs reports, and other endpoints.
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://csm-elevate.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@convin.ai"
ADMIN_PASSWORD = "admin123"
CSM_EMAIL = "priya.sharma@convin.ai"
CSM_PASSWORD = "password123"

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user_id = None
        self.customer_id = None
        self.task_id = None
        self.report_id = None
        self.results = {
            "authentication": {"passed": 0, "failed": 0, "details": []},
            "tasks": {"passed": 0, "failed": 0, "details": []},
            "datalabs_reports": {"passed": 0, "failed": 0, "details": []},
            "customers": {"passed": 0, "failed": 0, "details": []},
            "activities": {"passed": 0, "failed": 0, "details": []},
            "risks": {"passed": 0, "failed": 0, "details": []},
            "opportunities": {"passed": 0, "failed": 0, "details": []},
            "health_status": {"passed": 0, "failed": 0, "details": []},
            "bulk_upload": {"passed": 0, "failed": 0, "details": []}
        }

    def log_result(self, category: str, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test result"""
        if success:
            self.results[category]["passed"] += 1
            status = "✅ PASS"
        else:
            self.results[category]["failed"] += 1
            status = "❌ FAIL"
        
        detail = {
            "test": test_name,
            "status": status,
            "message": message
        }
        if response_data and not success:
            detail["response"] = response_data
            
        self.results[category]["details"].append(detail)
        print(f"{status}: {test_name} - {message}")

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        
        default_headers = {"Content-Type": "application/json"}
        if self.token:
            default_headers["Authorization"] = f"Bearer {self.token}"
        
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=default_headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n=== Testing Authentication ===")
        
        # Test admin login
        login_data = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        success, response, status_code = self.make_request("POST", "/auth/login", login_data)
        
        if success and "access_token" in response:
            self.token = response["access_token"]
            self.user_id = response["user"]["id"]
            self.log_result("authentication", "Admin Login", True, f"Successfully logged in as {ADMIN_EMAIL}")
        else:
            self.log_result("authentication", "Admin Login", False, f"Login failed: {response}", response)
            return False
        
        # Test get current user
        success, response, status_code = self.make_request("GET", "/auth/me")
        if success and "email" in response:
            self.log_result("authentication", "Get Current User", True, f"Retrieved user info for {response['email']}")
        else:
            self.log_result("authentication", "Get Current User", False, f"Failed to get user info: {response}", response)
        
        # Test CSM user login
        csm_login_data = {"email": CSM_EMAIL, "password": CSM_PASSWORD}
        success, response, status_code = self.make_request("POST", "/auth/login", csm_login_data, headers={"Authorization": ""})
        
        if success and "access_token" in response:
            self.log_result("authentication", "CSM User Login", True, f"Successfully logged in as {CSM_EMAIL}")
        else:
            self.log_result("authentication", "CSM User Login", False, f"CSM login failed: {response}", response)
        
        return True

    def test_customers_api(self):
        """Test customers API"""
        print("\n=== Testing Customers API ===")
        
        # Test GET customers
        success, response, status_code = self.make_request("GET", "/customers")
        if success and isinstance(response, list):
            customer_count = len(response)
            if customer_count >= 30:
                self.log_result("customers", "Get Customers", True, f"Retrieved {customer_count} customers (expected 30+)")
                # Store first customer ID for other tests
                if response:
                    self.customer_id = response[0]["id"]
            else:
                self.log_result("customers", "Get Customers", False, f"Expected 30+ customers, got {customer_count}")
        else:
            self.log_result("customers", "Get Customers", False, f"Failed to get customers: {response}", response)

    def test_tasks_api(self):
        """Test tasks API (CRUD operations)"""
        print("\n=== Testing Tasks API ===")
        
        if not self.customer_id:
            self.log_result("tasks", "Tasks API Setup", False, "No customer_id available for testing")
            return
        
        # Test GET tasks (initially empty)
        success, response, status_code = self.make_request("GET", "/tasks")
        if success and isinstance(response, list):
            self.log_result("tasks", "Get Tasks (Initial)", True, f"Retrieved {len(response)} tasks")
        else:
            self.log_result("tasks", "Get Tasks (Initial)", False, f"Failed to get tasks: {response}", response)
        
        # Test POST - Create task
        task_data = {
            "customer_id": self.customer_id,
            "task_type": "Follow-up Call",
            "title": "Follow up on Q4 renewal discussion",
            "description": "Call customer to discuss renewal terms and pricing for Q4 contract",
            "priority": "High",
            "status": "Not Started",
            "assigned_to_id": self.user_id,
            "due_date": (datetime.now() + timedelta(days=7)).date().isoformat()
        }
        
        success, response, status_code = self.make_request("POST", "/tasks", task_data)
        if success and "id" in response:
            self.task_id = response["id"]
            self.log_result("tasks", "Create Task", True, f"Created task with ID: {self.task_id}")
        else:
            self.log_result("tasks", "Create Task", False, f"Failed to create task: {response}", response)
            return
        
        # Test GET tasks after creation
        success, response, status_code = self.make_request("GET", "/tasks")
        if success and isinstance(response, list) and len(response) > 0:
            self.log_result("tasks", "Get Tasks (After Create)", True, f"Retrieved {len(response)} tasks including new task")
        else:
            self.log_result("tasks", "Get Tasks (After Create)", False, f"Failed to get tasks after creation: {response}", response)
        
        # Test PUT - Update task
        update_data = {
            "customer_id": self.customer_id,
            "task_type": "Follow-up Call",
            "title": "UPDATED: Follow up on Q4 renewal discussion",
            "description": "Updated description: Call customer to discuss renewal terms and pricing for Q4 contract",
            "priority": "Critical",
            "status": "In Progress",
            "assigned_to_id": self.user_id,
            "due_date": (datetime.now() + timedelta(days=5)).date().isoformat()
        }
        
        success, response, status_code = self.make_request("PUT", f"/tasks/{self.task_id}", update_data)
        if success and response.get("title", "").startswith("UPDATED:"):
            self.log_result("tasks", "Update Task", True, f"Successfully updated task {self.task_id}")
        else:
            self.log_result("tasks", "Update Task", False, f"Failed to update task: {response}", response)

    def test_datalabs_reports_api(self):
        """Test Data Labs Reports API"""
        print("\n=== Testing Data Labs Reports API ===")
        
        if not self.customer_id:
            self.log_result("datalabs_reports", "Reports API Setup", False, "No customer_id available for testing")
            return
        
        # Test GET reports (initially empty)
        success, response, status_code = self.make_request("GET", "/datalabs-reports")
        if success and isinstance(response, list):
            self.log_result("datalabs_reports", "Get Reports (Initial)", True, f"Retrieved {len(response)} reports")
        else:
            self.log_result("datalabs_reports", "Get Reports (Initial)", False, f"Failed to get reports: {response}", response)
        
        # Test POST - Create report
        report_data = {
            "customer_id": self.customer_id,
            "report_date": datetime.now().date().isoformat(),
            "report_title": "Q4 Performance Analytics Report",
            "report_link": "https://datalabs.convin.ai/reports/q4-performance-analytics",
            "report_type": "Performance Analytics",
            "description": "Comprehensive analysis of customer performance metrics for Q4 including call volume, sentiment analysis, and key insights",
            "sent_to": ["customer@example.com", "stakeholder@example.com"]
        }
        
        success, response, status_code = self.make_request("POST", "/datalabs-reports", report_data)
        if success and "id" in response:
            self.report_id = response["id"]
            self.log_result("datalabs_reports", "Create Report", True, f"Created report with ID: {self.report_id}")
        else:
            self.log_result("datalabs_reports", "Create Report", False, f"Failed to create report: {response}", response)
            return
        
        # Test GET reports after creation
        success, response, status_code = self.make_request("GET", "/datalabs-reports")
        if success and isinstance(response, list) and len(response) > 0:
            self.log_result("datalabs_reports", "Get Reports (After Create)", True, f"Retrieved {len(response)} reports including new report")
        else:
            self.log_result("datalabs_reports", "Get Reports (After Create)", False, f"Failed to get reports after creation: {response}", response)

    def test_activities_api(self):
        """Test Activities API"""
        print("\n=== Testing Activities API ===")
        
        if not self.customer_id:
            self.log_result("activities", "Activities API Setup", False, "No customer_id available for testing")
            return
        
        # Test GET activities
        success, response, status_code = self.make_request("GET", "/activities")
        if success and isinstance(response, list):
            self.log_result("activities", "Get Activities", True, f"Retrieved {len(response)} activities")
        else:
            self.log_result("activities", "Get Activities", False, f"Failed to get activities: {response}", response)
        
        # Test POST - Create activity
        activity_data = {
            "customer_id": self.customer_id,
            "activity_type": "Weekly Sync",
            "activity_date": datetime.now().isoformat(),
            "title": "Weekly sync meeting with customer team",
            "summary": "Discussed project progress, upcoming milestones, and addressed customer concerns about implementation timeline",
            "internal_notes": "Customer seems satisfied with progress. Need to follow up on training schedule.",
            "sentiment": "Positive",
            "follow_up_required": True,
            "follow_up_date": (datetime.now() + timedelta(days=3)).date().isoformat()
        }
        
        success, response, status_code = self.make_request("POST", "/activities", activity_data)
        if success and "id" in response:
            self.log_result("activities", "Create Activity", True, f"Created activity with ID: {response['id']}")
        else:
            self.log_result("activities", "Create Activity", False, f"Failed to create activity: {response}", response)

    def test_risks_api(self):
        """Test Risks API"""
        print("\n=== Testing Risks API ===")
        
        if not self.customer_id:
            self.log_result("risks", "Risks API Setup", False, "No customer_id available for testing")
            return
        
        # Test GET risks
        success, response, status_code = self.make_request("GET", "/risks")
        if success and isinstance(response, list):
            self.log_result("risks", "Get Risks", True, f"Retrieved {len(response)} risks")
        else:
            self.log_result("risks", "Get Risks", False, f"Failed to get risks: {response}", response)
        
        # Test POST - Create risk
        risk_data = {
            "customer_id": self.customer_id,
            "category": "Adoption",
            "subcategory": "Low Usage",
            "severity": "Medium",
            "title": "Declining user engagement metrics",
            "description": "Customer's active user count has decreased by 25% over the past month",
            "impact_description": "Potential impact on renewal likelihood and expansion opportunities",
            "mitigation_plan": "Schedule training sessions and provide additional support resources",
            "revenue_impact": 50000.0,
            "churn_probability": 30,
            "identified_date": datetime.now().date().isoformat(),
            "target_resolution_date": (datetime.now() + timedelta(days=30)).date().isoformat(),
            "assigned_to_id": self.user_id
        }
        
        success, response, status_code = self.make_request("POST", "/risks", risk_data)
        if success and "id" in response:
            self.log_result("risks", "Create Risk", True, f"Created risk with ID: {response['id']}")
        else:
            self.log_result("risks", "Create Risk", False, f"Failed to create risk: {response}", response)

    def test_opportunities_api(self):
        """Test Opportunities API"""
        print("\n=== Testing Opportunities API ===")
        
        if not self.customer_id:
            self.log_result("opportunities", "Opportunities API Setup", False, "No customer_id available for testing")
            return
        
        # Test GET opportunities
        success, response, status_code = self.make_request("GET", "/opportunities")
        if success and isinstance(response, list):
            self.log_result("opportunities", "Get Opportunities", True, f"Retrieved {len(response)} opportunities")
        else:
            self.log_result("opportunities", "Get Opportunities", False, f"Failed to get opportunities: {response}", response)
        
        # Test POST - Create opportunity
        opportunity_data = {
            "customer_id": self.customer_id,
            "opportunity_type": "Upsell",
            "title": "Additional license expansion",
            "description": "Customer interested in purchasing 50 additional licenses for new department",
            "value": 75000.0,
            "probability": 70,
            "stage": "Qualified",
            "expected_close_date": (datetime.now() + timedelta(days=45)).date().isoformat(),
            "owner_id": self.user_id
        }
        
        success, response, status_code = self.make_request("POST", "/opportunities", opportunity_data)
        if success and "id" in response:
            self.log_result("opportunities", "Create Opportunity", True, f"Created opportunity with ID: {response['id']}")
        else:
            self.log_result("opportunities", "Create Opportunity", False, f"Failed to create opportunity: {response}", response)

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("BACKEND API TEST SUMMARY")
        print("="*60)
        
        total_passed = 0
        total_failed = 0
        
        for category, results in self.results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status_icon = "✅" if failed == 0 else "❌" if passed == 0 else "⚠️"
            print(f"{status_icon} {category.upper()}: {passed} passed, {failed} failed")
            
            # Show failed tests
            for detail in results["details"]:
                if "❌ FAIL" in detail["status"]:
                    print(f"   - {detail['test']}: {detail['message']}")
        
        print("-" * 60)
        print(f"TOTAL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 ALL TESTS PASSED!")
        else:
            print(f"⚠️  {total_failed} TESTS FAILED - Review above for details")
        
        return total_failed == 0

    def run_all_tests(self):
        """Run all API tests"""
        print("Starting Convin Elevate Backend API Tests...")
        print(f"Base URL: {self.base_url}")
        
        # Authentication is required for all other tests
        if not self.test_authentication():
            print("❌ Authentication failed - cannot proceed with other tests")
            return False
        
        # Test APIs in order of priority
        self.test_customers_api()  # Need customer_id for other tests
        self.test_tasks_api()      # High priority
        self.test_datalabs_reports_api()  # High priority
        self.test_activities_api()  # Medium priority
        self.test_risks_api()      # Medium priority
        self.test_opportunities_api()  # Medium priority
        
        return self.print_summary()

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)