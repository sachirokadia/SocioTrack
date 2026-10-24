# SocioTrack Backend

Node.js + Express + TypeScript backend API for SocioTrack - Residential Society Management System.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration.

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   └── database.ts   # MongoDB connection
├── models/           # Mongoose models
├── controllers/      # Route controllers
├── routes/           # API routes
├── middleware/       # Custom middleware
├── utils/            # Utility functions
├── types/            # TypeScript interfaces
└── server.ts         # Main server file
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sociotrack

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Admin (for initial setup)
DEFAULT_ADMIN_EMAIL=admin@sociotrack.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

## 📚 API Endpoints

### Health Check
- `GET /health` - Check API status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Complaints
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `PUT /api/complaints/:id/status` - Update complaint status
- `PUT /api/complaints/:id/assign` - Assign complaint to technician

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get notice by ID
- `POST /api/notices` - Create new notice (admin only)
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert (admin only)
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Authentication & Authorization

### JWT Tokens
- Access tokens expire in 7 days
- Tokens are sent in `Authorization: Bearer <token>` header
- Protected routes require valid JWT token

### User Roles
1. **Resident** (`resident`)
   - Submit complaints
   - View notices and alerts
   - Give feedback on resolved complaints

2. **Technician** (`technician`)
   - All resident permissions
   - View assigned complaints
   - Update complaint status
   - Add remarks to complaints

3. **Admin** (`admin`)
   - All technician permissions
   - Create/update/delete notices and alerts
   - Assign complaints to technicians
   - Manage users
   - View system statistics

### Middleware
- `authMiddleware` - Verifies JWT token
- `roleMiddleware` - Restricts access based on user role
- `validateRequest` - Validates request body using express-validator

## 🛠️ Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Code Style
- Use TypeScript strictly
- Follow ESLint configuration
- Write meaningful comments for complex logic
- Use async/await for asynchronous operations
- Handle errors appropriately with try/catch

### Database Models
All models follow Mongoose schema pattern:
```typescript
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // ... other fields
}, {
  timestamps: true
});

export default model('User', userSchema);
```

## 🧪 Testing

Testing setup will be added in later specs.

## 🔧 Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running: `mongod`
2. Check connection string in `.env` file
3. Verify network connectivity

### Port Already in Use
Change `PORT` in `.env` file or use:
```bash
PORT=5001 npm run dev
```

### TypeScript Errors
1. Run `npm run build` to check for compilation errors
2. Ensure all TypeScript types are properly defined
3. Check `tsconfig.json` configuration

## 📄 License

MIT