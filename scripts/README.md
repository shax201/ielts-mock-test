# Mock Test Management Scripts

This directory contains scripts for managing mock tests and sample data in the IELTS Mock Test application.

## Available Scripts

### 1. Reset and Seed Basic Mock Test
```bash
npm run mock:reset
```

**What it does:**
- Clears all existing mock tests and questions
- Creates a basic mock test with sample listening and reading questions
- Creates an admin user if none exists
- Perfect for development and testing

**Sample Data Created:**
- 1 Mock Test with 2 modules (Listening & Reading)
- 3 Listening questions (Multiple Choice, Notes Completion, True/False/Not Given)
- 4 Reading questions (Multiple Choice, Fill in Blank, True/False/Not Given, Summary Completion)
- ⚠️ **Note**: Reading part content (passages) must be added manually via the admin panel

### 2. Create Comprehensive Mock Test
```bash
npm run mock:comprehensive
```

**What it does:**
- Clears all existing mock tests and questions
- Creates a comprehensive mock test with all modules
- Includes more diverse question types
- Better for production-like testing

**Sample Data Created:**
- 1 Mock Test with 4 modules (Listening, Reading, Writing, Speaking)
- 6 Listening questions across 3 parts
- 8 Reading questions across 3 parts
- Writing and Speaking modules (ready for manual content)
- ⚠️ **Note**: Reading part content (passages) must be added manually via the admin panel

## Script Features

### ✅ **Data Management:**
- **Safe Deletion**: Properly handles foreign key constraints
- **User Management**: Creates admin user if needed
- **Question Bank**: Creates reusable question bank entries
- **Module Organization**: Proper module ordering and structure

### ✅ **Question Types Supported:**
- **Multiple Choice**: Standard A/B/C/D questions
- **Fill in the Blank**: Text completion questions
- **Notes Completion**: IELTS-specific format
- **True/False/Not Given**: Reading comprehension
- **Summary Completion**: Advanced reading tasks

### ✅ **IELTS Structure:**
- **Listening Module**: 40 minutes, 3 parts
- **Reading Module**: 60 minutes, 3 parts
- **Writing Module**: 60 minutes (manual tasks)
- **Speaking Module**: 15 minutes (manual tasks)

## Usage Examples

### Development Setup
```bash
# Clear everything and create basic mock test
npm run mock:reset

# Start development server
npm run dev
```

### Production Testing
```bash
# Create comprehensive mock test
npm run mock:comprehensive

# Run tests
npm run test
```

### Database Management
```bash
# Reset entire database
npm run db:reset

# Create comprehensive mock test
npm run mock:comprehensive
```

## File Structure

```
scripts/
├── reset-and-seed-mock-tests.ts      # Basic mock test creation
├── create-comprehensive-mock-test.ts  # Comprehensive mock test
├── seed-students.ts                  # Student user creation
├── calculate-existing-scores.ts      # Score calculation utility
├── test-auto-scoring.ts             # Auto-scoring test utility
└── README.md                         # This documentation
```

## Database Schema

The scripts work with the following Prisma models:
- `Mock` - Main mock test entity
- `MockModule` - Test modules (Listening, Reading, etc.)
- `MockQuestion` - Individual questions
- `QuestionBank` - Reusable question content
- `User` - Admin user for creation

## Error Handling

Both scripts include comprehensive error handling:
- **Foreign Key Constraints**: Proper deletion order
- **User Creation**: Handles existing admin users
- **Database Connections**: Proper cleanup
- **Validation**: Input validation and error messages

## Customization

You can modify the scripts to:
- Add more question types
- Change question content
- Modify module durations
- Add additional modules
- Customize user creation

## Troubleshooting

### Common Issues:

1. **Foreign Key Constraint Errors**
   - Scripts handle this automatically
   - Deletion order is: MockQuestion → MockModule → Mock → QuestionBank

2. **User Creation Errors**
   - Scripts check for existing admin users
   - Creates dummy admin if none exists

3. **Database Connection Issues**
   - Ensure DATABASE_URL is set in .env
   - Run `npm run db:generate` if needed

### Debug Mode:
```bash
# Run with verbose output
DEBUG=* npm run mock:reset
```

## Contributing

When adding new scripts:
1. Follow the existing pattern
2. Include proper error handling
3. Add documentation
4. Test with clean database
5. Update this README
