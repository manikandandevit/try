"""
Production-grade JWT utilities for banking-level security.
"""
import jwt
import secrets
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
import hashlib
import hmac


# JWT Configuration - Production Banking Level
JWT_ALGORITHM = 'RS256'  # RSA with SHA-256 for maximum security
ACCESS_TOKEN_EXPIRY_MINUTES = 15  # Short-lived access tokens (15 minutes)
REFRESH_TOKEN_EXPIRY_MINUTES = 1440  # 24 hours (1440 minutes)
REFRESH_TOKEN_EXPIRY_DAYS = 7  # 7 days for refresh tokens

# Token rotation settings
ENABLE_TOKEN_ROTATION = True  # Rotate refresh tokens on each use


def get_or_create_rsa_keys():
    """
    Get or create RSA key pair for JWT signing.
    In production, these should be stored securely (env vars, secrets manager).
    """
    private_key_pem = getattr(settings, 'JWT_PRIVATE_KEY', None)
    public_key_pem = getattr(settings, 'JWT_PUBLIC_KEY', None)
    
    if not private_key_pem or not public_key_pem:
        # Generate new RSA key pair (2048 bits for banking-level security)
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        public_key = private_key.public_key()
        
        # Serialize keys
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')
        
        public_key_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')
        
        # Store in settings (in production, use environment variables)
        settings.JWT_PRIVATE_KEY = private_key_pem
        settings.JWT_PUBLIC_KEY = public_key_pem
    
    # Load keys
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode('utf-8'),
        password=None,
        backend=default_backend()
    )
    
    public_key = serialization.load_pem_public_key(
        public_key_pem.encode('utf-8'),
        backend=default_backend()
    )
    
    return private_key, public_key


def generate_jti():
    """Generate a unique JWT ID (jti) for token tracking."""
    return secrets.token_urlsafe(32)


def generate_refresh_token_string():
    """Generate a cryptographically secure refresh token string."""
    return secrets.token_urlsafe(64)  # 64 bytes = 86 characters URL-safe


def create_access_token(user_email, user_type, user_id=None, is_admin=False, permissions=None):
    """
    Create a JWT access token with banking-level security.
    
    Args:
        user_email: User's email address
        user_type: 'user' or 'company'
        user_id: User ID if user_type is 'user'
        is_admin: Whether user is admin
        permissions: List of user permissions
    
    Returns:
        str: JWT access token
    """
    private_key, _ = get_or_create_rsa_keys()
    
    now = timezone.now()
    expiry = now + timedelta(minutes=ACCESS_TOKEN_EXPIRY_MINUTES)
    
    # JWT payload with standard claims + custom claims
    payload = {
        'iat': int(now.timestamp()),  # Issued at
        'exp': int(expiry.timestamp()),  # Expiration
        'jti': generate_jti(),  # JWT ID for tracking
        'sub': user_email,  # Subject (user identifier)
        'type': 'access',  # Token type
        'user_email': user_email,
        'user_type': user_type,
        'is_admin': is_admin,
        'permissions': permissions or [],
    }
    
    if user_id:
        payload['user_id'] = user_id
    
    # Add additional security claims
    payload['iss'] = getattr(settings, 'JWT_ISSUER', 'kattappa-api')  # Issuer
    payload['aud'] = getattr(settings, 'JWT_AUDIENCE', 'kattappa-client')  # Audience
    
    # Sign token with RSA private key
    token = jwt.encode(payload, private_key, algorithm=JWT_ALGORITHM)
    
    return token


def verify_access_token(token):
    """
    Verify and decode a JWT access token.
    
    Args:
        token: JWT access token string
    
    Returns:
        dict: Decoded token payload if valid, None if invalid
    """
    try:
        _, public_key = get_or_create_rsa_keys()
        
        # Verify and decode token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[JWT_ALGORITHM],
            audience=getattr(settings, 'JWT_AUDIENCE', 'kattappa-client'),
            issuer=getattr(settings, 'JWT_ISSUER', 'kattappa-api'),
        )
        
        # Verify token type
        if payload.get('type') != 'access':
            return None
        
        return payload
    
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None


def create_refresh_token(user_email, user_type, user_id=None, ip_address=None, user_agent=None):
    """
    Create a refresh token and store it in database.
    
    Args:
        user_email: User's email address
        user_type: 'user' or 'company'
        user_id: User ID if user_type is 'user'
        ip_address: IP address of request
        user_agent: User agent of request
    
    Returns:
        str: Refresh token string
    """
    from .models import RefreshToken
    
    # Generate cryptographically secure token
    token_string = generate_refresh_token_string()
    
    # Calculate expiry
    now = timezone.now()
    expires_at = now + timedelta(days=REFRESH_TOKEN_EXPIRY_DAYS)
    
    # Create database record
    refresh_token = RefreshToken.objects.create(
        token=token_string,
        user_email=user_email,
        user_type=user_type,
        user_id=user_id,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent,
        is_active=True
    )
    
    return token_string


def verify_refresh_token(token_string):
    """
    Verify a refresh token from database.
    
    Args:
        token_string: Refresh token string
    
    Returns:
        RefreshToken: RefreshToken model instance if valid, None if invalid
    """
    from .models import RefreshToken
    
    try:
        refresh_token = RefreshToken.objects.get(
            token=token_string,
            is_active=True
        )
        
        # Check if expired
        if refresh_token.is_expired():
            refresh_token.revoke()
            return None
        
        return refresh_token
    
    except RefreshToken.DoesNotExist:
        return None
    except Exception:
        return None


def rotate_refresh_token(old_token_string, ip_address=None, user_agent=None):
    """
    Rotate refresh token (revoke old, create new) for enhanced security.
    
    Args:
        old_token_string: Current refresh token
        ip_address: IP address of request
        user_agent: User agent of request
    
    Returns:
        str: New refresh token string, None if old token invalid
    """
    refresh_token = verify_refresh_token(old_token_string)
    
    if not refresh_token:
        return None
    
    # Revoke old token
    refresh_token.revoke()
    
    # Create new token
    new_token = create_refresh_token(
        user_email=refresh_token.user_email,
        user_type=refresh_token.user_type,
        user_id=refresh_token.user_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return new_token


def revoke_refresh_token(token_string):
    """
    Revoke a refresh token.
    
    Args:
        token_string: Refresh token string
    
    Returns:
        bool: True if revoked, False if not found
    """
    from .models import RefreshToken
    
    try:
        refresh_token = RefreshToken.objects.get(token=token_string)
        refresh_token.revoke()
        return True
    except RefreshToken.DoesNotExist:
        return False


def revoke_all_user_tokens(user_email):
    """
    Revoke all refresh tokens for a user (useful for logout all devices).
    
    Args:
        user_email: User's email address
    
    Returns:
        int: Number of tokens revoked
    """
    from .models import RefreshToken
    
    count = RefreshToken.objects.filter(
        user_email=user_email,
        is_active=True
    ).update(is_active=False)
    
    return count


def get_client_ip(request):
    """Extract client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip


def get_user_agent(request):
    """Extract user agent from request."""
    return request.META.get('HTTP_USER_AGENT', '')[:500]  # Limit length


