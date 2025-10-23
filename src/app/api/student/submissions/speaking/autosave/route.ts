import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token, answers, currentPart } = await request.json()

    if (!token || !answers) {
      return NextResponse.json(
        { error: 'Token and answers are required' },
        { status: 400 }
      )
    }

    // Find assignment
    const assignment = await prisma.assignment.findUnique({
      where: { tokenHash: token },
      include: {
        mock: {
          include: {
            modules: {
              where: { type: 'SPEAKING' }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      )
    }

    const speakingModule = assignment.mock.modules[0]
    if (!speakingModule) {
      return NextResponse.json(
        { error: 'Speaking module not found' },
        { status: 404 }
      )
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignment.id,
        moduleId: speakingModule.id
      }
    })

    if (existingSubmission) {
      // Update existing submission
      await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          answersJson: answers
        }
      })
    } else {
      // Create new submission
      await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          moduleId: speakingModule.id,
          startedAt: new Date(),
          answersJson: answers
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Auto-saved successfully'
    })
  } catch (error) {
    console.error('Speaking auto-save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
