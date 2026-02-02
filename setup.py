"""
Setup script for KATTAPPA AI Quotation Maker
"""
import os
import subprocess
import sys

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error: {description} failed")
        print(f"  {e.stderr}")
        return False

def main():
    """Main setup function."""
    print("=" * 60)
    print("KATTAPPA AI Quotation Maker - Setup")
    print("=" * 60)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("✗ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("\nPlease install dependencies manually: pip install -r requirements.txt")
        sys.exit(1)
    
    # Check for .env file
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_file):
        print("\n⚠ .env file not found. Creating .env.example...")
        print("Please copy .env.example to .env and add your OpenRouter API key")
    else:
        print("✓ .env file found")
    
    # Run migrations
    if not run_command("python manage.py migrate", "Running database migrations"):
        print("\nPlease run migrations manually: python manage.py migrate")
        sys.exit(1)
    
    # Check for API key
    api_key = os.environ.get('OPENROUTER_API_KEY', '')
    if not api_key:
        print("\n⚠ OPENROUTER_API_KEY not set in environment")
        print("Please set it in your .env file or as an environment variable")
    else:
        print("✓ OPENROUTER_API_KEY found")
    
    print("\n" + "=" * 60)
    print("Setup completed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Set your OPENROUTER_API_KEY in .env file or environment")
    print("2. Run: python manage.py runserver")
    print("3. Open: http://127.0.0.1:8000/")
    print("\nOptional: Create superuser for admin panel:")
    print("  python manage.py createsuperuser")

if __name__ == '__main__':
    main()


