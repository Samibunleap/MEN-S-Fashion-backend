# MEN'S Fashion

## Run with one terminal

Open the main `MENS-Fashion` folder in VS Code and run:

```powershell
npm install
npm run install:all
npm start
```

Open:
- Customer website: http://localhost:5173
- Admin dashboard: http://localhost:5174
- Backend API: http://localhost:8080

Keep the terminal running.

## Login roles

### Admin
- Email: admin@gmail.com
- Password: admin123
- Result: Admin Dashboard

### Customer
- Register from the customer website.
- Every public registration automatically becomes `customer`.
- Customer login stays on the website.

## Fixed features

- Mobile Login/Register now opens the real login modal.
- Desktop and mobile use the same authentication API.
- Admin Add Product saves through the backend.
- Product images are stored as Base64 for the current JSON demo backend.
- New products automatically appear on the website after reload.
- Customer orders are sent to the shared backend.
- Admin order workflow:
  Pending Payment Review -> Accept Payment -> Prepare -> Ready to Ship -> Shipping -> Delivered
- One terminal can start backend + website + admin.

## Current storage

This version uses JSON files for demo/testing:
- server/data/users.json
- server/data/products.json
- server/data/orders.json

The frontend API is already separated from storage, so a future MySQL backend can keep the same API URLs.

## Latest fixes
- Website login and register now use one shared responsive interface.
- Removed the text 'Customer and Admin use the same login'.
- Desktop and mobile Login/Register open the same real modal.
- Admin accounts redirect to the admin dashboard after login.
- Admin Profile Settings now supports image upload, preview, remove photo, and real backend saving.

## Admin ↔ Website switching
- Admin logs in from the website.
- Admin is automatically sent to the admin dashboard.
- Back to Website keeps the admin session.
- Website shows Admin Dashboard only for admin users.
- Admin Dashboard returns without another login.
- Logout ends the session.


## Final account flow
- Login/Register opens one responsive interface.
- Admin login redirects to Admin Dashboard.
- Back to Website keeps the admin session.
- Website header: **Admin** opens account dropdown only.
- **My Account** opens `/account` on the website.
- **Admin Dashboard** opens port 5174 dashboard.
- **Logout** clears the session and returns to website home.
- Mobile sidebar has separate My Account, Admin Dashboard, and Logout actions.

## Product display fixes
- Products added from Admin Dashboard now appear on the website.
- Clothing/Shop page no longer shows 0 products because of category-field mismatch.
- Uploaded product images are constrained to consistent sizes on PC and mobile.


## Final product fixes
- Original website catalog is never replaced by admin-created products.
- Backend product IDs are isolated on the website to prevent numeric ID collisions.
- Admin products appear in Clothing/Shop and can be added to cart.
- Only admin products explicitly marked Featured appear in Trending Now.
- Missing product images use a safe fallback image.
- Added missing Technical Field Parka local image fallback.
- Product cards use consistent responsive image sizing on PC and mobile.
