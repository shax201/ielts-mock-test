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

    // Get all mock tests that are available for students to join
    // For now, we'll return all mock tests as "public" since there's no public/private flag
    const mockTests = await prisma.mock.findMany({
      include: {
        modules: {
          select: {
            type: true,
            durationMinutes: true
          }
        },
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data for the frontend
    const formattedMockTests = mockTests.map(mock => {
      // Calculate total duration from all modules
      const totalDuration = mock.modules.reduce((sum, module) => sum + module.durationMinutes, 0)
      
      // Check if student has already been assigned this test
      const hasAssignment = mock._count.assignments > 0

      return {
        id: mock.id,
        title: mock.title,
        description: mock.description || 'Practice your IELTS skills with this comprehensive mock test',
        duration: totalDuration, // in minutes
        status: hasAssignment ? 'IN_PROGRESS' : 'AVAILABLE',
        createdAt: mock.createdAt.toISOString(),
        modules: mock.modules.map(module => ({
          type: module.type,
          duration: module.durationMinutes
        }))
      }
    })

    return NextResponse.json({
      mockTests: formattedMockTests
    })
  } catch (error) {
    console.error('Public mock tests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
