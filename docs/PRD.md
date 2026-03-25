# JustAgro PRD
## Overview
### Introduction
JustAgro is a lightweight digital platform designed to bring transparency, trust, and structure to informal agricultural trade in local markets.
In many agricultural ecosystems, especially in emerging markets, transactions between farmers, aggregators, and buyers are largely undocumented, leading to delayed payments, disputes, and lack of financial visibility. 
Farmers often deliver produce without clear proof of transaction, while buyers and aggregators operate without a unified system to track deliveries and payments.
JustAgro addresses this gap by providing a simple, role-based system that enables aggregators to log produce deliveries, buyers to confirm payments, and farmers to receive instant, verifiable proof of transaction through digital receipts.
The product focuses on a critical moment in the value chain; **delivery-to-payment confirmation**, ensuring that every completed transaction is recorded, traceable, and trusted by all parties involved.
This document outlines the problem space, target users, product approach, and the core requirements guiding the development of JustAgro.
### Product Overview
JustAgro is a lightweight transaction platform designed to digitally capture, confirm, and record 
agricultural produce payments at the exact moment they happen. 
The product sits between three key actors in the agricultural supply chain: 
• Farmers who supply produce 
• Aggregators who collect and organize produce from multiple farmers 
• Buyers who purchase the produce in bulk 
At the moment a farmer delivers produce, the aggregator records the transaction in JustAgro. 
When payment is confirmed by the buyer, the system generates a verifiable digital receipt linked 
to that delivery. 
This transforms what is currently an informal and opaque transaction process into a structured 
and transparent digital payment record. 
Rather than trying to replace banks or payment systems, JustAgro integrates with Interswitch to 
trigger and confirm payments while recording the transaction in a permanent ledger. 
The platform focuses on solving one clear problem: 
ensuring that every agricultural transaction results in an instant, trusted payment record. 
By doing this, JustAgro helps create: 
• Payment transparency between buyers and farmers 
• Reliable transaction records for aggregators 
• Financial proof of income for farmers over time 
For the hackathon MVP, the product will demonstrate the complete transaction loop: 
1. Delivery is logged 
2. Payment is confirmed 
3. A verifiable receipt is generated 
4. The transaction is stored in a digital ledger

### Goal
The primary goal of JustAgro is to prove that agricultural transactions can be instantly verified 
and recorded at the moment payment occurs, eliminating uncertainty around payment 
confirmation. 
In the current agricultural trade system, farmers often leave delivery points without immediate 
proof that they have been paid, creating delays, disputes, and mistrust. 
JustAgro aims to solve this by creating a real-time confirmation system that connects delivery 
events with payment verification. 
The product is designed to achieve three key outcomes: 
1. Instant payment visibility 
Farmers should no longer need to wait hours or days to confirm whether a payment has been 
completed. JustAgro ensures that payment confirmation is tied directly to the delivery record. 
2. Transparent transaction history 
Each transaction becomes a structured record containing delivery and payment details, allowing 
aggregators and buyers to maintain organized financial records. 
3. Financial identity for farmers 
Over time, repeated verified transactions create a digital financial trail for farmers, which can 
later support access to financial services such as loans, insurance, or supply contracts. 
For the hackathon, the success of this goal will be demonstrated through a working prototype 
that can: 
• Log deliveries 
• Confirm payments through payment integration 
• Generate verifiable receipts 
• Store transaction records in a digital ledger 

### Idea Validation
The idea behind JustAgro is grounded in observable realities within agricultural markets across 
Nigeria and many other developing economies. 
Most agricultural trade still operates through informal systems that lack reliable documentation 
and digital verification. 
Farmers frequently depend on intermediaries or aggregators to connect with buyers, and 
transactions often rely on trust-based arrangements rather than structured financial records. 
Several market observations support the relevance of this solution: 

• Widespread informal transaction recording 
Many aggregators keep delivery records in notebooks, spreadsheets, or messaging apps. 
These records are not standardized and are difficult to verify.

• Limited payment transparency 
Even when digital transfers are used, the payment confirmation process is fragmented. Farmers 
may rely on bank alerts, screenshots, or verbal confirmation to verify payments. 

• Lack of accessible financial history 
Because transactions are rarely captured in structured systems, farmers have little or no 
documented financial activity, making it difficult to qualify for financial services.

• Increasing adoption of digital payment infrastructure 
Nigeria’s growing fintech ecosystem and payment infrastructure, including providers such as 
Interswitch; has made it possible to build systems that connect transaction events with payment 
confirmation in real time. 

JustAgro leverages this evolving infrastructure to bridge the gap between agricultural trade and 
digital financial records. 
The solution does not require new behavior from users; instead, it digitizes an existing process; 
logging deliveries and confirming payments, while adding the missing layer of trusted 
transaction verification.

Qualitative Insights: Early Market Testing 
Prototype & Setting 

A simplified mockup of the JustAgro transaction flow was presented to a small group of 
participants involved in agricultural trade. This included 5 farmers, 3 produce aggregators, and 2 
small produce buyers across local produce markets in AkwaIbom State and surrounding 
communities in Nigeria. 
Participants were shown a basic simulation of the workflow:
1. Logging a produce delivery
   
3. Confirming buyer payment
   
4. Generating an instant digital receipt
   
The objective was to understand whether digitizing this moment in the agricultural transaction 
cycle would solve a real problem. 

Feedback Method 
Semi-structured interviews were conducted to explore: 

• Payment verification challenges 

• Record-keeping practices 

• Trust gaps between farmers, aggregators, and buyers 

• Willingness to adopt a simple digital system 

Key Findings 

Farmers

Farmers reported that once produce is delivered to aggregators, they often rely on verbal 
assurances or delayed bank alerts to confirm payment. 

• Many farmers said they do not keep structured records of their sales. 

• Several participants said they would appreciate a digital receipt they could keep as proof of 
transactions. 

• Farmers expressed interest in any system that could show a clear history of payments 
received over time. 

Aggregators 

Aggregators typically manage multiple farmers and deliveries per day, often recording 
transactions in notebooks or WhatsApp messages. 

• Aggregators noted that reconciling deliveries and payments later can be confusing.

• Several said a system that logs deliveries and ties them to payments automatically would 
simplify their operations. 

• They also expressed interest in being able to show buyers organized transaction records. 

Buyers 

Buyers reported that they often make payments but lack structured documentation linking 
payments to specific deliveries.

• Buyers said they would prefer a system where payment confirmation automatically generates 
a transaction record. 

• Some also expressed interest in having a clearer overview of past purchases from different 
aggregators. 

Overall Insight;

All participant groups emphasized that any system introduced must be: 

• Extremely simple to use 

• Mobile-friendly 

• Able to generate clear payment proof instantly 

Sample Interview Prompts;

• How do you currently confirm that a farmer has been paid after delivery? 

• How do you record transactions between farmers, aggregators, and buyers? 

• What problems happen when payments are delayed or unclear? 

• Would you use a mobile system that logs deliveries and confirms payments instantly? 

• How important is having a record of past transactions? 

---
## Problem Statement
Across agricultural supply chains in Nigeria, thousands of smallholder farmers sell produce 
through informal networks of agro-aggregators and local buyers. While these transactions 
happen every day, most of them leave no reliable digital record. 
When a farmer delivers produce to an aggregator or collection center, payment confirmation is 
often unclear. Farmers may be told that payment has been initiated, delayed, or processed 
through a bank transfer, but they rarely receive an immediate, verifiable receipt proving that the 
transaction actually occurred. 
This creates several systemic problems: 
1. Lack of transaction proof; 
Farmers often rely on verbal confirmations, handwritten notes, or WhatsApp messages as 
evidence of payment. These are not trusted records and are easily disputed.
 
2. Delayed payment visibility;
Even when payments are eventually made through banks or fintech platforms, farmers may wait 
hours or days before receiving confirmation. During this period, trust breaks down between 
farmers, aggregators, and buyers.

3. No verifiable financial history;
Because most agricultural transactions are undocumented, farmers cannot build a reliable 
financial track record. This makes it difficult for them to qualify for credit, microloans, or formal 
financial services.

4. Disputes in the supply chain;
Without a transparent record of deliveries and payments, disagreements frequently occur 
between farmers, aggregators, and buyers about what was delivered, what was paid, and when 
payment was confirmed. 

In a country where agriculture contributes significantly to livelihoods and food supply, the 
absence of simple, verifiable payment records creates friction, mistrust, and financial exclusion 
across the entire supply chain. 
There is currently no lightweight system designed specifically for agro-aggregators to instantly 
confirm and record payments at the moment produce is delivered, creating a trusted ledger that 
both farmers and buyers can rely on.

---

## Solution Overview
JustAgro is a simple digital system that turns every produce delivery into an instant, verifiable 
payment record for farmers, aggregators, and buyers. 
Instead of relying on verbal confirmation or screenshots of bank alerts, JustAgro allows 
aggregators to log a produce delivery and trigger a payment confirmation in real time, creating a 
trusted digital receipt that all parties can see. 
The product focuses on one critical moment in the agricultural supply chain:

the moment produce changes hands and payment is expected. 

How JustAgro Works; 
Aggregator logs the delivery 
When a farmer delivers produce (for example maize, cassava, or tomatoes), 
the aggregator records the transaction in JustAgro by entering simple details such as: 

• Farmer name

• Produce type

• Quantity delivered 

• Agreed price

This creates a pending delivery record in the system. 

Buyer confirms payment;

Once the buyer is ready to pay, they confirm the transaction through the platform. The system 
then triggers a payment confirmation through a payment infrastructure such as Interswitch or 
another payment integration. 

Instant payment receipt is generated;  

As soon as the payment is confirmed, JustAgro automatically generates a digital receipt and 
transaction record linked to that delivery. 
The receipt includes: 

• Farmer details

• Produce and quantity 

• Payment amount 

• Timestamp 

• Transaction reference;

Farmer receives verifiable proof of payment; 

The farmer receives a shareable digital receipt (via SMS, WhatsApp, or link) that serves as 
permanent proof of the transaction. 

JustAgro is not trying to replace banks or fintech apps. 
Instead, it adds a trusted transaction layer specifically designed for agricultural trade. 
It solves three core problems at once: 

• Farmers get clear proof that they have been paid

• Aggregators get organized delivery and payment records 

• The supply chain gains a transparent transaction history 

Over time, these verified receipts can also serve as evidence of real economic activity, helping 
farmers demonstrate income history when applying for financial services.

---

## Target Customers
JustAgro is designed for participants within the agricultural produce supply chain, particularly 
those involved in the buying, aggregation, and payment of farm produce. The platform focuses 
on users who currently manage transactions informally and lack reliable digital records of 
deliveries and payments. 
The primary users of JustAgro are smallholder farmers, produce aggregators, and bulk 
buyers who interact daily in agricultural markets across Nigeria.

Primary Users 

Smallholder Farmers 

Smallholder farmers form the foundation of the agricultural supply chain. These farmers typically 
cultivate crops on small plots of land and sell their harvest to aggregators who transport and sell 
the produce to larger buyers or markets. 
However, most farmers operate without structured financial records of their sales. Payments are 
often confirmed through bank alerts or verbal communication, which makes it difficult for farmers 
to maintain a reliable transaction history. 

JustAgro serves farmers by providing:

• Instant digital receipts when payments are confirmed 

• A history of completed transactions linked to their produce deliveries 

• Clear proof of income from agricultural sales 

Over time, this creates a verifiable record of financial activity that farmers can use when 
interacting with financial institutions or agricultural cooperatives. 

Produce Aggregators 

Aggregators act as the middle layer between farmers and buyers, collecting produce from 
multiple farmers before selling in bulk to processors, distributors, or market buyers. 
Aggregators often manage dozens of daily transactions, but many still rely on manual record 
keeping such as notebooks, spreadsheets, or messaging applications. 

JustAgro helps aggregators by: 

• Providing a simple interface to log produce deliveries 

• Linking delivery records directly to payment confirmations

• Creating an organized ledger of transactions 

This reduces reconciliation challenges and helps aggregators maintain clearer records of their 
operations. 

Produce Buyers 

Buyers include food processors, wholesale distributors, retailers, and large market traders who 
purchase produce in bulk from aggregators. 
While buyers frequently make payments digitally through banks or fintech platforms, these 
payments are rarely tied to specific delivery records in a structured system. 

JustAgro allows buyers to: 

• Confirm payments tied to a specific produce delivery 

• Generate instant transaction receipts 

• Maintain a clear record of agricultural purchases 

Secondary Users 

Agricultural Cooperatives;  
Farmer cooperatives often coordinate the sale of produce on behalf of multiple farmers. These 
organizations may use JustAgro to track group deliveries and payments, ensuring that members 
receive accurate transaction records. 

Financial Institutions; 
Banks and microfinance institutions frequently struggle to assess the financial activity of farmers 
due to limited transaction documentation. 

A system like JustAgro can provide structured payment records, helping lenders better 
understand farmer cash flows when evaluating loan applications. 

---

## High-Level User Flow
The JustAgro user flow is designed to be simple, fast, and intuitive, ensuring that farmers, 
aggregators, and buyers can complete transactions with minimal friction. Because the product is 
intended for users with varying levels of digital literacy, the workflow focuses on reducing 
complexity while capturing the most critical transaction events: delivery, payment confirmation, 
and receipt generation. 
The platform centers around the produce delivery moment, ensuring that once a farmer delivers 
produce, the system quickly records the transaction and links it to a confirmed payment. 

Step 1: Aggregator Logs Produce Delivery

When a farmer delivers produce to an aggregator, the aggregator opens the JustAgro platform 
and records the delivery details. 
Key information entered includes: 

• Farmer name or ID 

• Produce type (e.g., maize, cassava, tomatoes) 

• Quantity delivered 

• Agreed transaction price 

• Buyer assigned to the purchase 

Once submitted, the system creates a pending transaction record. 
At this stage, the delivery is documented but payment is not yet confirmed. 

Step 2: Transaction Notification Sent to Buyer 

After the delivery record is created, the buyer associated with the transaction receives a 
notification prompting them to confirm payment. 

The notification includes: 

• Delivery details 

• Payment amount 

• Aggregator information 

• Transaction reference 

This step ensures that the buyer clearly understands what delivery they are paying for, 
preventing confusion across multiple transactions. 

Step 3: Buyer Confirms Payment 

The buyer initiates payment through the integrated payment infrastructure such as Interswitch. 
Once the payment is successfully completed, the system receives confirmation and updates the 
transaction status from Pending Payment to Payment Confirmed. 
This step ensures that the delivery record is now directly linked to a verified financial 
transaction. 

Step 4: Instant Digital Receipt Generation 

Once payment confirmation is received, JustAgro automatically generates a digital transaction 
receipt. 

The receipt contains: 

• Farmer name 

• Aggregator name 

• Produce type and quantity 

• Transaction amount 

• Payment confirmation reference 

• Timestamp of transaction 

This receipt becomes a verifiable record of the completed transaction. 

Step 5: Farmer Receives Payment Confirmation 

The farmer receives a simple digital notification confirming that payment has been completed. 
The notification can be delivered through: 

• SMS 

• WhatsApp message 

• In-app notification
This gives the farmer immediate reassurance that the payment has been successfully 
processed. 

Step 6: Transaction Stored in Ledger 

The completed transaction is stored within the JustAgro platform as part of a digital transaction 
ledger. 

This ledger allows users to: 

• Review past transactions 

• Track produce deliveries and payments 

• Maintain organized financial records 

Over time, this ledger becomes a valuable record of agricultural trade activity. 

---

## User Stories
1. User Onboarding & Account Setup 

a. Account Creation (Farmers, Aggregators, Buyers) 

• As a new user, I want to create an account using email or phone number so that I can 
access the JustAgro platform. 

b. Profile Setup (Farmers) 

• As a farmer, I want to set up my profile with my name, produce type, and location so that 
aggregators can identify and record my deliveries. 

c. Profile Setup (Aggregators) 

• As an aggregator, I want to create a profile that identifies my collection center or market 
so that buyers can associate payments with my produce transactions. 

d. Profile Setup (Buyers) 

• As a buyer, I want to set up my account with my business details so that I can confirm 
payments tied to produce deliveries. 

e. Account Verification 

• As a user, I want to verify my phone number or email so that my transactions on the 
platform are trusted and secure. 


2. Produce Delivery & Transaction Logging 

a. Log Produce Delivery 

• As an aggregator, I want to record when a farmer delivers produce so that every 
transaction has a digital record. 

b. Associate Buyer to Delivery 

• As an aggregator, I want to assign a buyer to a produce delivery so that the system 
knows who is responsible for payment. 

c. View Delivery Details 

• As a buyer, I want to view the details of a produce delivery so that I can confirm what I 
am paying for. 


3. Payment Confirmation 

a. Initiate Payment 

• As a buyer, I want to confirm payment for a specific produce delivery so that the 
transaction is completed. 

b. Payment Verification 

• As the system, I want to verify payment through payment infrastructure such as 
Interswitch so that payments are trusted and recorded. 


4. Transaction Receipts & History 

a. Instant Payment Confirmation 

• As a farmer, I want to receive confirmation when payment is completed so that I know I 
have been paid. 

b. Digital Receipt Generation 

• As a user, I want the system to generate a receipt after payment so that the transaction 
can be referenced later. 

c. Transaction History 

• As an aggregator or buyer, I want to view past transactions so that I can track deliveries 
and payments over time. 


5. Notifications & Alerts 

a. Payment Notifications 

• As a farmer, I want to receive a notification when my produce payment is confirmed so 
that I stay informed. 

b. Transaction Updates 

• As a user, I want notifications when deliveries are logged or payments are confirmed so 
that I always know the transaction status.

---

## Success Metrics
JustAgro’s success will be measured by its ability to increase transparency and trust in 
agricultural transactions. 

User Adoption 

• Number of farmers onboarded to the platform 

• Number of aggregators logging deliveries 

• Number of buyers confirming payments 

Transaction Activity 

• Total produce deliveries logged 

• Total payments confirmed 

• Total digital receipts generated 

Trust & Transparency Outcomes 

• Percentage of deliveries successfully linked to payments 

• Reduction in disputes around payment confirmation 

• Growth in verified transaction histories for farmers 

---

## KPIs
Product KPIs 
Goal: Deliver a simple system that captures and verifies agricultural transactions. 

• Delivery logging completion rate ≥ 90% 

• Payment confirmation success rate ≥ 95% 

• Average transaction confirmation time ≤ 2 minutes 

• System uptime ≥ 99% 

Adoption KPIs 
Goal: Ensure farmers, aggregators, and buyers actively use the platform. 

• Active users across the three user groups 

• Number of transactions recorded per user 

• Growth in transaction volume month-over-month 

Ecosystem Impact KPIs 
Goal: Improve transparency in agricultural trade. 

• Percentage of farmers with verified transaction histories 

• Increase in digitally recorded agricultural transactions 

• Growth in repeat platform usage by aggregators and buyers

---

## Product Requirements
Functional Requirements 

A. User Registration & Authentication 

• Farmers, aggregators, and buyers must be able to register and log into the platform. 

• Basic account verification must be supported to ensure secure transactions. 

B. Delivery Recording 

• Aggregators must be able to record produce deliveries from farmers. 

• Each delivery record must include produce type, quantity, and buyer assignment. 

C. Payment Confirmation 

• Buyers must be able to confirm payment for recorded deliveries. 

• The system must verify payment through integration with payment infrastructure such as 
Interswitch. 

D. Receipt Generation 

• Once payment is confirmed, the system must generate a digital receipt documenting the 
completed transaction. 

E. Transaction History 

• Users must be able to view a ledger of past deliveries and payments.
---

## UX & UI Design Brief

Visual language 

• Clean, warm palette (earth tones with a high-contrast accent, e.g., deep green #0B6E4F 
and warm gold #F6B042). 

• Large CTAs, readable typography (system sans + 18px body for phone). 

• Photo-forward receipts (tiny thumbnail next to receipt metadata). 

Key screens & interaction notes 

1. Aggregator — Dashboard — Pending deliveries triaged with large card UI; each card 
shows farmer name, qty, quick photo, amount; swipe to create or cancel. CTA: Confirm 
& Notify Buyer. 

2. Buyer — Confirm — Minimal page: delivery summary + giant Confirm & Pay button; 
after click show payment UI modal & fallback link. 

3. Farmer — Receipt — Short receipt: “You received ₦X for Y kg of maize on DATE. 
TxRef: XXX.” One big Download button and Share (WhatsApp) quick action. SMS 
includes shortened link to receipt. 

4. Admin — Audit timeline — Vertical feed with color-coded events (created, confirmed, 
payment webhook, receipt issued). 

Accessibility 
• High contrast mode, alt text for images, large touch targets, clear error messages and 
retry affordances. 

Microcopy 
• Use empathetic, action-oriented text: “Delivery saved. Waiting for buyer confirmation.” 
“Payment received — money will be available in your account now.” 


---

## Technical Aspects

The JustAgro prototype will be implemented as a web-based platform to ensure accessibility 
across devices and reduce development complexity during the hackathon. 
The system architecture will support: 

• rapid frontend development for user interfaces 

• a lightweight backend to handle transaction logic 

• a database to store delivery and payment records 

• integration with payment APIs to verify transaction completion 

Suggested Technology Stack 
Frontend 
• React / Next.js 
• Tailwind CSS 
• Rapid UI frameworks 
(Or vibe-code frontend) 

Backend 

• Node.js 

• Express.js 

Database 

• PostgreSQL 

• Firebase (faster for hackathon) 

Payment Infrastructure; 
API integration with 

• Interswitch 

Hosting 

• Vercel 

• Render 

• Railway
---

## Rollout Plan
Phase 1 — Hackathon Prototype 
Goal: Demonstrate the core transaction flow. 
The prototype will showcase: 

• Delivery logging 

• Payment confirmation 

• Digital receipt generation 

• Transaction history 

Phase 2 — Pilot Deployment 

The platform will be tested with a small group of: 

• farmers 

• aggregators 

• produce buyers 

within a local agricultural market cluster. 

Phase 3 — Market Expansion 

Following successful pilot testing, JustAgro can expand across agricultural markets in Nigeria.

---

## Constraints
Time Constraints 

The hackathon duration of four days limits the product to core features only. 
Payment Integration Constraints 

Access to live payment APIs may be limited, requiring simulated integrations during the 
prototype phase. 

User Accessibility Constraints 

Target users may have limited digital literacy or low-end devices, requiring a simple and mobile
friendly interface.

---

## Out of Scope

The following features are excluded from the MVP to maintain focus: 

• Agricultural loan services 

• Advanced credit scoring models 

• Blockchain-based storage 

• Logistics and produce delivery tracking 

• Multi-currency payment systems


---

## Non-Functional Requirements

Performance 

• The system must process delivery logging and payment confirmation quickly, ideally within 
seconds. 

Scalability 

• The platform should support future growth as transaction volumes increase. 

Security 

• User data and transaction records must be securely stored and protected from unauthorized 
access. 

Usability 

• The platform must be mobile-friendly and easy to use for first-time users.
