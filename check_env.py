"""
Quick script to check if environment variables are loading correctly.
Run this to verify your .env file is being read properly.
"""
import os
from pathlib import Path

# Try loading with python-dotenv
try:
    from dotenv import load_dotenv
    BASE_DIR = Path(__file__).resolve().parent
    env_file = BASE_DIR / '.env'
    
    print("=" * 60)
    print("Environment Variable Check")
    print("=" * 60)
    print(f".env file exists: {env_file.exists()}")
    print(f".env file path: {env_file}")
    
    if env_file.exists():
        load_dotenv(env_file)
        print("\n✓ .env file loaded successfully")
    else:
        print("\n✗ .env file not found!")
        print("Please create a .env file in the project root with:")
        print("  OPENROUTER_API_KEY=your-key-here")
        print("  OPENROUTER_MODEL=anthropic/claude-3.5-sonnet")
    
    # Check variables
    api_key = os.getenv('OPENROUTER_API_KEY', '')
    model = os.getenv('OPENROUTER_MODEL', 'anthropic/claude-3.5-sonnet')
    
    print("\n" + "=" * 60)
    print("Environment Variables:")
    print("=" * 60)
    print(f"OPENROUTER_API_KEY: {'✓ Set' if api_key else '✗ Not Set'}")
    if api_key:
        print(f"  Length: {len(api_key)} characters")
        print(f"  First 10 chars: {api_key[:10]}...")
        print(f"  Last 10 chars: ...{api_key[-10:]}")
    print(f"OPENROUTER_MODEL: {model}")
    
    print("\n" + "=" * 60)
    if api_key:
        print("✓ Environment variables are loaded correctly!")
        print("If you're still getting 404 errors, check:")
        print("  1. API key is valid and has credits")
        print("  2. API endpoint URL is correct")
        print("  3. Model name is valid")
    else:
        print("✗ OPENROUTER_API_KEY is not set!")
        print("Please check your .env file.")
    print("=" * 60)
    
except ImportError:
    print("✗ python-dotenv is not installed!")
    print("Install it with: pip install python-dotenv")
    print("\nOr set environment variables directly:")
    print("  Windows: $env:OPENROUTER_API_KEY='your-key'")
    print("  Linux/Mac: export OPENROUTER_API_KEY='your-key'")


