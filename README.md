### Project Overview

This is an AWS Serverless Application - Task Manager application. The repo contains a static frontend (HTML/CSS/JS) and a backend implemented as AWS Lambda functions (Node.js), with data stored in DynamoDB.

Repository layout (important):
- `src/frontend/` — `index.html` and `static/` (CSS, JS)
- `src/backend/` — `index.mjs` (Lambda handler)

This README explains how to run the frontend locally and the basic steps to deploy the app to AWS.

---

## Run Frontend Locally

Requirements: a modern browser. Optionally `python3` to serve files.

1) Configure API URL

- Open `src/frontend/static/js/script.js` (or `static/js/script.js`) and set the `API_URL` constant to your API Gateway endpoint after deployment, for example:

```javascript
const API_URL = "https://<your-api-id>.execute-api.<region>.amazonaws.com/prod/tasks";
```

2) Serve the frontend

From the repository root run:

```bash
# serve files on port 8000
python3 -m http.server 8000
# then open http://localhost:8000/src/frontend/index.html
```

Note: If the backend is not yet deployed, you can mock the API (e.g., with a small Express server or Postman mock).

---

## Test Backend Locally (optional)

If you want to test the Lambda handler locally:

- Use AWS SAM to run `sam local start-api` (recommended for realistic testing).
- Or create a tiny Express wrapper that imports the Lambda handler and exposes the same endpoints for local testing.

Example concept (not included): create `dev-server.js` that imports the handler from `src/backend/index.mjs` and maps `/tasks` routes.

---

## Deploy to AWS (basic steps)

#### 1. Database (DynamoDB)
* Create a table named `TasksTable` with `taskId` (String) as the **Partition Key**.
* Create a **Global Secondary Index (GSI)** named `userId-index` with `userId` as the Partition Key.

#### 2. Networking (VPC)
* Create a **Custom VPC** with CIDR `10.0.0.0/16`.
* Create **2 Private Subnets** in different Availability Zones.
* Create a **VPC Gateway Endpoint** for DynamoDB and associate it with your private route table.
* Ensure **no NAT Gateway** is created to maintain zero costs.

#### 3. Backend (Lambda)
* Deploy the code from `index.mjs`.
* **VPC Configuration**: Attach the Lambda to your Custom VPC and the two private subnets.
* **Security Group**: Allow outbound traffic on port 443 to the **DynamoDB Prefix List** only.
* **Concurrency**: Set **Reserved Concurrency to 50**[cite: 124, 145].

#### 4. API Layer (API Gateway)
* Create a **REST API** with a `/tasks` resource and appropriate methods (GET, POST, PUT, DELETE).
* **CORS**: Set `Access-Control-Allow-Origin` to your CloudFront domain (do NOT use `*`).
* **Throttling**: Set Rate to 100 and Burst to 50.

#### 5. Frontend Hosting (S3 & CloudFront)
* Upload `index.html` and the `static/` folder to an **S3 Bucket**.
* **S3 Security**: Enable all **Block Public Access** settings and disable Static Website Hosting.
* **CloudFront**: Create a distribution with **Origin Access Control (OAC)** to allow CloudFront to read from the private S3 bucket.

#### 6. Monitoring
* Create a **CloudWatch Dashboard** named `TaskManager-Dashboard`.
* Set up **CloudWatch Alarms** for Lambda Errors (>10) and API 5XX Errors (>5) linked to an **SNS Topic** for email alerts.
* Set an **AWS Budget** with a $0.01 limit.