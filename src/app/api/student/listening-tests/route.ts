import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('student-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    if (decoded.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      )
    }

    // Get mock tests that have listening modules
    const mockTests = await prisma.mock.findMany({
      where: {
        modules: {
          some: {
            type: 'LISTENING'
          }
        }
      },
      include: {
        modules: {
          where: {
            type: 'LISTENING'
          },
          select: {
            type: true,
            durationMinutes: true
          }
        },
        assignments: {
          where: {
            studentId: decoded.userId
          },
          include: {
            result: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data for the frontend
    const formattedMockTests = mockTests.map(mock => {
      // Get listening module duration
      const listeningModule = mock.modules.find(module => module.type === 'LISTENING')
      const duration = listeningModule?.durationMinutes || 0
      
      // Check if student has assignment for this test
      const assignment = mock.assignments[0]
      let status = 'AVAILABLE'
      let completionInfo = undefined

      if (assignment) {
        status = assignment.status
        if (assignment.result) {
          status = 'COMPLETED'
          completionInfo = {
            completedAt: assignment.result.generatedAt.toISOString(),
            autoScore: assignment.result.listeningBand || assignment.result.overallBand
          }
        }
      }

      return {
        id: mock.id,
        title: mock.title,
        description: mock.description || 'Practice your IELTS listening skills',
        duration: duration,
        status: status,
        createdAt: mock.createdAt.toISOString(),
        completionInfo: completionInfo
      }
    })

    return NextResponse.json({
      mockTests: formattedMockTests
    })
  } catch (error) {
    console.error('Listening tests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
