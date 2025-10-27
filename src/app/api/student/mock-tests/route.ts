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

    // Get student's assigned mock tests
    const assignments = await prisma.assignment.findMany({
      where: {
        studentId: decoded.userId
      },
      include: {
        mock: {
          include: {
            modules: {
              select: {
                type: true,
                durationMinutes: true
              }
            }
          }
        },
        result: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data for the frontend
    const formattedMockTests = assignments.map(assignment => {
      // Calculate total duration from all modules
      const totalDuration = assignment.mock.modules.reduce((sum, module) => sum + module.durationMinutes, 0)
      
      // Determine status based on assignment status and result
      let status = assignment.status
      if (assignment.result) {
        status = 'COMPLETED'
      }

      return {
        id: assignment.mock.id,
        title: assignment.mock.title,
        description: assignment.mock.description || 'Assigned mock test',
        duration: totalDuration, // in minutes
        status: status,
        createdAt: assignment.createdAt.toISOString(),
        completionInfo: assignment.result ? {
          completedAt: assignment.result.generatedAt.toISOString(),
          autoScore: assignment.result.overallBand
        } : undefined,
        modules: assignment.mock.modules.map(module => ({
          type: module.type,
          duration: module.durationMinutes
        }))
      }
    })

    return NextResponse.json({
      mockTests: formattedMockTests
    })
  } catch (error) {
    console.error('Mock tests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
