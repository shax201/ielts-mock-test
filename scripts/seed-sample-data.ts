import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...')

    // Create admin user first
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: 'admin-user-1',
        name: 'Admin User',
        email: 'admin@example.com',
        passwordHash: 'hashed-password',
        role: 'ADMIN'
      }
    })

    // Create a sample student
    const studentUser = await prisma.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: {
        id: 'sample-student-1',
        name: 'Test Student',
        email: 'student@example.com',
        passwordHash: 'hashed-password',
        role: 'STUDENT'
      }
    })

    // Create a sample mock test
    const mockTest = await prisma.mock.upsert({
      where: { id: 'sample-mock-1' },
      update: {},
      create: {
        id: 'sample-mock-1',
        title: 'IELTS Academic Reading Practice Test 1',
        description: 'A comprehensive reading test covering various topics',
        createdBy: adminUser.id
      }
    })

    console.log('✅ Created mock test:', mockTest.title)

    // Create reading module
    const readingModule = await prisma.mockModule.upsert({
      where: { id: 'reading-module-1' },
      update: {},
      create: {
        id: 'reading-module-1',
        mockId: mockTest.id,
        type: 'READING',
        durationMinutes: 60,
        instructions: 'You will read three passages and answer questions. You should spend about 20 minutes on each passage.',
        order: 1
      }
    })

    console.log('✅ Created reading module')

    console.log('✅ Part content will be provided via API')

    // Create sample questions in QuestionBank
    const questionBankEntries = [
      {
        id: 'q1',
        type: 'TRUE_FALSE_NOT_GIVEN' as const,
        contentJson: {
          content: 'Climate change is caused primarily by natural factors.',
          instructions: 'Choose TRUE, FALSE, or NOT GIVEN.',
          trueFalseNotGivenData: {
            statement: 'Climate change is caused primarily by natural factors.',
            correctAnswer: 'FALSE'
          }
        }
      },
      {
        id: 'q2',
        type: 'TRUE_FALSE_NOT_GIVEN' as const,
        contentJson: {
          content: 'Coral reefs support approximately 25% of all marine life.',
          instructions: 'Choose TRUE, FALSE, or NOT GIVEN.',
          trueFalseNotGivenData: {
            statement: 'Coral reefs support approximately 25% of all marine life.',
            correctAnswer: 'TRUE'
          }
        }
      },
      {
        id: 'q3',
        type: 'MULTIPLE_CHOICE' as const,
        contentJson: {
          content: 'What is the main purpose of the passage?',
          instructions: 'Choose the correct answer.',
          options: [
            'To describe the history of technology',
            'To explain the benefits of renewable energy',
            'To discuss environmental challenges',
            'To analyze economic trends'
          ],
          correctAnswer: 'To explain the benefits of renewable energy'
        }
      },
      {
        id: 'q4',
        type: 'NOTES_COMPLETION' as const,
        contentJson: {
          content: 'Complete the notes below using words from the passage.',
          instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
          notesCompletionData: {
            title: 'Environmental Solutions',
            instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
            notes: [
              { id: 'n1', content: 'Solar energy is considered the most', hasBlank: true },
              { id: 'n2', content: 'Wind power requires', hasBlank: true },
              { id: 'n3', content: 'The main challenge is', hasBlank: true }
            ]
          },
          correctAnswer: 'efficient'
        }
      }
    ]

    for (const question of questionBankEntries) {
      await prisma.questionBank.upsert({
        where: { id: question.id },
        update: question,
        create: question
      })
    }

    // Create MockQuestion entries to link questions to the module
    const mockQuestions = [
      {
        id: 'mq1',
        moduleId: readingModule.id,
        questionBankId: 'q1',
        order: 1,
        points: 1,
        correctAnswerJson: 'FALSE'
      },
      {
        id: 'mq2',
        moduleId: readingModule.id,
        questionBankId: 'q2',
        order: 2,
        points: 1,
        correctAnswerJson: 'TRUE'
      },
      {
        id: 'mq3',
        moduleId: readingModule.id,
        questionBankId: 'q3',
        order: 3,
        points: 1,
        correctAnswerJson: 'To explain the benefits of renewable energy'
      },
      {
        id: 'mq4',
        moduleId: readingModule.id,
        questionBankId: 'q4',
        order: 4,
        points: 1,
        correctAnswerJson: 'efficient'
      }
    ]

    for (const mockQuestion of mockQuestions) {
      await prisma.mockQuestion.upsert({
        where: { id: mockQuestion.id },
        update: mockQuestion,
        create: mockQuestion
      })
    }

    console.log('✅ Created sample questions')

    // Create a sample assignment
    let assignment
    try {
      assignment = await prisma.assignment.create({
        data: {
          id: 'sample-assignment-1',
          mockId: mockTest.id,
          studentId: studentUser.id,
          candidateNumber: '278228',
          tokenHash: 'token_1761111436489_c2rgjyak5',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'ACTIVE'
        }
      })
    } catch (error) {
      // Assignment already exists, fetch it
      assignment = await prisma.assignment.findUnique({
        where: { id: 'sample-assignment-1' }
      })
    }

    if (assignment) {
      console.log('✅ Created sample assignment')
      console.log('🎉 Sample data seeded successfully!')
      console.log('📝 Assignment Token:', assignment.tokenHash)
      console.log('🔗 Test URL:', `http://localhost:3000/test/${assignment.tokenHash}`)
    } else {
      console.log('❌ Failed to create assignment')
    }

  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSampleData()
