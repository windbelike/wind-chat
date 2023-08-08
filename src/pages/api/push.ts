import type { NextApiRequest, NextApiResponse } from 'next'
import Pusher from 'pusher'

type Data = {
  name: string
}

const pusher = new Pusher({
  appId: "1648592",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "us3",
  useTLS: true
});

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("body:", req.body)
  res.status(200).json({ name: 'John Doe' })

  pusher.trigger("my-channel", "my-event", {
    message: "hello world"
  });
}
