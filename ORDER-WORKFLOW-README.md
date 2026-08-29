# MEN'S Fashion – Connected Store with Order Workflow

## Run
1. `cd server && npm install && npm start`
2. Start the website frontend.
3. Start the admin frontend.

## Order workflow
Customer places order → Pending Payment Review
Admin clicks Accept Payment → Payment Confirmed
Admin clicks Prepare → Preparing
Admin clicks Ready to Ship → Ready to Ship
Admin clicks Shipping → Shipping
Admin clicks Delivered → Delivered

Admin test account:
- Email: admin@gmail.com
- Password: admin123

Customers register normally and automatically receive role `customer`.

Important: the demo stores passwords in JSON for simplicity. For production, use bcrypt + JWT + a real database.
