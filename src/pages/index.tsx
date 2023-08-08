import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState('no data')
  useEffect(() => {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;
    var pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: 'us3'
    });
    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', (data: any) => {
      console.log("data:", data)
      setData(data.message)
    });

    return () => pusher.disconnect()
  }, [])

  return (
    <div> last received data: {data} </div>
  )
}
