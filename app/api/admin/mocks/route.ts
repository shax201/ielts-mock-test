import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, hasRole } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { UserRole, ModuleType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    
    if (!payload || !hasRole(payload, UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const mocks = await prisma.mock.findMany({
      include: {
        creator: {
          select: { email: true }
        },
        modules: {
          include: {
            questions: true
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ mocks })
  } catch (error) {
    console.error('Error fetching mocks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    
    if (!payload || !hasRole(payload, UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, description, modules, isDraft } = await request.json()

    if (!title || !modules || !Array.isArray(modules)) {
      return NextResponse.json(
        { error: 'Title and modules are required' },
        { status: 400 }
      )
    }

    // Create mock test with modules and questions
    const mock = await prisma.$transaction(async (tx) => {
      // First create the mock
      const createdMock = await tx.mock.create({
        data: {
          title,
          description: description || '',
          createdBy: payload.userId,
        }
      })

      // Then create modules and their questions
      for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
        const module = modules[moduleIndex]
        
        // Create the module
        const createdModule = await tx.mockModule.create({
          data: {
            mockId: createdMock.id,
            type: module.type as ModuleType,
            durationMinutes: module.duration || 60,
            audioUrl: module.audioUrl || null,
            instructions: module.instructions || '',
            order: moduleIndex + 1,
          }
        })

        // Create questions for this module
        if (module.questions && module.questions.length > 0) {
          for (let questionIndex = 0; questionIndex < module.questions.length; questionIndex++) {
            const question = module.questions[questionIndex]
            
            // First create the question in the question bank
            const questionBank = await tx.questionBank.create({
              data: {
                type: question.type || 'MCQ',
                contentJson: {
                  content: question.content || '',
                  options: question.options || [],
                  fibData: question.fibData || null,
                  instructions: question.instructions || '',
                  type: question.type || 'MCQ'
                },
                reusable: false
              }
            })

            // Then create the mock question linking to the question bank
            await tx.mockQuestion.create({
              data: {
                moduleId: createdModule.id,
                questionBankId: questionBank.id,
                order: questionIndex + 1,
                points: question.points || 1,
                correctAnswerJson: question.correctAnswer || ''
              }
            })
          }
        }
      }

      // Return the created mock with all relations
      return await tx.mock.findUnique({
        where: { id: createdMock.id },
        include: {
          modules: {
            include: {
              questions: {
                include: {
                  questionBank: true
                }
              }
            }
          }
        }
      })
    })

    return NextResponse.json({ mock }, { status: 201 })
  } catch (error) {
    console.error('Error creating mock:', error)
    
    // Provide more specific error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
