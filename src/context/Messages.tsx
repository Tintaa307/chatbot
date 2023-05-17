import { createContext, useState } from "react"
import { nanoid } from "nanoid"
import { Message } from "@/lib/validators/message"
import { MessagesContextProps } from "@/types"

const defaultValue = [
  {
    id: nanoid(),
    text: "Hello, how can I help you?",
    isUserMessage: false,
  },
]

export const MessagesContext = createContext<MessagesContextProps>({
  messages: [],
  isMessageUpdating: false,
  addMessage: () => {},
  removeMessage: () => {},
  updateMessage: () => {},
  setIsMessageUpdating: () => {},
})

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState(defaultValue)
  const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false)

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id))
  }

  const updateMessage = (
    id: string,
    updateFn: (prevText: string) => string
  ) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === id) {
          return { ...message, text: updateFn(message.text) }
        }
        return message
      })
    )
  }

  return (
    <MessagesContext.Provider
      value={{
        messages,
        isMessageUpdating,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
