Changes

[General changes]
- Added a switch button on the navbar that allows users to switch between freelancer and client, switch should apply for all pages
- Fixed a bug where the release funds button was not showing up for the client side of the website
- The freelancer now has the ability to withdraw and edit a proposal he has that hasnt been accepted yet

[Stricter seperation on Freelancers and clients]
- Made it so that freelancers can not post jobs in the explore jobs page
- Made it so that clients can no longer bid on the jobs they posted themselves
- Bidding is now only available to freelancers
- The dashboard is now mode specific, client mode only shows contracts where you are the client, proposals waiting for your review, and escrow funded. Freelancer mode now show only contracts where you're the freelancer, your active bids, and earnings.

[Cosmetic Changes]
- Gave freelancer and client their own look with a color palette swap, freelancer looks the same but client has a new palette

[Database changes]
- Added a withdrawn status to proposals table

Changes 2

[General changes]
- There are now badges in the job cards that says either accepted, rejected, or applied
- Profile pictures now exist
- Added a rating system for both freelancers and clients

[Database changes]
- Added fields to support profile pictures
- Added stuff to support the rating system


Changes 3

[General Changes]
- Added a top users page, now top freelancers and clients can be displayed
- Added a messaging functionality

[User Profile changes]
- There is now an average price for both freelancers and clients, this is used in the top users page

[Job Changes]
- There is now a fully functioning milestone feature, integrated with the Messaging feature

[Database changes]
- Schema.sql now has content
- Edited the db to support the messaging feature including RLS and Buckets


Changes 4

[External API & Financials]
- Integrated a live Third-Party Forex Currency API (open.er-api.com with server caching and graceful fallback)
- Added a currency selector in the navigation bar supporting PHP (₱), USD ($), EUR (€), JPY (¥), GBP (£), and SGD (S$)
- Explore job card budgets and Dashboard escrow metrics now recalculate in real time based on live exchange rates

[Search & Filtering Improvements]
- Upgraded the Explore search filter to search across both job titles and job categories
- Made category badges on job cards clickable so users can instantly filter jobs by category

[Mobile Responsiveness & UI Polish]
- Added a sticky header with a mobile hamburger navigation drawer
- Added a mobile slide-over filter modal for Explore
- Fixed mobile table overflow with smooth horizontal scrolling for Dashboard contracts and active bids
- Restored the official rocket logo SVG with responsive scaling and hover wiggle animation


Roadmap
- Make it so that people who choose the freelancer option also need to put in their bank details and phone number
- Make it so that people who choose the client option choose whether or not they are a small business or a major contractor and need to put in their business name. 
- Have the toast that appears when changing from client to freelancer slide in and have a mini loading bar to show how much time is left before it disappears
- Develop a messaging system - Complete
- Have clients be able to delete their posting as long as they have not accepted a freelancer for it yet