# Postman API Testing Guide - Tender.ai Backend

This guide outlines how to configure, authenticate, and test all API routes in the Tender.ai Backend using Postman.

---

## 1. Postman Environment Setup

To avoid repeating the domain and authentication token in every request, configure a Postman Environment:

1. Click on **Environments** in the left sidebar of Postman.
2. Click **Create Environment** (or the `+` icon) and name it `Tender.ai Local`.
3. Add the following variables:
   * `base_url`: `http://localhost:5000` (or the port your server is running on)
   * `jwt_token`: Leave value blank (it will be populated automatically during login/register)
4. Select `Tender.ai Local` in the active environment dropdown (top right of Postman).

---

## 2. Automatic JWT Token Storing (Important)

For all **Private/Protected** routes, the API expects a Bearer Token in the `Authorization` header. You can configure Postman to automatically save the token when you login or register.

In Postman, go to the **Tests** tab of both the **Register User** and **Login User** requests, and add the following Javascript code:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const responseJson = pm.response.json();
    if (responseJson.success && responseJson.data && responseJson.data.token) {
        pm.environment.set("jwt_token", responseJson.data.token);
        console.log("JWT Token successfully stored to environment variable 'jwt_token'");
    }
}
```

---

## 3. Authorization Header Configuration

For all protected requests, set the Authorization scheme:
1. Go to the **Authorization** tab of the request.
2. Select **Type**: `Bearer Token`.
3. Set the **Token** field to: `{{jwt_token}}`.

---

## 4. API Endpoints Reference

### 0. Health Check (Public)
Verify that the service is running.
* **Method**: `GET`
* **URL**: `{{base_url}}/`

---

### A. Authentication Routes

#### 1. Register User (Public)
Registers a new user and returns a session token.
* **Method**: `POST`
* **URL**: `{{base_url}}/api/auth/register`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```

#### 2. Login User (Public)
Authenticates credentials and returns a session token.
* **Method**: `POST`
* **URL**: `{{base_url}}/api/auth/login`
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```

#### 3. Get Current User Profile (Private)
Fetches logged-in user session parameters.
* **Method**: `GET`
* **URL**: `{{base_url}}/api/auth/me`
* **Authorization**: `Bearer Token` (`{{jwt_token}}`)

---

### B. Tender Search & Crawling Routes

#### 1. Get All Tenders (Public)
Fetches and searches crawled tenders with filters.
* **Method**: `GET`
* **URL**: `{{base_url}}/api/tenders`
* **Query Parameters (Optional)**:
  * `search`: `bridge` (full-text search)
  * `source`: `Assam Tenders` or `GeM`
  * `category`: `Works`, `Goods`, `Services` or `Others`
  * `status`: `Active`
  * `minValue`: `500000`
  * `maxValue`: `5000000`
  * `closingAfter`: `2026-07-20`
  * `sort`: `publishDate:desc` or `relevance:desc`
  * `page`: `1`
  * `limit`: `10`

#### 2. Get Tender Details (Public)
Fetches detail parameters by unique Tender ID.
* **Method**: `GET`
* **URL**: `{{base_url}}/api/tenders/:id`
  *(Replace `:id` with a custom tender ID, e.g., `GEM-2026-B-123456` or MongoDB ObjectId)*

#### 3. Trigger Crawl Job On-Demand (Private/Admin Only)
Triggers background crawlers sequentially and executes active match evaluations.
* **Method**: `POST`
* **URL**: `{{base_url}}/api/tenders/trigger-crawl`
* **Authorization**: `Bearer Token` (`{{jwt_token}}`)
  *(Requires user account to have `role: "admin"`)*

---

### C. User Saved Watchlist Routes

#### 1. Get Saved Tenders (Private)
Fetches the user's watchlist items.
* **Method**: `GET`
* **URL**: `{{base_url}}/api/user/saved-tenders`
* **Authorization**: `Bearer Token` (`{{jwt_token}}`)

#### 2. Toggle Saving Tender (Private)
Saves or unsaves a tender on the watchlist.
* **Method**: `POST`
* **URL**: `{{base_url}}/api/user/saved-tenders/:id`
* **Authorization**: `Bearer Token` (`{{jwt_token}}`)
  *(Replace `:id` with custom tender ID)*

---

### D. User Alert Preferences Routes

#### 1. Get Alerts (Private)
Fetches active search match alerts configured by user.
* **Method**: `GET`
* **URL**: `{{base_url}}/api/user/alerts`
* **Authorization**: `Bearer Token` (`{{jwt_token}}`)

#### 2. Create Alert Config (Private)
Creates a new custom keyword matching search alert.
* **Method**: `POST`
* **URL**: `{{base_url}}/api/user/alerts`
* **Authorization**: `Bearer Token` (`{{jwt_token}}`)
* **Headers**: `Content-Type: application/json`
* **Body (JSON)**:
  ```json
  {
    "name": "Brahmaputra construction works",
    "keywords": ["Brahmaputra", "Bridge", "PWD"],
    "minVal": 1000000,
    "maxVal": 50000000,
    "categories": ["Works"],
    "sources": ["Assam Tenders"]
  }
  ```

#### 3. Delete Alert Config (Private)
Removes an alert preference.
* **Method**: `DELETE`
* **URL**: `{{base_url}}/api/user/alerts/:id`
* **Authorization**: `Bearer Token` (`{{jwt_token}}`)
  *(Replace `:id` with the MongoDB ObjectId of the alert)*
