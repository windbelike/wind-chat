import { formatDate } from '@/utils/time-utils';
import Pusher from 'pusher-js';
import { useEffect, useState, KeyboardEvent, FormEvent, useRef } from 'react';

async function pushMsg(msg: Message) {

  const res = await fetch('/api/push', {
    method: 'POST',
    body: JSON.stringify(msg)
  })

  console.log("push msg result:", res)
}

export default function Home() {

  return (
    <>
      <div className='min-h-screen'>
        <div className='container mx-auto'>
          <Chat />
        </div>
      </div>
    </>
  )
}

function Chat() {
  const defaultName = "Anonymous"
  const [username, setUsername] = useState(defaultName)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Array<Message>>([])
  const [channelStatus, setChannelStatus] = useState()
  const isChannelValid = channelStatus == "connected"
  const hintColor = isChannelValid ? "bg-green-500" : "bg-gray-500"
  const maxLen = 180
  const contentLenValid = input.length <= maxLen
  const contentLenColor = contentLenValid ? "text-gray-700" : "text-red-500"
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // init pusher websocket
  useEffect(() => {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;
    var pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
    });
    var channel = pusher.subscribe('my-channel');
    channel.bind('chat', (data: any) => {
      data.createdAt = new Date(data.createdAt)
      // console.log("data:", data)
      renderMsg(data)
    });
    pusher.connection.bind("state_change", (state: any) => {
      setChannelStatus(state.current)
    })
    return () => pusher.disconnect()
  }, [])

  function cleanInput() {
    setInput('')
  }

  function renderMsg(msg: Message) {
    setHistory(old => {
      return [...old, msg]
    })
    scrollToButton()
  }

  function scrollToButton() {
    // wait for next tick
    if (messagesEndRef.current != null) {
      setTimeout(() => messagesEndRef.current!.scrollIntoView(), 0)
    }
  }

  function sendMsg(msg: Message) {
    // self msg
    // renderMsg(msg)
    // todo handle sent by self msg
    cleanInput()
    pushMsg(msg)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (input == null || input.trim() == '') {
      return
    }
    console.log("send input:", input)
    let sender = username
    if (!contentLenValid) {
      return
    }
    if (username == null || username.trim() == '') {
      sender = defaultName
    }
    sendMsg({ createdAt: new Date(), content: input, sender })
  }


  return (
    <div className='flex flex-col grow bg-black rounded-md h-screen'>
      <header className='flex items-center text-gray-500 text-start p-4'>
        <input
          type='text'
          className='bg-transparent outline-none text-green-500 text-xl'
          maxLength={12}
          placeholder={defaultName} onChange={e => setUsername(e.target.value)} />
        <div className={`${hintColor} rounded-full w-3 h-3 ml-auto`}></div>
      </header>
      <ul id="msgScroll" className="overflow-y-auto scrollbar-hide">
        {history.map((item, i) => {
          return <MessageCard message={item} key={i} />
        })}
        <div ref={messagesEndRef} style={{ height: 0 }} />
      </ul>
      <form onSubmit={handleSubmit} className='mt-auto p-4 flex items-center text-xl'>
        <p className='mx-3 text-green-400 font-bold select-none'>{'>'}</p>
        <input className='text-white bg-transparent outline-none w-full'
          type='text'
          value={input}
          disabled={!isChannelValid}
          onChange={e => setInput(e.target.value)}
          placeholder={isChannelValid ? 'Leave a tone' : 'Loading...'}
          autoComplete='off'
          autoFocus
        />
        <span className={`mx-2 ${contentLenColor} select-none shrink-0 `}>{input.length} / {maxLen}</span>
      </form>
    </div>
  )
}

type User = {
  name: string
}

type Message = {
  sender: string
  content: string
  createdAt: Date
}

type MessageCardProps = {
  user?: User
  message: Message
} & React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>

function MessageCard({ user, message, ...props }: MessageCardProps) {
  const formattedDate = formatDate(message.createdAt, "h:mm:ss tt", null)
  return (
    <li className="flex items-start justify-start px-4" {...props}>
      <div className='text-white text-xl'>{message.sender}&nbsp;:&nbsp;</div>
      <div className="text-white break-words min-w-0 text-xl">{message.content}</div>
      <div className="ml-auto shrink-0 text-gray-600 hover:underline hover:cursor-pointer">{formattedDate}</div>
    </li>
  )
}

