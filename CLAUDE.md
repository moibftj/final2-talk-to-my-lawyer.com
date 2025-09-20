- #Core functionalities boiled down into action points:



1. User System



Create 3 roles: User, Employee, Admin.



Role-based dashboards and permissions.







2. User Features



Dashboard with:



Letter generation modal (form → timeline → preview/download/send).



Profile settings.



My Letters (list + status tracking).









3. Letter Generation Flow



User fills form → request saved in DB.



Status updates:



1. Request received





2. Under attorney review





3. Approved





4. Preview + Download / Email options











4. Employee Features



Auto-generate unique coupon code on signup.



Users get 20% discount with coupon.



For each subscription with coupon:



Employee earns 1 point.



Employee earns 5% of subscription revenue.









5. Admin Features



View all users and their letters.



Track employees, their coupon codes, usage, and revenue.



Remove/deactivate employees.



Analytics dashboard for revenue + coupon performance.







6. Backend / Supabase Functions



generate-draft → AI letter generation + update status.



apply-coupon → validate + apply discount + update employee earnings.



get-all-users → admin fetch users.



get-all-letters → admin fe