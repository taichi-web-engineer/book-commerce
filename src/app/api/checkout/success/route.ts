import prisma from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request, response: Response) {
  const { sessionId } = await request.json()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.client_reference_id!,
        bookId: session.metadata?.bookId!,
      },
    })

    if (!existingPurchase) {
      const purchase = await prisma.purchase.create({
        data: {
          userId: session.client_reference_id!,
          bookId: session.metadata?.bookId!,
        },
      })
      return NextResponse.json({ purchase })
    } else {
      return NextResponse.json({ message: 'すでに購入済です。' })
    }
  } catch (error) {
    return NextResponse.json(error)
  }
}
