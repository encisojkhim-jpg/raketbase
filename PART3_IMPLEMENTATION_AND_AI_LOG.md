# Part 3: Contract Execution & Escrow — Implementation & AI Usage Log

**Project:** RaketBase (ITS122P Final Project) — Freelance Marketplace Platform  
**Scope:** Part 3 — Contract Execution & Escrow (Member 4)  
**Authors:** Student Engineering Team (Pair programmed with Gemini in Antigravity IDE & Claude as Independent Reviewer)  
**Date:** September 18, 2026  

---

## 1. Overview

Part 3 implements **Contract Execution & Escrow**, establishing the bridge between the initial hiring decision and final project delivery. When a client accepts a freelancer's proposal, the platform binds both parties into an active, escrow-backed contract. The contract locks the agreed bid amount in simulated escrow until project deliverables are formally submitted, reviewed, and approved.

The feature enforces a strict state machine lifecycle:
$$\text{active} \longrightarrow \text{submitted} \longrightarrow \text{completed}$$
*(with an additional $\text{disputed}$ terminal branch reserved for Part 4)*

This lifecycle is strictly constrained by live PostgreSQL database rules:
* `public.jobs.status`: Gated by `jobs_status_check` $\rightarrow$ `CHECK (status IN ('open', 'assigned', 'completed'))`
* `public.contracts.status`: Gated by `contracts_status_check` $\rightarrow$ `CHECK (status IN ('active', 'submitted', 'completed', 'disputed'))`

---

## 2. Implementation Summary

### 2.1 Atomic PostgreSQL RPC Function: `accept_proposal_and_create_contract`
To eliminate race conditions and avoid partial database corruption, proposal acceptance and contract creation were migrated from sequential JavaScript API calls into a single atomic PostgreSQL stored function executed with `SECURITY DEFINER`:

```sql
CREATE OR REPLACE FUNCTION accept_proposal_and_create_contract(
  p_proposal_id UUID,
  p_client_id UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job RECORD;
  v_proposal RECORD;
  v_contract RECORD;
BEGIN
  -- 1. Fetch and row-lock the proposal (prevents concurrent accept attempts)
  SELECT * INTO v_proposal
  FROM public.proposals
  WHERE proposal_id = p_proposal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_proposal.status != 'pending' THEN
    RAISE EXCEPTION 'Proposal is already %', v_proposal.status;
  END IF;

  -- 2. Fetch and row-lock the job
  SELECT * INTO v_job
  FROM public.jobs
  WHERE job_id = v_proposal.job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;

  IF v_job.client_id != p_client_id THEN
    RAISE EXCEPTION 'Unauthorized: Only the job owner can accept proposals';
  END IF;

  IF v_job.status != 'open' THEN
    RAISE EXCEPTION 'Job is no longer open (current status: %)', v_job.status;
  END IF;

  -- 3. Update proposal status to accepted
  UPDATE public.proposals
  SET status = 'accepted'
  WHERE proposal_id = p_proposal_id;

  -- 4. Auto-reject all competing pending proposals for this job
  UPDATE public.proposals
  SET status = 'rejected'
  WHERE job_id = v_proposal.job_id
    AND proposal_id != p_proposal_id
    AND status = 'pending';

  -- 5. Update job status to assigned (adheres to jobs_status_check)
  UPDATE public.jobs
  SET status = 'assigned'
  WHERE job_id = v_proposal.job_id;

  -- 6. Atomically initialize the new active contract
  INSERT INTO public.contracts (
    job_id,
    client_id,
    freelancer_id,
    agreed_amount,
    status
  )
  VALUES (
    v_proposal.job_id,
    p_client_id,
    v_proposal.freelancer_id,
    v_proposal.bid_amount,
    'active'
  )
  RETURNING * INTO v_contract;

  RETURN row_to_json(v_contract);
END;
$$;
```

### 2.2 Backend Controller: `backend/src/controllers/contractsController.js`
The controller implements complete ownership validation and state-machine guards:

* **`getContracts(req, res)`**: Lists contracts for the authenticated user, filtered strictly at the query level:
  ```javascript
  const { data: contracts, error } = await supabaseAdmin
    .from('contracts')
    .select(`
      contract_id, job_id, client_id, freelancer_id, agreed_amount, status, created_at,
      jobs (job_id, title, description, budget, status, budget_type),
      client:users!contracts_client_id_fkey (user_id, first_name, last_name, email, active_role),
      freelancer:users!contracts_freelancer_id_fkey (user_id, first_name, last_name, email, active_role, bio, skills, portfolio_url)
    `)
    .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  ```
* **`getContractById(req, res)`**: Retrieves single contract details with strict participant verification:
  ```javascript
  if (contract.client_id !== userId && contract.freelancer_id !== userId) {
    return res.status(403).json({ success: false, error: 'You are not a participant in this contract' });
  }
  ```
* **`submitWork(req, res)`**: Allows only the awarded freelancer to submit deliverables, guarded by status:
  ```javascript
  if (contract.freelancer_id !== userId) {
    return res.status(403).json({ success: false, error: 'Only the assigned freelancer can submit work' });
  }
  if (contract.status !== 'active') {
    return res.status(409).json({ success: false, error: `Cannot submit work on a contract in '${contract.status}' status` });
  }
  ```
* **`completeContract(req, res)`**: Allows only the job client to release escrow funds, strictly requiring prior deliverable submission:
  ```javascript
  if (contract.client_id !== userId) {
    return res.status(403).json({ success: false, error: 'Only the client can approve deliverables and release funds' });
  }
  if (contract.status !== 'submitted') {
    return res.status(409).json({
      success: false,
      error: `Cannot complete a contract in '${contract.status}' status. The freelancer must submit work for review first.`,
    });
  }
  ```

### 2.3 Wiring & Routing
* **`backend/src/routes/contracts.js`**: Mounted with `requireAuth` middleware protecting all endpoints (`GET /`, `GET /:id`, `PATCH /:id/submit`, `PATCH /:id/complete`).
* **`backend/src/app.js`**: Registered `app.use('/api/v1/contracts', contractRoutes)`.
* **`backend/src/controllers/proposalsController.js`**: Refactored `acceptProposal` to invoke the `accept_proposal_and_create_contract` RPC, with explicit substring error handling mapping PostgreSQL exceptions to HTTP `404`, `403`, and `409`.

### 2.4 Frontend Integration
* **`frontend/src/services/api.js`**: Added client methods `getContracts()`, `getContractById(id)`, `submitContractWork(id)`, and `completeContract(id)`.
* **`frontend/src/pages/Dashboard.jsx`**:
  * Added metric cards displaying Active Contracts count, Total Escrow Funded/Committed ($\text{PHP}$), and Completed Projects count.
  * Added an interactive "Contracts & Escrow" table rendering Job Title, Counterparty name/role, Escrow Amount badge, and dynamic status pills.
  * Role-specific controls: Freelancers get a *"Submit Work"* button on `active` contracts; Clients get an *"Approve & Release Funds"* modal action strictly on `submitted` contracts. While `active`, clients see a *"Work in Progress"* indicator.

### 2.5 Real Git Commit History (`git log --oneline -15`)
The implementation is grounded directly in the repository's immutable git history:

```
fd32bb4 fix: enforce strict submitted-to-completed contract transition
c116769 feat: complete Part 3 Contract Execution & Escrow with atomic RPC and Dashboard UI
5545202 merge: resolve conflicts between origin/main (PR #4) and local fixes
c4041e5 Merge pull request #4 from encisojkhim-jpg/Part2-Phase3
cf05c19 fix: role allowlist, nav gaps, job-creation role gate, and proposal submission flow
76ad3ad Done with Part 2
f822e54 johnwel
822a741 Merge pull request #3 from encisojkhim-jpg/frontend-phase-1-complete
0a44631 docs: remove redundant FRONTEND_PLAN.md in favor of README.md
391ecc3 docs: use phase 1 plan as branch readme
b1560dd feat: complete phase 1 frontend integration, navbar, and bug fixes
3d7ad6d some changes
ad3cc6b Require auth, update routing, rename files
b569f49 added explore and freelancer profile
7fae9c3 temp code for dashboard
```

---

## 3. Problems We Hit and How We Actually Fixed Them

### 3.1 CRLF vs LF Merge Conflict Inflation
* **The Problem:** An initial merge dry-run between `origin/Part2-Phase3` (PR #4) and our local fixes flagged **10 conflicted files**, suggesting major divergence.
* **The Root Cause:** Working copies on Windows had CRLF line endings, whereas the remote branch used LF. Because line endings differed on almost every line, Git evaluated the entire files as conflicted.
* **The Fix:** Verified that local Git was configured with `core.autocrlf = true`. Once normalized by the index, Git cleanly auto-merged 8 files (`ClientJobView.jsx`, `api.js`, `jobsController.js`, `proposalsController.js`, `routes/jobs.js`, `routes/proposals.js`, `App.jsx`, `FreelancerProfile.jsx`). Only 2 real conflicts existed:
  1. `authController.js`: Both sides addressed the `role` vs `active_role` issue. Resolved by retaining our server-side role allowlist (`['customer', 'freelancer']`) alongside Rafael's DB check comments.
  2. `Navbar.jsx`: Our local version added "Explore Jobs" and "+ Post a Job"; Rafael's version added "My Postings". Resolved by including all three, conditionally rendering "My Postings" and "+ Post a Job" for customer accounts.

### 3.2 Non-Atomic Proposal Acceptance & Race Conditions
* **The Problem:** The initial version of `acceptProposal` executed 3 sequential Supabase `.update()` calls (and the initial Part 3 plan proposed adding a 4th `.insert()` call). If the server crashed or the network failed midway through step 3 or 4, the database would be left corrupt (e.g., an accepted proposal with an open job and no contract or escrow record). Furthermore, two simultaneous clicks on different proposals could both read `job.status === 'open'` and double-assign the job.
* **The Fix:** Replaced all JavaScript-level writes with a single PostgreSQL stored function (`accept_proposal_and_create_contract`). The function acquires exclusive row locks (`FOR UPDATE`) on the proposal and job rows within a single transaction, guaranteeing ACID rollback if any validation or write fails.

### 3.3 Discovery of Live Database CHECK Constraints & Lifecycle Redesign
* **The Problem:** `database/schema.sql` was 0 bytes in the repository, meaning table constraints existed only inside Supabase. Initial plan drafts assumed `jobs.status` and `contracts.status` would accept `'cancelled'`.
* **The Discovery:** Querying `pg_constraint` directly in Supabase revealed:
  ```sql
  -- jobs_status_check:
  CHECK ((status = ANY (ARRAY['open'::text, 'assigned'::text, 'completed'::text])))

  -- contracts_status_check:
  CHECK ((status = ANY (ARRAY['active'::text, 'submitted'::text, 'completed'::text, 'disputed'::text])))
  ```
* **The Fix:**
  1. Removed all references to `'cancelled'` in contract and job status mutations, preventing fatal PostgreSQL constraint violations.
  2. Discovered that the schema explicitly defined a `'submitted'` state. We redesigned the contract lifecycle from a naive 2-state flow (`active` $\rightarrow$ `completed`) to a realistic 3-state flow (`active` $\rightarrow$ `submitted` $\rightarrow$ `completed`), requiring the freelancer to mark work submitted before the client can release funds.

### 3.4 Service Role Key Leak & Debugging "Unregistered API Key"
* **The Problem:** A teammate shared a live `SUPABASE_SERVICE_ROLE_KEY` in plaintext in the group chat. Aside from the security implication (service role keys completely bypass Row Level Security), the key in `backend/.env` caused severe authentication crashes.
* **The Troubleshooting Trail:**
  1. **`NetworkError when attempting to fetch resource`:** Surfaced on the login screen. Diagnosed as the backend Express server not running locally on port 5000.
  2. **`500 Internal Server Error`:** Once started, user login failed with `"Your account is missing a profile record"`. Traced to `middleware/auth.js` and `authController.js` attempting to query `public.users` via `supabaseAdmin`.
  3. **`401 {"message":"Unregistered API key"}`:** Executed a clean Node test script (`fetch(SUPABASE_URL + '/rest/v1/users')` using the service role key). Supabase explicitly returned `401 Unregistered API key`, confirming the secret key was invalid or revoked.
  4. **The Resolution:** A new JWT service role secret was generated in the Supabase Dashboard (`Project Settings -> API -> service_role`). Re-testing verified `Status: 200 OK (count: 8)`, restoring backend admin functionality.

### 3.5 Known Minor Gap: `completeContract` Dual Write
* **Documented Open Item:** In `contractsController.js`, `completeContract` executes two sequential database calls:
  1. `contracts.update({ status: 'completed' })`
  2. `jobs.update({ status: 'completed' })`
* While much lower risk than proposal acceptance (no financial race condition or competitor conflict), if the second write fails, the contract will show completed while the job remains `'assigned'`. This can be resolved in a future refactor by wrapping both updates into a secondary PostgreSQL RPC (`complete_contract_and_job`).

---

## 4. AI Usage Log

This project was developed through pair-programming between human students and two distinct AI systems fulfilling complementary roles.

### 4.1 Division of Responsibilities

| AI Tool | Deployment Context | Primary Responsibilities |
|---|---|---|
| **Gemini** | Antigravity IDE (Integrated Agent) | Code authoring, creating implementation plans, generating SQL/RPC definitions, writing Express controllers and React components, executing terminal commands (`git`, `npm`, `node`), resolving git merge conflicts. |
| **Claude** | External Adversarial Auditor | Independent code/schema reviewer, verifying implementation plans against actual repository files, auditing diffs, finding latent edge cases, challenging architectural assumptions. |
| **Human Team** | Student Developers / Architects | Making final design decisions, approving branch strategies, testing workflows in the browser, verifying database constraints, executing SQL scripts in Supabase, and committing code. |

### 4.2 Key Interventions by Claude (Auditor)
* **Caught Non-Atomic Write Chain:** Identified that Rafael's `acceptProposal` and Gemini's initial Part 3 draft chained sequential `.update()` calls with zero transaction rollback, recommending the single PostgreSQL RPC approach.
* **Flagged Missing DB Constraints:** Warned the team to query `pg_constraint` directly before writing code, preventing silent check violations on `'cancelled'` and unearthing the `'submitted'` status.
* **Corrected Merge Conflict Panic:** Demonstrated that the apparent "10 conflicted files" from an external dry-run were caused by CRLF/LF line-ending mismatches rather than true file divergence.
* **Caught Skipped State Transition:** Identified that `completeContract` originally allowed transitioning directly from `'active'` to `'completed'`, which contradicted the documented state machine requiring `'submitted'` first.
* **Caught Pre-Update Data Return in Draft SQL:** Flagged that a draft version of the `complete_contract` SQL function fetched contract data *before* updating it and returned the stale pre-update record rather than using `RETURNING * INTO v_contract`.

### 4.3 Instances Where AI Assertions Were Challenged & Corrected
1. **Premature "Done" Claims:** Gemini summarized tasks as "100% complete and verified" before all endpoints had been audited. Claude demanded direct verification against actual file contents, leading to the manual inspection of lines 118–130 of `proposalsController.js` and lines 44, 104, and 184 of `contractsController.js`.
2. **Key Format Assumptions:** Early testing assumed the `sb_secret_...` key was valid because its prefix matched modern Supabase key formats; direct curl/fetch testing proved it was completely unregistered for the project (`401`).
3. **Line Ending Inflation:** An external diff tool initially reported massive divergence due to CRLF noise; terminal verification using `git diff -w` and `core.autocrlf` proved only 2 files actually had semantic conflicts.

### 4.4 Human Oversight & Final Decision-Making
All architectural forks were decided and verified by the student team:
* **Branching Strategy:** Decided on Option A (merging PR #4 into `main` first rather than building on a side branch).
* **Escrow Scope:** Selected Option A (full-amount escrow release on completion) to adhere strictly to the existing schema without creating unnecessary multi-milestone tables.
* **State Machine Governance:** Approved the rule that clients cannot approve contracts until the freelancer has formally submitted work.
* **Database Deployment:** All database triggers and stored functions (`handle_new_user`, `accept_proposal_and_create_contract`) were manually reviewed and executed in the Supabase SQL Editor by the student team.
