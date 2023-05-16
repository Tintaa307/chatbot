import { FC } from "react"

interface ChatHeaderProps {}

const ChatHeader: FC<ChatHeaderProps> = ({}) => {
  return (
    <div className="w-full flex gap-3 justify-start items-center text-zinc-800">
      <div className="flex flex-col items-start text-sm">
        <small className="text-xs text-black font-normal">Chat with</small>
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <h4 className="font-medium">Pillwise Support</h4>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
