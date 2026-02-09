# Kattappa Backend API

A Django REST API backend for the Kattappa quotation management system. This backend provides authentication, customer management, user management, quotation generation with AI, and email sending capabilities.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Customer Management**: Full CRUD operations for customers/clients
- **User Management**: User creation, update, deletion, and password reset
- **AI-Powered Quotation Generation**: Integration with OpenRouter API for intelligent quotation creation
- **Email Sending**: Send quotation PDFs via email using SMTP
- **Dashboard Statistics**: Comprehensive analytics and reporting
- **Company Settings**: Manage company details, logos, and credentials
- **Session Management**: Quotation and conversation history stored in sessions
- **Permission System**: Role-based access control with admin and user permissions

## Technology Stack

- **Framework**: Django 5.0+
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT (JSON Web Tokens) with RSA encryption
- **AI Integration**: OpenRouter API
- **Image Processing**: Pillow
- **Email**: SMTP (Gmail, Outlook, Yahoo, etc.)

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Installation

### 1. Clone the Repository

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# OpenRouter API
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=google/gemini-flash-1.5:free

# JWT Settings
JWT_ISSUER=kattappa-api
JWT_AUDIENCE=kattappa-client
ENABLE_TOKEN_ROTATION=True

# Database (for production)
# DATABASE_URL=postgresql://user:password@localhost:5432/kattappa
```

### Settings Configuration

The main settings file is located at `kattappa/settings.py`. Key configurations:

- **Database**: SQLite by default (change for production)
- **Media Files**: Stored in `media/` directory
- **Static Files**: Collected in `staticfiles/` directory
- **CORS**: Configured for frontend at `http://localhost:3000`

## Running the Server

### Development Server

```bash
python manage.py runserver
```

The server will start at `http://localhost:8000`

### Access Admin Panel

Navigate to `http://localhost:8000/admin/` and login with your superuser credentials.

## API Documentation

### Base URL

```
http://localhost:8000
```

### Authentication Endpoints

#### Login
```http
POST /api/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/refresh-token/
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

#### Check Authentication
```http
GET /api/check-auth/
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/logout/
Content-Type: application/json

{
  "refresh_token": "your_refresh_token"
}
```

### Customer Management Endpoints

#### List Customers
```http
GET /api/clients/
Authorization: Bearer <access_token>
```

#### Search Customers
```http
GET /api/clients/?search=customer_name
Authorization: Bearer <access_token>
```

#### Create Customer
```http
POST /api/clients/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "customer_name": "Test Customer",
  "company_name": "Test Company",
  "phone_number": "+1234567890",
  "email": "test@example.com",
  "address": "Test Address"
}
```

#### Update Customer
```http
PUT /api/clients/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "customer_name": "Updated Customer",
  "company_name": "Updated Company",
  "phone_number": "+1234567890",
  "email": "updated@example.com",
  "address": "Updated Address"
}
```

#### Delete Customer
```http
DELETE /api/clients/{id}/
Authorization: Bearer <access_token>
```

### User Management Endpoints

#### List Users
```http
GET /api/users/
Authorization: Bearer <access_token>
```

#### Search Users
```http
GET /api/users/?search=user_name
Authorization: Bearer <access_token>
```

#### Create User
```http
POST /api/users/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "is_admin": false,
  "permissions": ["read", "write"]
}
```

#### Update User
```http
PUT /api/users/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "updated@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "is_active": true,
  "is_admin": false,
  "permissions": ["read"]
}
```

#### Reset User Password
```http
POST /api/users/{id}/reset-password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

#### Delete User
```http
DELETE /api/users/{id}/
Authorization: Bearer <access_token>
```

### Quotation Management Endpoints

#### Chat with AI
```http
POST /api/chat/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Add a web development service for $5000"
}
```

#### Get Quotation
```http
GET /api/quotation/
Authorization: Bearer <access_token>
```

#### Reset Quotation
```http
POST /api/reset/
Authorization: Bearer <access_token>
```

#### Sync Quotation
```http
POST /api/sync-quotation/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "quotation": { /* quotation data */ }
}
```

#### Get Conversation History
```http
GET /api/conversation-history/
Authorization: Bearer <access_token>
```

#### Sync Conversation History
```http
POST /api/sync-conversation-history/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "messages": [ /* conversation messages */ ]
}
```

### Additional Endpoints

#### Dashboard Statistics
```http
GET /api/dashboard-stats/?year=2024
Authorization: Bearer <access_token>
```

#### Get Company Details
```http
GET /api/company-details/
Authorization: Bearer <access_token>
```

#### Update Company Details
```http
PUT /api/company-details/update/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "company_name": "Updated Company",
  "email": "updated@example.com",
  "tagline": "New Tagline",
  "phone_number": "+1234567890",
  "address": "New Address"
}
```

#### Send Quotation Email
```http
POST /api/send-quotation-email/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "recipient_email": "customer@example.com",
  "customer_name": "Customer Name",
  "pdf_base64": "base64_encoded_pdf_string",
  "pdf_filename": "quotation.pdf"
}
```

#### Get Company Info
```http
GET /api/company-info/
```

#### Get Company Login
```http
GET /api/company-login/
```

For complete API documentation with examples, see `Backend API's.pdf` in the backend directory.

## Project Structure

```
backend/
├── kattappa/              # Django project settings
│   ├── __init__.py
│   ├── settings.py        # Django settings
│   ├── urls.py           # Main URL configuration
│   ├── wsgi.py           # WSGI configuration
│   └── asgi.py           # ASGI configuration
├── quotations/           # Main application
│   ├── __init__.py
│   ├── models.py         # Database models
│   ├── views.py          # API views
│   ├── urls.py           # App URL configuration
│   ├── admin.py          # Django admin configuration
│   ├── jwt_utils.py      # JWT token utilities
│   ├── services.py       # OpenRouter AI service
│   ├── services/         # Service modules
│   │   ├── ollama_service.py
│   │   └── quotation_manager.py
│   ├── migrations/       # Database migrations
│   └── templates/       # HTML templates
├── media/                # Media files (uploaded images)
│   ├── company_login/
│   ├── company_logos/
│   └── company_quotation/
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
├── db.sqlite3           # SQLite database (development)
└── README.md            # This file
```

## Database Models

### Company
Stores company information, credentials, and settings:
- Company name, email, password
- Tagline, phone number, address
- Email credentials for sending quotations
- WhatsApp number
- OpenRouter API credentials
- Login logo, login image, quotation logo

### Client (Customer)
Stores customer/client information:
- Customer name, company name
- Email, phone number, address
- Active status

### User
Stores user accounts:
- Email, password (hashed)
- First name, last name
- Active status
- Admin flag
- Permissions array

### Quotation
Stores quotation data:
- JSON field for quotation data
- Created/updated timestamps

### QuotationSend
Tracks quotation sends:
- Quotation reference
- Send type (email/whatsapp)
- Recipient email
- User ID (who sent it)
- Sent timestamp

### RefreshToken
Manages refresh tokens for JWT authentication:
- Token string
- User email, user type, user ID
- IP address, user agent
- Expiry date
- Revoked flag

## Authentication

The backend uses JWT (JSON Web Tokens) for authentication:

1. **Login**: User/Company logs in with email and password
2. **Access Token**: Short-lived token (15 minutes) for API requests
3. **Refresh Token**: Long-lived token for getting new access tokens
4. **Token Rotation**: Optional refresh token rotation for enhanced security

### Token Structure

Access tokens contain:
- `user_email`: User's email
- `user_type`: 'user' or 'company'
- `user_id`: User ID (if user type)
- `is_admin`: Admin flag
- `permissions`: Array of permissions

### Using Tokens

Include the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | (auto-generated) |
| `DEBUG` | Debug mode | `True` |
| `OPENROUTER_API_KEY` | OpenRouter API key | (required) |
| `OPENROUTER_MODEL` | AI model to use | `google/gemini-flash-1.5:free` |
| `JWT_ISSUER` | JWT issuer | `kattappa-api` |
| `JWT_AUDIENCE` | JWT audience | `kattappa-client` |
| `ENABLE_TOKEN_ROTATION` | Enable token rotation | `True` |

## Development

### Running Migrations

```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Creating Superuser

```bash
python manage.py createsuperuser
```

### Collecting Static Files

```bash
python manage.py collectstatic
```

### Django Shell

```bash
python manage.py shell
```

### Accessing Admin Panel

1. Start the server: `python manage.py runserver`
2. Navigate to: `http://localhost:8000/admin/`
3. Login with superuser credentials

## Testing

### Running Tests

```bash
python manage.py test
```

### Testing API Endpoints

Use tools like:
- **Postman**: Import the API collection
- **curl**: Command-line HTTP client
- **Thunder Client**: VS Code extension
- **Insomnia**: API testing tool

Example curl command:

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Deployment

### Production Checklist

1. **Security Settings**:
   - Set `DEBUG = False`
   - Update `SECRET_KEY` to a secure random value
   - Configure `ALLOWED_HOSTS`
   - Set up HTTPS/SSL

2. **Database**:
   - Switch from SQLite to PostgreSQL
   - Configure database connection
   - Run migrations

3. **Static Files**:
   - Configure static file serving (Nginx, AWS S3, etc.)
   - Run `collectstatic`

4. **Media Files**:
   - Configure media file storage (AWS S3, Azure Blob, etc.)

5. **Environment Variables**:
   - Set all required environment variables
   - Use secrets manager for sensitive data

6. **JWT Keys**:
   - Generate RSA key pair for production
   - Store keys securely

7. **WSGI Server**:
   - Use Gunicorn or uWSGI
   - Configure with Nginx reverse proxy

### Example Production Setup

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn kattappa.wsgi:application --bind 0.0.0.0:8000
```

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "kattappa.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## Troubleshooting

### Common Issues

1. **Migration Errors**:
   ```bash
   python manage.py migrate --run-syncdb
   ```

2. **Static Files Not Loading**:
   ```bash
   python manage.py collectstatic --noinput
   ```

3. **Permission Denied**:
   - Check file permissions
   - Ensure media directory is writable

4. **CORS Errors**:
   - Update `CSRF_TRUSTED_ORIGINS` in settings.py
   - Add frontend URL to allowed origins

5. **JWT Token Errors**:
   - Check token expiry
   - Verify token format
   - Ensure refresh token is valid

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions:
- Check the API documentation
- Review the code comments
- Contact the development team

## Changelog

### Version 1.0.0
- Initial release
- JWT authentication
- Customer and user management
- AI-powered quotation generation
- Email sending functionality
- Dashboard statistics

---

**Last Updated**: January 2024

