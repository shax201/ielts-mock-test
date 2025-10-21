import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJWT } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const { searchParams } = new URL(request.url)
    const testToken = searchParams.get('token')
    const moduleType = searchParams.get('module')

    if (!token || !testToken) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Verify the test token
    const assignment = await prisma.assignment.findUnique({
      where: { tokenHash: testToken },
      include: {
        student: true,
        mock: {
          include: {
            modules: {
              include: {
                questions: {
                  include: {
                    questionBank: true
                  },
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Invalid test token' }, { status: 404 })
    }

    // Check if assignment is still valid
    const now = new Date()
    if (now < assignment.validFrom || now > assignment.validUntil) {
      return NextResponse.json({ error: 'Test token has expired' }, { status: 403 })
    }

    // Find the specific module
    const module = assignment.mock.modules.find(m => m.type === moduleType?.toUpperCase())
    
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    // Transform questions for the frontend
    const questions = module.questions.map(q => {
      const content = q.questionBank.contentJson as any
      
      return {
        id: q.id,
        type: q.questionBank.type,
        content: content.content || '',
        options: content.options || [],
        fibData: content.fibData || null,
        instructions: content.instructions || '',
        points: q.points,
        correctAnswer: q.correctAnswerJson
      }
    })

    return NextResponse.json({
      module: {
        id: module.id,
        type: module.type,
        duration: module.durationMinutes,
        audioUrl: module.audioUrl,
        instructions: module.instructions
      },
      questions,
      assignment: {
        id: assignment.id,
        candidateNumber: assignment.candidateNumber,
        studentName: assignment.student?.name || 'Student',
        mockTitle: assignment.mock.title
      }
    })

  } catch (error) {
    console.error('Error fetching test data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
