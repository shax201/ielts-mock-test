import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { type, value } = await request.json()

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Type and value are required' },
        { status: 400 }
      )
    }

    let assignment

    if (type === 'token') {
      // Find by token hash
      assignment = await prisma.assignment.findUnique({
        where: { tokenHash: value },
        include: {
          result: {
            include: {
              pdfReport: true
            }
          },
          mock: true,
          student: true
        }
      })
    } else if (type === 'candidate') {
      // Find by candidate number
      assignment = await prisma.assignment.findFirst({
        where: { candidateNumber: value },
        include: {
          result: {
            include: {
              pdfReport: true
            }
          },
          mock: true,
          student: true
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid search type' },
        { status: 400 }
      )
    }

    if (!assignment) {
      return NextResponse.json(
        { error: 'No results found' },
        { status: 404 }
      )
    }

    if (!assignment.result) {
      return NextResponse.json(
        { error: 'Results are not yet available. Please check back in 2-3 business days.' },
        { status: 202 }
      )
    }

    // Get writing feedback
    const writingFeedback = await prisma.writingFeedback.findMany({
      where: {
        submission: {
          assignmentId: assignment.id,
          module: {
            type: 'WRITING'
          }
        }
      },
      include: {
        instructor: {
          select: { email: true }
        }
      }
    })

    const results = {
      candidateNumber: assignment.candidateNumber,
      testTitle: assignment.mock.title,
      bands: {
        listening: assignment.result.listeningBand,
        reading: assignment.result.readingBand,
        writing: assignment.result.writingBand,
        speaking: assignment.result.speakingBand,
        overall: assignment.result.overallBand
      },
      feedback: {
        writing: writingFeedback.map(fb => ({
          text: fb.comment,
          comment: `Instructor feedback: ${fb.comment}`,
          range: [fb.textRangeStart, fb.textRangeEnd]
        }))
      },
      generatedAt: assignment.result.generatedAt.toISOString()
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
