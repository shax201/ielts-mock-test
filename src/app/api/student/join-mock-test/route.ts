import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
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

    const { mockId } = await request.json()

    if (!mockId) {
      return NextResponse.json(
        { error: 'Mock test ID is required' },
        { status: 400 }
      )
    }

    // Check if mock test exists
    const mock = await prisma.mock.findUnique({
      where: { id: mockId },
      include: {
        modules: true
      }
    })

    if (!mock) {
      return NextResponse.json(
        { error: 'Mock test not found' },
        { status: 404 }
      )
    }

    // Check if student already has an assignment for this mock test
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        studentId: decoded.userId,
        mockId: mockId
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'You have already joined this test' },
        { status: 400 }
      )
    }

    // Generate a unique token for this assignment
    const tokenHash = randomBytes(32).toString('hex')
    
    // Set validity period (e.g., 7 days from now)
    const validFrom = new Date()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 7)

    // Generate candidate number
    const candidateNumber = `C${Date.now().toString().slice(-6)}`

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        mockId: mockId,
        studentId: decoded.userId,
        candidateNumber: candidateNumber,
        tokenHash: tokenHash,
        validFrom: validFrom,
        validUntil: validUntil,
        status: 'ACTIVE'
      },
      include: {
        mock: true
      }
    })

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        tokenHash: assignment.tokenHash,
        candidateNumber: assignment.candidateNumber,
        validUntil: assignment.validUntil.toISOString()
      }
    })
  } catch (error) {
    console.error('Join mock test error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
