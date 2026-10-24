#!/usr/bin/env python3
"""
DukaanOS User Management & Security Provisioning Tool
Use this CLI tool to safely create owner/cashier accounts, set owner password, or reset passwords.
Usage:
    python backend/manage_users.py list
    python backend/manage_users.py set-owner-password
    python backend/manage_users.py create-owner --name "AbdulHadi" --email abdulhadipanhwar71@gmail.com --username 127294
    python backend/manage_users.py reset-password --email abdulhadipanhwar71@gmail.com
"""

import sys
import os
import argparse
import getpass
from typing import Optional

# Add root project directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database import SessionLocal
from backend.app import models, auth

def list_users():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"\n{'ID':<38} | {'ROLE':<8} | {'USERNAME':<12} | {'ACTIVE':<6} | {'NAME':<20} | {'EMAIL'}")
        print("-" * 115)
        for u in users:
            uname = u.username or "-"
            print(f"{u.id:<38} | {u.role:<8} | {uname:<12} | {str(u.is_active):<6} | {u.name:<20} | {u.email}")
        print(f"\nTotal users: {len(users)}\n")
    finally:
        db.close()

def create_user(name: str, email: str, password: str, role: str, username: Optional[str] = None):
    email = email.lower().strip()
    if username:
        username = username.strip()
    if len(password) < 8:
        print("[ERROR] Password must be at least 8 characters long for security.")
        sys.exit(1)

    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(
            (models.User.email == email) | 
            (models.User.username == username if username else False)
        ).first()
        if existing:
            print(f"[ERROR] A user with this email or username already exists (Role: {existing.role}, Email: {existing.email}).")
            sys.exit(1)

        hashed = auth.get_password_hash(password)
        new_user = models.User(
            name=name.strip(),
            email=email,
            username=username,
            hashed_password=hashed,
            role=role,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        print(f"[SUCCESS] User '{name}' ({email}, username: {username or 'none'}) created successfully with role '{role}'.")
    finally:
        db.close()

def set_owner_password():
    """
    Securely prompts for owner password without exposing it in shell args or history.
    Prompts twice with hidden input, validates strength, and updates owner's password in database.
    """
    db = SessionLocal()
    try:
        owner = db.query(models.User).filter(
            (models.User.username == "127294") |
            (models.User.email == "abdulhadipanhwar71@gmail.com") |
            (models.User.role == "owner")
        ).first()
        if not owner:
            print("[ERROR] No owner account found in database. Create one first using create-owner.")
            sys.exit(1)

        print(f"\nTarget Account: Store Owner - {owner.name}")
        print(f"Username: {owner.username or 'none'} | Email: {owner.email}")
        print("-" * 55)
        pw1 = getpass.getpass("Enter new owner password (hidden input, min 8 characters): ")
        if not pw1 or len(pw1) < 8:
            print("[ERROR] Password must be at least 8 characters long.")
            sys.exit(1)

        pw2 = getpass.getpass("Confirm new owner password: ")
        if pw1 != pw2:
            print("[ERROR] Passwords do not match.")
            sys.exit(1)

        owner.hashed_password = auth.get_password_hash(pw1)
        db.commit()
        print(f"[SUCCESS] Owner password for {owner.name} ({owner.email}) updated successfully.")
        print("[SECURITY NOTE] Password has been securely hashed with bcrypt. Never share this password.")
    finally:
        db.close()

def reset_password(email: str, new_password: str):
    email = email.lower().strip()
    if len(new_password) < 8:
        print("[ERROR] Password must be at least 8 characters long for security.")
        sys.exit(1)

    db = SessionLocal()
    try:
        user = db.query(models.User).filter(
            (models.User.email == email) | (models.User.username == email)
        ).first()
        if not user:
            print(f"[ERROR] No user found with email or username '{email}'.")
            sys.exit(1)

        user.hashed_password = auth.get_password_hash(new_password)
        db.commit()
        print(f"[SUCCESS] Password for user '{user.email}' (Username: {user.username or '-'}) has been updated successfully.")
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="DukaanOS User Management CLI")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands")

    # List
    subparsers.add_parser("list", help="List all users")

    # Set Owner Password (interactive secure prompt)
    subparsers.add_parser("set-owner-password", help="Interactively set/update the owner password with confirmation")

    # Create Owner
    owner_parser = subparsers.add_parser("create-owner", help="Create an owner account")
    owner_parser.add_argument("--name", default="AbdulHadi", help="Full name of the store owner")
    owner_parser.add_argument("--email", default="abdulhadipanhwar71@gmail.com", help="Owner email address")
    owner_parser.add_argument("--username", default="127294", help="Preferred admin username")
    owner_parser.add_argument("--password", help="Secure password (prompted if omitted)")

    # Create Cashier
    cashier_parser = subparsers.add_parser("create-cashier", help="Create a cashier account")
    cashier_parser.add_argument("--name", required=True, help="Full name of the cashier")
    cashier_parser.add_argument("--email", required=True, help="Cashier email address")
    cashier_parser.add_argument("--username", help="Cashier username")
    cashier_parser.add_argument("--password", help="Secure password (prompted if omitted)")

    # Reset Password
    reset_parser = subparsers.add_parser("reset-password", help="Reset password for an existing user")
    reset_parser.add_argument("--email", required=True, help="Email address or username of user")
    reset_parser.add_argument("--new-password", help="New password (prompted if omitted)")

    args = parser.parse_args()

    if args.command == "list":
        list_users()
    elif args.command == "set-owner-password":
        set_owner_password()
    elif args.command == "create-owner":
        pw = args.password or getpass.getpass("Enter secure password for owner (min 8 chars): ")
        create_user(args.name, args.email, pw, "owner", username=args.username)
    elif args.command == "create-cashier":
        pw = args.password or getpass.getpass("Enter secure password (min 8 chars): ")
        create_user(args.name, args.email, pw, "cashier", username=args.username)
    elif args.command == "reset-password":
        pw = args.new_password or getpass.getpass("Enter new secure password (min 8 chars): ")
        reset_password(args.email, pw)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
