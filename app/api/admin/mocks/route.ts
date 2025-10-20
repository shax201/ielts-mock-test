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
    const mock = await prisma.mock.create({
      data: {
        title,
        description: description || '',
        createdBy: payload.userId,
        modules: {
          create: modules.map((module: any, index: number) => ({
            type: module.type as ModuleType,
            durationMinutes: module.duration || 60,
            audioUrl: module.audioUrl || null,
            instructions: module.instructions || '',
            order: index + 1,
            questions: {
              create: module.questions?.map((question: any, qIndex: number) => ({
                questionBankId: 'temp', // This would be created in question bank first
                order: qIndex + 1,
                points: question.points || 1,
                correctAnswerJson: question.correctAnswer
              })) || []
            }
          }))
        }
      },
      include: {
        modules: {
          include: {
            questions: true
          }
        }
      }
    })

    return NextResponse.json({ mock }, { status: 201 })
  } catch (error) {
    console.error('Error creating mock:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
