import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedReadingQuestions() {
  try {
    console.log('🌱 Seeding reading questions with FIB questions...')

    // Create admin user if not exists
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

    // Create a sample student if not exists
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

    // Create a comprehensive mock test
    const mockTest = await prisma.mock.upsert({
      where: { id: 'comprehensive-reading-test' },
      update: {},
      create: {
        id: 'comprehensive-reading-test',
        title: 'IELTS Academic Reading Test - Comprehensive',
        description: 'A comprehensive IELTS Academic Reading test with various question types including Fill-in-the-Blank questions',
        createdBy: adminUser.id
      }
    })

    // Create Reading module
    const readingModule = await prisma.mockModule.upsert({
      where: { id: 'reading-module-comprehensive' },
      update: {},
      create: {
        id: 'reading-module-comprehensive',
        mockId: mockTest.id,
        type: 'READING',
        durationMinutes: 60,
        instructions: 'Read the passages and answer the questions. You can refer back to the passages while answering.',
        order: 1
      }
    })

    // Create comprehensive question bank entries
    const questionBankEntries = [
      // Part 1 - Climate Change Questions
      {
        id: 'q1-climate-true-false',
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
        id: 'q2-climate-multiple-choice',
        type: 'MULTIPLE_CHOICE' as const,
        contentJson: {
          content: 'What is the main cause of global warming according to the passage?',
          instructions: 'Choose the correct answer.',
          options: [
            'Natural climate variations',
            'Human activities and greenhouse gas emissions',
            'Solar radiation changes',
            'Volcanic activity'
          ],
          correctAnswer: 'Human activities and greenhouse gas emissions'
        }
      },
      {
        id: 'q3-climate-fib',
        type: 'FIB' as const,
        contentJson: {
          content: 'Complete the sentences below using words from the passage.',
          instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
          fibData: {
            content: 'Climate change represents one of the most pressing challenges of our time, affecting [BLANK_1], weather patterns, and human societies across the globe. The scientific consensus is clear: [BLANK_2] activities, particularly the burning of fossil fuels, have significantly contributed to the warming of the Earth\'s atmosphere. The effects of climate change on marine ecosystems are particularly concerning. Rising ocean temperatures have caused widespread [BLANK_3] bleaching, threatening the survival of coral reefs that support approximately [BLANK_4] of all marine life.',
            instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
            blanks: [
              { id: 'b1', position: 1, correctAnswer: 'ecosystems', caseSensitive: false },
              { id: 'b2', position: 2, correctAnswer: 'human', caseSensitive: false },
              { id: 'b3', position: 3, correctAnswer: 'coral', caseSensitive: false },
              { id: 'b4', position: 4, correctAnswer: '25%', caseSensitive: false }
            ]
          }
        }
      },
      {
        id: 'q4-climate-notes-completion',
        type: 'NOTES_COMPLETION' as const,
        contentJson: {
          content: 'Complete the notes below using words from the passage.',
          instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
          notesCompletionData: {
            title: 'Climate Change Solutions',
            instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
            notes: [
              { id: 'n1', content: 'Renewable energy sources include', hasBlank: true },
              { id: 'n2', content: 'Carbon capture technology helps', hasBlank: true },
              { id: 'n3', content: 'The main challenge is reducing', hasBlank: true }
            ]
          },
          correctAnswer: 'solar'
        }
      },

      // Part 2 - Renewable Energy Questions
      {
        id: 'q5-renewable-true-false',
        type: 'TRUE_FALSE_NOT_GIVEN' as const,
        contentJson: {
          content: 'Solar energy is the most efficient renewable energy source.',
          instructions: 'Choose TRUE, FALSE, or NOT GIVEN.',
          trueFalseNotGivenData: {
            statement: 'Solar energy is the most efficient renewable energy source.',
            correctAnswer: 'NOT GIVEN'
          }
        }
      },
      {
        id: 'q6-renewable-fib',
        type: 'FIB' as const,
        contentJson: {
          content: 'Fill in the blanks using words from the passage.',
          instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
          fibData: {
            content: 'Renewable energy has become one of the most important topics in modern environmental discussions. As the world faces increasing challenges from climate change, governments and organizations are turning to [BLANK_1] energy sources to reduce carbon emissions and create a more [BLANK_2] future. Solar energy, one of the most popular renewable energy sources, has seen dramatic [BLANK_3] reductions over the past decade. The technology has become more efficient and [BLANK_4], making it accessible to both residential and commercial users.',
            instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
            blanks: [
              { id: 'b1', position: 1, correctAnswer: 'sustainable', caseSensitive: false },
              { id: 'b2', position: 2, correctAnswer: 'sustainable', caseSensitive: false },
              { id: 'b3', position: 3, correctAnswer: 'cost', caseSensitive: false },
              { id: 'b4', position: 4, correctAnswer: 'affordable', caseSensitive: false }
            ]
          }
        }
      },
      {
        id: 'q7-renewable-multiple-choice',
        type: 'MULTIPLE_CHOICE' as const,
        contentJson: {
          content: 'What is the main advantage of renewable energy sources?',
          instructions: 'Choose the correct answer.',
          options: [
            'They are always available',
            'They produce no emissions',
            'They are cheaper than fossil fuels',
            'They require no maintenance'
          ],
          correctAnswer: 'They produce no emissions'
        }
      },

      // Part 3 - Sustainable Development Questions
      {
        id: 'q8-sdg-fib',
        type: 'FIB' as const,
        contentJson: {
          content: 'Complete the summary using words from the passage.',
          instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
          fibData: {
            content: 'The United Nations Sustainable Development Goals (SDGs) provide a framework for addressing global challenges including poverty, inequality, climate change, and environmental [BLANK_1]. These [BLANK_2] interconnected goals aim to create a more sustainable and equitable world by [BLANK_3]. Goal 7 specifically focuses on ensuring access to affordable, reliable, sustainable, and modern [BLANK_4] for all.',
            instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
            blanks: [
              { id: 'b1', position: 1, correctAnswer: 'degradation', caseSensitive: false },
              { id: 'b2', position: 2, correctAnswer: '17', caseSensitive: false },
              { id: 'b3', position: 3, correctAnswer: '2030', caseSensitive: false },
              { id: 'b4', position: 4, correctAnswer: 'energy', caseSensitive: false }
            ]
          }
        }
      },
      {
        id: 'q9-sdg-summary-completion',
        type: 'SUMMARY_COMPLETION' as const,
        contentJson: {
          content: 'Complete the summary below using words from the passage.',
          instructions: 'Choose NO MORE THAN TWO WORDS from the passage for each answer.',
          summaryCompletionData: {
            title: 'Sustainable Development Summary',
            instructions: 'Choose NO MORE THAN TWO WORDS from the passage for each answer.',
            content: 'The Sustainable Development Goals represent a [1] plan for addressing global challenges. These goals focus on [2], environmental protection, and [3] development. The implementation requires cooperation between [4] and international organizations.',
            blanks: [
              { id: 'b1', position: 1, correctAnswer: 'comprehensive' },
              { id: 'b2', position: 2, correctAnswer: 'social' },
              { id: 'b3', position: 3, correctAnswer: 'economic' },
              { id: 'b4', position: 4, correctAnswer: 'governments' }
            ]
          }
        }
      },
      {
        id: 'q10-sdg-true-false',
        type: 'TRUE_FALSE_NOT_GIVEN' as const,
        contentJson: {
          content: 'All countries have achieved the Sustainable Development Goals.',
          instructions: 'Choose TRUE, FALSE, or NOT GIVEN.',
          trueFalseNotGivenData: {
            statement: 'All countries have achieved the Sustainable Development Goals.',
            correctAnswer: 'FALSE'
          }
        }
      }
    ]

    // Create question bank entries
    for (const question of questionBankEntries) {
      await prisma.questionBank.upsert({
        where: { id: question.id },
        update: question,
        create: question
      })
    }

    // Create MockQuestion entries to link questions to the module
    const mockQuestions = [
      // Part 1 Questions
      {
        id: 'mq1',
        moduleId: readingModule.id,
        questionBankId: 'q1-climate-true-false',
        order: 1,
        points: 1,
        correctAnswerJson: 'FALSE'
      },
      {
        id: 'mq2',
        moduleId: readingModule.id,
        questionBankId: 'q2-climate-multiple-choice',
        order: 2,
        points: 1,
        correctAnswerJson: 'Human activities and greenhouse gas emissions'
      },
      {
        id: 'mq3',
        moduleId: readingModule.id,
        questionBankId: 'q3-climate-fib',
        order: 3,
        points: 1,
        correctAnswerJson: 'ecosystems'
      },
      {
        id: 'mq4',
        moduleId: readingModule.id,
        questionBankId: 'q4-climate-notes-completion',
        order: 4,
        points: 1,
        correctAnswerJson: 'solar'
      },

      // Part 2 Questions
      {
        id: 'mq5',
        moduleId: readingModule.id,
        questionBankId: 'q5-renewable-true-false',
        order: 5,
        points: 1,
        correctAnswerJson: 'NOT GIVEN'
      },
      {
        id: 'mq6',
        moduleId: readingModule.id,
        questionBankId: 'q6-renewable-fib',
        order: 6,
        points: 1,
        correctAnswerJson: 'sustainable'
      },
      {
        id: 'mq7',
        moduleId: readingModule.id,
        questionBankId: 'q7-renewable-multiple-choice',
        order: 7,
        points: 1,
        correctAnswerJson: 'They produce no emissions'
      },

      // Part 3 Questions
      {
        id: 'mq8',
        moduleId: readingModule.id,
        questionBankId: 'q8-sdg-fib',
        order: 8,
        points: 1,
        correctAnswerJson: 'degradation'
      },
      {
        id: 'mq9',
        moduleId: readingModule.id,
        questionBankId: 'q9-sdg-summary-completion',
        order: 9,
        points: 1,
        correctAnswerJson: 'comprehensive'
      },
      {
        id: 'mq10',
        moduleId: readingModule.id,
        questionBankId: 'q10-sdg-true-false',
        order: 10,
        points: 1,
        correctAnswerJson: 'FALSE'
      }
    ]

    for (const mockQuestion of mockQuestions) {
      await prisma.mockQuestion.upsert({
        where: { id: mockQuestion.id },
        update: mockQuestion,
        create: mockQuestion
      })
    }

    // Create assignment with valid token
    const tokenHash = `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    const validFrom = new Date()
    const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    let assignment
    try {
      assignment = await prisma.assignment.create({
        data: {
          id: 'reading-assignment-1',
          mockId: mockTest.id,
          studentId: studentUser.id,
          tokenHash: tokenHash,
          candidateNumber: 'CAND001',
          validFrom: validFrom,
          validUntil: validUntil,
          status: 'ACTIVE'
        }
      })
    } catch (error) {
      // If assignment already exists, find it
      assignment = await prisma.assignment.findUnique({
        where: { id: 'reading-assignment-1' }
      })
    }

    if (!assignment) {
      throw new Error('Failed to create or find assignment')
    }

    console.log('✅ Reading questions seeded successfully!')
    console.log(`📝 Mock Test: ${mockTest.title}`)
    console.log(`📚 Module: ${readingModule.type}`)
    console.log(`❓ Questions: ${questionBankEntries.length} questions created`)
    console.log(`🔗 Assignment Token: ${assignment.tokenHash}`)
    console.log(`👤 Student: ${studentUser.email}`)
    console.log(`📊 Question Types:`)
    console.log(`   - TRUE_FALSE_NOT_GIVEN: 3 questions`)
    console.log(`   - MULTIPLE_CHOICE: 2 questions`)
    console.log(`   - FIB (Fill-in-the-Blank): 3 questions`)
    console.log(`   - NOTES_COMPLETION: 1 question`)
    console.log(`   - SUMMARY_COMPLETION: 1 question`)
    console.log(`\n🌐 Test the questions at: http://localhost:3000/test/${assignment.tokenHash}/reading`)

  } catch (error) {
    console.error('❌ Error seeding reading questions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedReadingQuestions()
  .then(() => {
    console.log('🎉 Reading questions seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
