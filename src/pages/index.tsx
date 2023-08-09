import Pusher from 'pusher-js';
import { useEffect, useState, KeyboardEvent } from 'react';

async function pushMsg(msg: Message) {

  const res = await fetch('/api/push', {
    method: 'POST',
    body: JSON.stringify(msg)
  })

  console.log("push msg result:", res)
}

export default function Home() {
  const [username, setUsername] = useState('Anonymous')

  return (
    <>
      <div className='container min-h-screen flex justify-center'>
        <div className='mt-48'>
          name: <input placeholder='Input you name' onChange={e => setUsername(e.target.value)} />
        </div>
        <div className='max-w-2xl grow pt-64'>
          <Chat currUser={{ name: username }} />
        </div>
      </div>
    </>
  )
}

type ChatProps = {
  currUser: User
}

function Chat({ currUser }: ChatProps) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Array<Message>>([])
  const maxLen = 100
  const contentLenValid = input.length <= maxLen
  const contentLenColor = contentLenValid ? "text-gray-700" : "text-red-500"

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
      console.log("data:", data)
      renderMsg(data)
    });

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
    setTimeout(() => {
      const msgScrollElement = document?.getElementById('msgScroll')
      msgScrollElement?.scrollTo(0, msgScrollElement?.scrollHeight)
    }, 0)
  }

  function sendMsg(msg: Message) {
    // self msg
    // renderMsg(msg)
    // todo handle sent by self msg
    cleanInput()
    pushMsg(msg)
  }

  function onKeyDownMessaging(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) {
      // handle chinese keyboard composing
      return
    }
    if (e.code != 'Enter' || input.length == 0 || input.trim().length == 0) {
      return
    }
    if (!contentLenValid) {
      return
    }
    console.log("send input:", input)
    sendMsg({ createdAt: new Date(), content: input, sender: currUser.name })
  }

  return (
    <div className='flex-col grow bg-black rounded-md'>
      <header className='text-gray-500 font-bold text-center p-4'>
        ...
      </header>
      <main id="msgScroll" className='text-white h-96 overflow-y-scroll scrollbar-hide'>
        <ul>
          {history.map((item, i) => {
            return <MessageCard message={item} key={i} />
          })}
        </ul>
      </main>
      <div className='p-6 flex items-center text-xl'>
        <p className='mx-3 text-green-400 font-bold select-none'>{'>'}</p>
        <input className='text-white bg-transparent outline-none w-full'
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Say something...'
          autoComplete='off'
          onKeyDown={onKeyDownMessaging}
          autoFocus
        />
        <span className={`mx-2 ${contentLenColor} select-none shrink-0 `}>{input.length} / {maxLen}</span>
      </div>
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
      <div className='font-bold text-xl'>{message.sender}&nbsp;:&nbsp;</div>
      <div className="break-words min-w-0 text-xl">{message.content}</div>
      <div className="ml-auto text-gray-600 hover:underline hover:cursor-pointer">{formattedDate}</div>
    </li>
  )
}

// @ts-ignore
function formatDate(date, format, utc) {
  var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


  // @ts-ignore
  function ii(i, len) {
    var s = i + "";
    len = len || 2;
    while (s.length < len) s = "0" + s;
    return s;
  }

  var y = utc ? date.getUTCFullYear() : date.getFullYear();
  format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
  format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
  format = format.replace(/(^|[^\\])y/g, "$1" + y);

  var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
  format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
  // @ts-ignore
  format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
  format = format.replace(/(^|[^\\])M/g, "$1" + M);

  var d = utc ? date.getUTCDate() : date.getDate();
  format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
  format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
  // @ts-ignore
  format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
  format = format.replace(/(^|[^\\])d/g, "$1" + d);

  var H = utc ? date.getUTCHours() : date.getHours();
  // @ts-ignore
  format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
  format = format.replace(/(^|[^\\])H/g, "$1" + H);

  var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
  // @ts-ignore
  format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
  format = format.replace(/(^|[^\\])h/g, "$1" + h);

  var m = utc ? date.getUTCMinutes() : date.getMinutes();
  // @ts-ignore
  format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
  format = format.replace(/(^|[^\\])m/g, "$1" + m);

  var s = utc ? date.getUTCSeconds() : date.getSeconds();
  // @ts-ignore
  format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
  format = format.replace(/(^|[^\\])s/g, "$1" + s);

  var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
  format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
  f = Math.round(f / 10);
  // @ts-ignore
  format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
  f = Math.round(f / 10);
  format = format.replace(/(^|[^\\])f/g, "$1" + f);

  var T = H < 12 ? "AM" : "PM";
  format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
  format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

  var t = T.toLowerCase();
  format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
  format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

  var tz = -date.getTimezoneOffset();
  var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
  if (!utc) {
    tz = Math.abs(tz);
    var tzHrs = Math.floor(tz / 60);
    var tzMin = tz % 60;
    // @ts-ignore
    K += ii(tzHrs) + ":" + ii(tzMin);
  }
  format = format.replace(/(^|[^\\])K/g, "$1" + K);

  var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
  format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
  format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

  format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
  format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

  format = format.replace(/\\(.)/g, "$1");

  return format;
};
