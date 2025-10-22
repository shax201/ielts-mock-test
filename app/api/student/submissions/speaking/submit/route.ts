import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AssignmentStatus } from '@prisma/client'
import { calculateOverallBand } from '@/lib/scoring/band-calculator'

export async function POST(request: NextRequest) {
  try {
    const { token, answers, timeSpent } = await request.json()

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

    let submission
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          answersJson: answers,
          submittedAt: new Date()
        }
      })
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          moduleId: speakingModule.id,
          startedAt: new Date(),
          answersJson: answers,
          submittedAt: new Date()
        }
      })
    }

    // Mark assignment as completed after speaking submission
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: { status: AssignmentStatus.COMPLETED }
    })

    // Check if all modules are completed and create result
    const allSubmissions = await prisma.submission.findMany({
      where: { assignmentId: assignment.id },
      include: { 
        module: true,
        instructorMarks: true
      }
    })

    const listeningSubmission = allSubmissions.find(s => s.module.type === 'LISTENING')
    const readingSubmission = allSubmissions.find(s => s.module.type === 'READING')
    const writingSubmission = allSubmissions.find(s => s.module.type === 'WRITING')
    const speakingSubmission = allSubmissions.find(s => s.module.type === 'SPEAKING')

    // Create result immediately with available scores
    const listeningBand = listeningSubmission?.autoScore || 0
    const readingBand = readingSubmission?.autoScore || 0
    const writingBand = writingSubmission?.instructorMarks?.[0]?.overallBand || 0
    const speakingBand = 0 // Will be updated when instructor marks are added

    const overallBand = calculateOverallBand({
      listening: listeningBand,
      reading: readingBand,
      writing: writingBand,
      speaking: speakingBand
    })

    // Create or update result immediately
    await prisma.result.upsert({
      where: { assignmentId: assignment.id },
      update: {
        listeningBand,
        readingBand,
        writingBand,
        speakingBand,
        overallBand
      },
      create: {
        assignmentId: assignment.id,
        listeningBand,
        readingBand,
        writingBand,
        speakingBand,
        overallBand
      }
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id
    })
  } catch (error) {
    console.error('Speaking submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
