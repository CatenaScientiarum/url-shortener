# LinkForge

To make setup and development easier, the project includes several npm scripts.  
These scripts help future developers and users install, launch, and fix the application quickly. 

## Start guide

Starts both backend and frontend concurrently:
- Backend runs with `npm run dev` in `/backend`
- Frontend runs with `npm run dev` in `/frontend` on port `5555`

---

## Recommended Order for Setup

1. Run `npm run install-all`  
2. If an error occurs, run:  
   - `npm run clean-all`  
   - `npm run fix`  
   - then retry `npm run install-all`  
3. Finally, start the project with:  
   - `npm run launch`
   


