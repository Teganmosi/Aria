import asyncio
import sqlite3
from datetime import datetime, timedelta
from database import db

def verify_streaks():
    # 1. Get the first user
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name FROM profiles LIMIT 1")
        user = cursor.fetchone()
        
    if not user:
        print("No users found in database.")
        return
        
    user_id = user["id"]
    print(f"Verifying streaks for user: {user['full_name']} ({user_id})")
    
    # 2. Clear existing devotions for this week to have a clean slate
    today = datetime.now()
    days_since_sunday = (today.weekday() + 1) % 7
    sunday = today - timedelta(days=days_since_sunday)
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM devotions WHERE user_id = ? AND created_at >= ?", (user_id, sunday.strftime("%Y-%m-%d")))
        conn.commit()
    
    print("Cleared devotions for the current week.")
    
    # 3. Add devotions for the last 3 days (inclusive of today)
    # If today is Monday(1), we add for Sun(0) and Mon(1)
    # If today is Saturday(6), we add for Thu(4), Fri(5), Sat(6)
    
    today_idx = (today.weekday() + 1) % 7
    days_to_add = min(3, today_idx + 1)
    
    print(f"Adding devotions for {days_to_add} days...")
    
    with db.get_connection() as conn:
        cursor = conn.cursor()
        for i in range(days_to_add):
            target_day = today - timedelta(days=i)
            # Insert a dummy devotion
            cursor.execute(
                "INSERT INTO devotions (user_id, scheduled_for, created_at, status) VALUES (?, ?, ?, ?)",
                (user_id, target_day.strftime("%Y-%m-%d"), target_day.isoformat(), "completed")
            )
        conn.commit()
    
    # 4. Check stats
    stats = db.get_user_stats(user_id)
    print("\nCalculated Stats:")
    print(f"Streak Days: {stats['streak_days']}")
    print(f"Streak History: {stats['streak_history']}")
    
    expected_streak = days_to_add
    if stats['streak_days'] == expected_streak:
        print("\n[SUCCESS] VERIFICATION SUCCESS: Streak correctly calculated.")
    else:
        print(f"\n[FAIL] VERIFICATION FAILED: Expected {expected_streak}, got {stats['streak_days']}")

if __name__ == "__main__":
    verify_streaks()
