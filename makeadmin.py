import sys
import os
import bcrypt
from pymongo import MongoClient

# Force UTF-8 encoding for Windows terminal output
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def make_admin(phone, password, mongo_uri):
    try:
        print("Connecting to MongoDB database...")
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Hash password with bcrypt (10 rounds, matching Node.js bcryptjs)
        salt = bcrypt.gensalt(rounds=10)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        # Target both 'colorprediction' and default 'test' database
        for dbname in ["colorprediction", "test"]:
            db = client[dbname]
            users = db["users"]
            existing = users.find_one({"phone": phone})

            if existing:
                users.update_one(
                    {"phone": phone},
                    {"$set": {"password": hashed_password, "isAdmin": True}}
                )
                print(f"[SUCCESS] [{dbname}] Existing user '{phone}' promoted to ADMIN!")
            else:
                users.insert_one({
                    "phone": phone,
                    "password": hashed_password,
                    "balance": 10000.0,
                    "isAdmin": True
                })
                print(f"[SUCCESS] [{dbname}] Created new ADMIN account for '{phone}'!")

        print(f"\n🎉 DONE! User '{phone}' is now an Admin!")

    except Exception as e:
        print(f"[ERROR] Failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) >= 4:
        phone = sys.argv[1]
        password = sys.argv[2]
        mongo_uri = sys.argv[3]
    else:
        print("=== Make Admin Utility ===")
        phone = input("Enter Phone Number (ID): ").strip()
        password = input("Enter Password: ").strip()
        mongo_uri = input("Enter MongoDB Link: ").strip()

    make_admin(phone, password, mongo_uri)
