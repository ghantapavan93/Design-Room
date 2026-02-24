# Design Room

> This turns design sessions into structured decisions that reduce rework, speed approvals, and create a data trail for what wins jobs. 
> 
> *Future work: Accepted versions can later map to takeoffs, estimates, and proposals to support the measure-to-design-to-estimate loop.*

Design Room is a collaborative, real-time exterior design application. A share link opens a live session where a contractor and homeowner can work together. Every change is recorded in a Design Ledger with versions, compare, and restore functionality.

## Tech Stack
* **Frontend**: Next.js, React, TailwindCSS, TypeScript (deployed on Vercel)
* **Backend**: Ruby on Rails API (deployed on Render)
* **API**: GraphQL via `graphql-ruby`
* **Realtime**: ActionCable using a Redis adapter
* **Database**: PostgreSQL

## Local Setup Instructions (Mac & Windows)

### 1. Prerequisites
- **Ruby** (v3.0+) and **Rails** (v7.1+)
- **Node.js** (v18+)
- **PostgreSQL** installed and running
- **Redis** installed and running (`redis-server` on default port `6379`)

### 2. Backend (Rails API) Setup
1. Open a terminal and navigate to the `api/` folder:
   ```bash
   cd api
   ```
2. Install Ruby dependencies:
   ```bash
   bundle install
   ```
3. Setup the database (creates DB, runs migrations, and inserts seed data):
   ```bash
   rails db:create db:migrate db:seed
   ```
   *Note: Ensure your PostgreSQL service is running before executing this step.*
4. Start the Rails server:
   ```bash
   rails server -p 3000
   ```
   *The API will be available at `http://localhost:3000/graphql` and websockets at `ws://localhost:3000/cable`.*

### 3. Frontend (Next.js) Setup
1. Open a new terminal window and navigate to the `web/` folder:
   ```bash
   cd web
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Generate Demo Assets (creates the required mask images for the canvas):
   ```bash
   npm run generate-assets # or `node scripts/generate_assets.js`
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev -p 3001
   ```
   *(We run on 3001 to avoid conflicting with Rails).*

### 4. Running the Demo Script
Once both servers are running:
1. Since we seeded the database, visit `http://localhost:3001/design/1` (this acts as the Contractor's initial view).
2. Apply the "Walls" material by selecting a category and then a swtach.
3. Click "Share Live Room" and select "Can Suggest (Homeowner)". Generate and copy the link.
4. Open the link in a second, incognito browser window (simulating the Homeowner).
5. As the Homeowner, click on the "Roof" category and select an option to suggest it.
6. The Contractor window will see the suggestion and can click "Approve". 
7. Open the History drawer (Design Ledger) on the right to see the event timeline.
8. Click "Versions" and save "Option A".
9. Change the trim material, then save "Option B".
10. Compare the versions and click "Restore" on Option A.
11. Finally, generate a "View Only" share link and verify the read-only mode preview renders properly.

## Deployment Instructions

### Deploying the Backend on Render
1. Create a new "Web Service" in your Render dashboard connected to this repository, targeting the `api/` folder.
2. Select the Ruby environment.
3. Build Command: `bundle install; bundle exec rails db:migrate`
4. Start Command: `bundle exec puma -C config/puma.rb`
5. **Add Add-ons**: 
    - Create a Postgres database on Render and attach the `DATABASE_URL` env variable.
    - Create a Redis instance on Render and attach the `REDIS_URL` env variable.
6. **Config Variables**:
    - `RAILS_MASTER_KEY`: Your Rails master key.
    - `ALLOWED_ORIGINS`: E.g., `https://your-vercel-domain.vercel.app`
    - `RAILS_LOG_TO_STDOUT`: `true`

### Deploying the Frontend on Vercel
1. Create a new Project in Vercel connected to this repository.
2. Set the "Root Directory" to `web/`.
3. The Build Command should be detected automatically as `npm run build`.
4. **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://design-room-api.onrender.com`)
    - `NEXT_PUBLIC_CABLE_URL`: Your Render websocket URL (e.g., `wss://design-room-api.onrender.com/cable`)
5. Deploy.

---

*Built by Anti Gravity*
