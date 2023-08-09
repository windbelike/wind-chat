import type { NextApiRequest, NextApiResponse } from 'next'
import Pusher from 'pusher'

type Data = {
  code: number
  message?: string
  data?: any
}

type Message = {
  createdAt: string
  content: string
  sender: string
}

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method != "POST") {
    res.status(400).json({ code: 400, message: "invalid method" })
    return
  }

  const msg: Message = JSON.parse(req.body)
  await pusher.trigger("my-channel", "chat", msg) 

  res.status(200).json({ code: 0, data: msg})
}
