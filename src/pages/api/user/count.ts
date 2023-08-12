import { pusher } from "@/utils/pusher-conn";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {

  try {

    // const result = await pusher.get({ path: "/channels/my-channel/users" });
    const result = await pusher.get({ path: "/channels/my-channel" });
    if (result.status === 200) {
      const body = await result.json();
      const users = body.users;
      console.log("user:", users)
    }
    res.status(200).json({ code: 0, data: { count: result } })
  } catch (err) {
    console.log(err)
  }
  res.json("not good")
}
