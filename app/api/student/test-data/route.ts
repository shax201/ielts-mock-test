import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AssignmentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const module = searchParams.get('module')

    if (!token || !module) {
      return NextResponse.json(
        { error: 'Token and module are required' },
        { status: 400 }
      )
    }

    // Validate token and get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { tokenHash: token },
      include: {
        mock: {
          include: {
            modules: {
              where: { type: module as any }, // Type assertion to bypass TypeScript error
              include: {
                questions: {
                  orderBy: { order: 'asc' },
                  include: {
                    questionBank: true
                  }
                }
              }
            }
          }
        },
        student: true
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    // Check if token is expired
    const now = new Date()
    if (now > assignment.validUntil) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 410 }
      )
    }

    // Check if token is not yet active
    if (now < assignment.validFrom) {
      return NextResponse.json(
        { error: 'Token is not yet active' },
        { status: 403 }
      )
    }

    // Check assignment status
    if (assignment.status === AssignmentStatus.COMPLETED) {
      return NextResponse.json(
        { error: 'Test has already been completed' },
        { status: 409 }
      )
    }

    const moduleData = assignment.mock.modules[0]
    if (!moduleData) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      )
    }

    // Format questions based on module type
    let formattedQuestions: any[] = []
    
    if (module === 'LISTENING') {
      // Format real questions from database
      formattedQuestions = moduleData.questions.map(q => ({
        id: q.questionBank.id,
        type: q.questionBank.type,
        content: (q.questionBank.contentJson as any)?.content || q.questionBank.contentJson,
        options: (q.questionBank.contentJson as any)?.options,
        part: q.order,
        fibData: (q.questionBank.contentJson as any)?.fibData,
        matchingData: (q.questionBank.contentJson as any)?.matchingData,
        notesCompletionData: (q.questionBank.contentJson as any)?.notesCompletionData,
        summaryCompletionData: (q.questionBank.contentJson as any)?.summaryCompletionData,
        trueFalseNotGivenData: (q.questionBank.contentJson as any)?.trueFalseNotGivenData,
        instructions: (q.questionBank.contentJson as any)?.instructions,
        correctAnswer: q.correctAnswerJson,
        points: q.points
      }))
    } else if (module === 'READING') {
      // Format real questions from database or provide fallback
      if (moduleData.questions.length > 0) {
        formattedQuestions = moduleData.questions.map(q => {
          const contentJson = q.questionBank.contentJson as any
          
          // Ensure proper question structure based on type
          const baseQuestion = {
            id: q.questionBank.id,
            type: q.questionBank.type,
            content: contentJson.content || q.questionBank.contentJson,
            part: q.order,
            correctAnswer: q.correctAnswerJson,
            points: q.points,
            instructions: contentJson.instructions
          }

          // Add type-specific data structures
          if (q.questionBank.type === 'MULTIPLE_CHOICE' || q.questionBank.type === 'MCQ') {
            return {
              ...baseQuestion,
              type: 'MULTIPLE_CHOICE',
              options: contentJson.options || [
                'A) To study animal behavior',
                'B) To analyze climate data', 
                'C) To examine social trends',
                'D) To investigate economic factors'
              ]
            }
          } else if (q.questionBank.type === 'TRUE_FALSE_NOT_GIVEN') {
            return {
              ...baseQuestion,
              trueFalseNotGivenData: {
                statement: contentJson.content || q.questionBank.contentJson,
                correctAnswer: q.correctAnswerJson
              }
            }
          } else if (q.questionBank.type === 'NOTES_COMPLETION') {
            return {
              ...baseQuestion,
              notesCompletionData: contentJson.notesCompletionData || {
                title: 'Environmental Solutions',
                instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
                notes: [
                  { id: 'n1', content: 'Solar energy is considered the most', hasBlank: true },
                  { id: 'n2', content: 'Wind power requires', hasBlank: true },
                  { id: 'n3', content: 'The main challenge is', hasBlank: true }
                ]
              }
            }
          } else if (q.questionBank.type === 'SUMMARY_COMPLETION') {
            return {
              ...baseQuestion,
              summaryCompletionData: contentJson.summaryCompletionData || {
                title: 'Renewable Energy Summary',
                instructions: 'Choose NO MORE THAN TWO WORDS from the passage for each answer.',
                content: 'Renewable energy sources like [1] and [2] are becoming increasingly popular due to their [3] benefits and [4] impact on the environment.',
                blanks: [
                  { id: 'b1', position: 1, correctAnswer: 'solar' },
                  { id: 'b2', position: 2, correctAnswer: 'wind' },
                  { id: 'b3', position: 3, correctAnswer: 'economic' },
                  { id: 'b4', position: 4, correctAnswer: 'positive' }
                ]
              }
            }
          } else if (q.questionBank.type as string === 'FIB' || q.questionBank.type as string === 'NOTES_COMPLETION' || q.questionBank.type as string === 'SUMMARY_COMPLETION') {
            return {
              ...baseQuestion,
              type: 'FIB', // Map to FIB type for all fill-in types
              fibData: contentJson.fibData || {
                content: 'Climate change is primarily caused by [BLANK_1] activities, particularly the burning of [BLANK_2] fuels.',
                instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
                blanks: [
                  { id: 'b1', position: 1, correctAnswer: 'human', caseSensitive: false },
                  { id: 'b2', position: 2, correctAnswer: 'fossil', caseSensitive: false }
                ]
              }
            }
          }

          return baseQuestion
        })
        
        // Add some FIB questions to the existing questions
        const fibQuestions = [
          {
            id: 'fib1',
            type: 'FIB',
            content: 'Complete the sentences below using words from the passage.',
            fibData: {
              content: 'Climate change represents one of the most pressing challenges of our time, affecting [BLANK_1], weather patterns, and human societies across the globe. The scientific consensus is clear: [BLANK_2] activities, particularly the burning of fossil fuels, have significantly contributed to the warming of the Earth\'s atmosphere. The effects of climate change on marine ecosystems are particularly concerning. Rising ocean temperatures have caused widespread [BLANK_3] bleaching, threatening the survival of coral reefs that support approximately [BLANK_4] of all marine life.',
              instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
              blanks: [
                { id: 'b1', position: 1, correctAnswer: 'ecosystems', caseSensitive: false },
                { id: 'b2', position: 2, correctAnswer: 'human', caseSensitive: false },
                { id: 'b3', position: 3, correctAnswer: 'coral', caseSensitive: false },
                { id: 'b4', position: 4, correctAnswer: '25%', caseSensitive: false }
              ]
            },
            part: 1,
            correctAnswer: 'ecosystems',
            points: 1,
            instructions: 'Complete the sentences using words from the passage.'
          },
          {
            id: 'fib2',
            type: 'FIB',
            content: 'Fill in the blanks using words from the passage.',
            fibData: {
              content: 'Renewable energy has become one of the most important topics in modern environmental discussions. As the world faces increasing challenges from climate change, governments and organizations are turning to [BLANK_1] energy sources to reduce carbon emissions and create a more [BLANK_2] future. Solar energy, one of the most popular renewable energy sources, has seen dramatic [BLANK_3] reductions over the past decade. The technology has become more efficient and [BLANK_4], making it accessible to both residential and commercial users.',
              instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
              blanks: [
                { id: 'b1', position: 1, correctAnswer: 'sustainable', caseSensitive: false },
                { id: 'b2', position: 2, correctAnswer: 'sustainable', caseSensitive: false },
                { id: 'b3', position: 3, correctAnswer: 'cost', caseSensitive: false },
                { id: 'b4', position: 4, correctAnswer: 'affordable', caseSensitive: false }
              ]
            },
            part: 2,
            correctAnswer: 'sustainable',
            points: 1,
            instructions: 'Fill in the blanks using words from the passage.'
          },
          {
            id: 'fib3',
            type: 'FIB',
            content: 'Complete the summary using words from the passage.',
            fibData: {
              content: 'The United Nations Sustainable Development Goals (SDGs) provide a framework for addressing global challenges including poverty, inequality, climate change, and environmental [BLANK_1]. These [BLANK_2] interconnected goals aim to create a more sustainable and equitable world by [BLANK_3]. Goal 7 specifically focuses on ensuring access to affordable, reliable, sustainable, and modern [BLANK_4] for all.',
              instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
              blanks: [
                { id: 'b1', position: 1, correctAnswer: 'degradation', caseSensitive: false },
                { id: 'b2', position: 2, correctAnswer: '17', caseSensitive: false },
                { id: 'b3', position: 3, correctAnswer: '2030', caseSensitive: false },
                { id: 'b4', position: 4, correctAnswer: 'energy', caseSensitive: false }
              ]
            },
            part: 3,
            correctAnswer: 'degradation',
            points: 1,
            instructions: 'Complete the summary using words from the passage.'
          }
        ]
        
        // Combine database questions with FIB questions
        formattedQuestions = [...formattedQuestions, ...fibQuestions]
      } else {
        // Fallback questions with proper structure
        formattedQuestions = [
          {
            id: 'q1',
            type: 'TRUE_FALSE_NOT_GIVEN',
            content: 'Climate change is caused primarily by natural factors.',
            trueFalseNotGivenData: {
              statement: 'Climate change is caused primarily by natural factors.',
              correctAnswer: 'FALSE'
            },
            part: 1,
            correctAnswer: 'FALSE',
            points: 1,
            instructions: 'Choose TRUE, FALSE, or NOT GIVEN.'
          },
          {
            id: 'q2',
            type: 'TRUE_FALSE_NOT_GIVEN',
            content: 'Coral reefs support approximately 25% of all marine life.',
            trueFalseNotGivenData: {
              statement: 'Coral reefs support approximately 25% of all marine life.',
              correctAnswer: 'TRUE'
            },
            part: 1,
            correctAnswer: 'TRUE',
            points: 1,
            instructions: 'Choose TRUE, FALSE, or NOT GIVEN.'
          },
          {
            id: 'q3',
            type: 'MULTIPLE_CHOICE',
            content: 'What is the main purpose of the passage?',
            options: [
              'To describe the history of technology',
              'To explain the benefits of renewable energy',
              'To discuss environmental challenges',
              'To analyze economic trends'
            ],
            part: 2,
            correctAnswer: 'To explain the benefits of renewable energy',
            points: 1,
            instructions: 'Choose the correct answer.'
          },
          {
            id: 'q4',
            type: 'NOTES_COMPLETION',
            content: 'Complete the notes below using words from the passage.',
            notesCompletionData: {
              title: 'Environmental Solutions',
              instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
              notes: [
                { id: 'n1', content: 'Solar energy is considered the most', hasBlank: true },
                { id: 'n2', content: 'Wind power requires', hasBlank: true },
                { id: 'n3', content: 'The main challenge is', hasBlank: true }
              ]
            },
            part: 2,
            correctAnswer: 'efficient',
            points: 1,
            instructions: 'Complete the notes using words from the passage.'
          },
          {
            id: 'q5',
            type: 'FIB',
            content: 'Complete the sentences below using words from the passage.',
            fibData: {
              content: 'Climate change is primarily caused by [BLANK_1] activities, particularly the burning of [BLANK_2] fuels. The effects on marine ecosystems include [BLANK_3] bleaching and ocean [BLANK_4].',
              instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
              blanks: [
                { id: 'b1', position: 1, correctAnswer: 'human', caseSensitive: false },
                { id: 'b2', position: 2, correctAnswer: 'fossil', caseSensitive: false },
                { id: 'b3', position: 3, correctAnswer: 'coral', caseSensitive: false },
                { id: 'b4', position: 4, correctAnswer: 'acidification', caseSensitive: false }
              ]
            },
            part: 1,
            correctAnswer: 'human',
            points: 1,
            instructions: 'Complete the sentences using words from the passage.'
          },
          {
            id: 'q6',
            type: 'FIB',
            content: 'Fill in the blanks using words from the passage.',
            fibData: {
              content: 'Renewable energy sources like [BLANK_1] and [BLANK_2] are becoming increasingly popular. Solar panels can be installed on [BLANK_3] and in [BLANK_4].',
              instructions: 'Write NO MORE THAN TWO WORDS for each answer.',
              blanks: [
                { id: 'b1', position: 1, correctAnswer: 'solar', caseSensitive: false },
                { id: 'b2', position: 2, correctAnswer: 'wind', caseSensitive: false },
                { id: 'b3', position: 3, correctAnswer: 'rooftops', caseSensitive: false },
                { id: 'b4', position: 4, correctAnswer: 'fields', caseSensitive: false }
              ]
            },
            part: 2,
            correctAnswer: 'solar',
            points: 1,
            instructions: 'Fill in the blanks using words from the passage.'
          }
        ]
      }

      return NextResponse.json({
        module: {
          id: moduleData.id,
          type: moduleData.type,
          duration: moduleData.durationMinutes,
          instructions: moduleData.instructions
        },
        questions: formattedQuestions,
        partContent: {
          part1: `
            <p><strong>Climate Change and Marine Ecosystems</strong></p>
            <p>Climate change represents one of the most pressing challenges of our time, affecting ecosystems, weather patterns, and human societies across the globe. The scientific consensus is clear: human activities, particularly the burning of fossil fuels, have significantly contributed to the warming of the Earth's atmosphere.</p>
            
            <p>The effects of climate change on marine ecosystems are particularly concerning. Rising ocean temperatures have caused widespread coral bleaching, threatening the survival of coral reefs that support approximately 25% of all marine life. Additionally, ocean acidification, caused by the absorption of carbon dioxide, is making it increasingly difficult for marine organisms to build their shells and skeletons.</p>
            
            <p>Global fisheries are experiencing unprecedented stress due to climate change. Fish populations are migrating to cooler waters, disrupting traditional fishing grounds and affecting the livelihoods of millions of people who depend on fishing. The warming waters are also leading to changes in fish behavior and reproduction patterns, further complicating sustainable fishing practices.</p>
          `,
          part2: `
            <p><strong>Renewable Energy Solutions</strong></p>
            <p>Renewable energy has become one of the most important topics in modern environmental discussions. As the world faces increasing challenges from climate change, governments and organizations are turning to sustainable energy sources to reduce carbon emissions and create a more sustainable future.</p>
            
            <p>Solar energy, one of the most popular renewable energy sources, has seen dramatic cost reductions over the past decade. The technology has become more efficient and affordable, making it accessible to both residential and commercial users. Solar panels can now be installed on rooftops, in fields, and even integrated into building materials.</p>
            
            <p>Wind power is another significant renewable energy source that has gained momentum worldwide. Modern wind turbines are more efficient and can generate electricity even in areas with moderate wind speeds. Offshore wind farms are particularly promising, as they can take advantage of stronger and more consistent winds over water.</p>
          `,
          part3: `
            <p><strong>Sustainable Development Goals</strong></p>
            <p>The United Nations Sustainable Development Goals (SDGs) provide a framework for addressing global challenges including poverty, inequality, climate change, and environmental degradation. These 17 interconnected goals aim to create a more sustainable and equitable world by 2030.</p>
            
            <p>Goal 7 specifically focuses on ensuring access to affordable, reliable, sustainable, and modern energy for all. This goal recognizes that energy is essential for development and that renewable energy sources are key to achieving environmental sustainability while meeting growing energy demands.</p>
            
            <p>Achieving these goals requires cooperation between governments, businesses, and civil society. International partnerships and knowledge sharing are essential for developing and implementing effective solutions to global environmental challenges.</p>
          `
        },
        assignment: {
          id: assignment.id,
          candidateNumber: assignment.candidateNumber,
          studentName: assignment.student.email,
          mockTitle: assignment.mock.title
        }
      })
    } else if (module === 'WRITING') {
      // For writing, create tasks
      const tasks = [
        {
          id: 'task-1',
          taskNumber: 1 as const,
          title: 'Task 1: Academic Writing',
          instructions: 'You should spend about 20 minutes on this task.\n\nWrite at least 150 words.\n\nYou should write about the following topic:\n\nSome people believe that technology has made our lives more complicated, while others think it has made life easier. Discuss both views and give your own opinion.',
          wordCount: 150,
          timeLimit: 20,
          content: ''
        },
        {
          id: 'task-2',
          taskNumber: 2 as const,
          title: 'Task 2: Essay Writing',
          instructions: 'You should spend about 40 minutes on this task.\n\nWrite at least 250 words.\n\nYou should write about the following topic:\n\nIn many countries, the number of people choosing to live alone is increasing. What are the reasons for this trend? Is this a positive or negative development?',
          wordCount: 250,
          timeLimit: 40,
          content: ''
        }
      ]

      return NextResponse.json({
        module: {
          id: moduleData.id,
          type: moduleData.type,
          duration: moduleData.durationMinutes,
          instructions: moduleData.instructions
        },
        tasks,
        assignment: {
          id: assignment.id,
          candidateNumber: assignment.candidateNumber,
          studentName: assignment.student.email,
          mockTitle: assignment.mock.title
        }
      })
    } else if (module === 'SPEAKING') {
      // For speaking, create parts
      const parts = [
        {
          id: 'part-1',
          partNumber: 1 as const,
          title: 'Part 1: Introduction and Interview',
          instructions: 'The examiner will ask you general questions about yourself and familiar topics. This part lasts 4-5 minutes.\n\nAnswer the following questions as if you were speaking to an examiner:',
          timeLimit: 5,
          content: '',
          questions: [
            'What is your full name?',
            'Where are you from?',
            'Do you work or study?',
            'What do you like about your job/studies?',
            'What do you do in your free time?'
          ]
        },
        {
          id: 'part-2',
          partNumber: 2 as const,
          title: 'Part 2: Individual Long Turn',
          instructions: 'You will be given a topic card and have 1 minute to prepare. You should speak for 1-2 minutes about the topic. The examiner may ask one or two follow-up questions.\n\nPrepare your response to the topic card below:',
          timeLimit: 4,
          content: '',
          topicCard: {
            title: 'Describe a memorable trip you have taken',
            bulletPoints: [
              'Where you went',
              'Who you went with',
              'What you did there',
              'Why it was memorable'
            ]
          }
        },
        {
          id: 'part-3',
          partNumber: 3 as const,
          title: 'Part 3: Two-way Discussion',
          instructions: 'The examiner will ask you questions related to the topic in Part 2. This part lasts 4-5 minutes.\n\nAnswer the following questions as if you were having a discussion with the examiner:',
          timeLimit: 5,
          content: '',
          questions: [
            'What are the benefits of traveling?',
            'How has tourism changed in your country?',
            'Do you think it is important to travel when you are young?',
            'What are the advantages and disadvantages of traveling alone?'
          ]
        }
      ]

      return NextResponse.json({
        module: {
          id: moduleData.id,
          type: moduleData.type,
          duration: moduleData.durationMinutes,
          instructions: moduleData.instructions
        },
        parts,
        assignment: {
          id: assignment.id,
          candidateNumber: assignment.candidateNumber,
          studentName: assignment.student.email,
          mockTitle: assignment.mock.title
        }
      })
    }

    return NextResponse.json({
      module: {
        id: moduleData.id,
        type: moduleData.type,
        duration: moduleData.durationMinutes,
        instructions: moduleData.instructions,
        audioUrl: moduleData.audioUrl
      },
      questions: formattedQuestions,
      assignment: {
        id: assignment.id,
        candidateNumber: assignment.candidateNumber,
        studentName: assignment.student.email,
        mockTitle: assignment.mock.title
      }
    })
  } catch (error) {
    console.error('Test data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
