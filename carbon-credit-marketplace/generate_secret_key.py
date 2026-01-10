#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for JWT token signing
"""

import secrets
import sys

def generate_secret_key(length=32):
    """Generate a secure random secret key"""
    return secrets.token_urlsafe(length)

if __name__ == "__main__":
    key = generate_secret_key(32)
    print("=" * 60)
    print("Generated SECRET_KEY for .env file:")
    print("=" * 60)
    print(f"SECRET_KEY={key}")
    print("=" * 60)
    print("\nCopy the above line to your .env file")
    print("\nNote: Keep this key secret and never commit it to git!")
