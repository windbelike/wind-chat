import { pusher } from '@/utils/pusher-conn'
import type { NextApiRequest, NextApiResponse } from 'next'

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

  res.status(200).json({ code: 0, data: msg })
}
