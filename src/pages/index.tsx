import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState('no data')
  useEffect(() => {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;
    var pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
    });
    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', (data: any) => {
      console.log("data:", data)
      setData(data.message)
    });

    return () => pusher.disconnect()
  }, [])

  return (
    <>
      <div className='container min-h-screen flex justify-center'>
        <div> last received data: {data} </div>
        <div className='flex justify-center items-center w-full'>
          <Chat />
        </div>
      </div>
    </>
  )
}

function Chat() {
  return (
    <div className='w-5/6 flex-col bg-black rounded-md'>
      <header className='text-white'>
        chat header
      </header>
      <main className='text-white h-96'>
        haha
      </main>
      <div className='p-6 flex text-xl'>
        <p className='mx-3 text-green-400 font-bold'>{'>'}</p>
        <input className='text-white bg-transparent outline-none w-full'
        placeholder='Say something...'
        autoComplete='off'
        maxLength={100} />
      </div>
    </div>
  )
}
