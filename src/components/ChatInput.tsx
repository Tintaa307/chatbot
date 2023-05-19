"use client"

import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { FC, HTMLAttributes, useContext, useRef, useState } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { nanoid } from "nanoid"
import { Message } from "@/lib/validators/message"
import { MessagesContext } from "@/context/Messages"
import { CornerDownLeft, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {}

const ChatInput: FC<ChatInputProps> = ({ className, ...props }) => {
  const [input, setInput] = useState("")
  const {
    messages,
    addMessage,
    removeMessage,
    updateMessage,
    setIsMessageUpdating,
  } = useContext(MessagesContext)

  const textareaRef = useRef<null | HTMLTextAreaElement>(null)

  const { mutate: sendMessage, isLoading } = useMutation({
    mutationFn: async (message: Message) => {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [message] }),
      })

      if (!response.ok) throw new Error()

      return response.body
    },
    onMutate: (message) => {
      addMessage(message)
    },
    onSuccess: async (stream) => {
      if (!stream) throw new Error("No stream found")

      const id = nanoid()
      const responseMessage: Message = {
        id,
        isUserMessage: false,
        text: "",
      }

      addMessage(responseMessage)

      setIsMessageUpdating(true)

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        updateMessage(id, (prev) => prev + chunkValue)
      }

      setIsMessageUpdating(false)
      setInput("")

      setTimeout(() => {
        textareaRef.current?.focus()
      }, 10)
    },
    onError: (_, message) => {
      toast.error("Something went wrong. Please try again.")
      removeMessage(message.id)
      textareaRef.current?.focus()
    },
  })

  return (
    <div {...props} className={cn("border-t border-zinc-300", className)}>
      <div className="relative mt-4 flex-1 overflow-hidden rounded-lg border-none outline-none">
        <TextareaAutosize
          ref={textareaRef}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              const message: Message = {
                id: nanoid(),
                isUserMessage: true,
                text: input,
              }

              sendMessage(message)
            }
          }}
          maxRows={4}
          disabled={isLoading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          placeholder="Write a message..."
          className="peer disable:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-200 py-1 text-gray-900 focus:ring-0 text-sm sm:leading-6"
        />
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <kbd className="inline-flex items-center rouded border bg-white border-gray-200 px-1 font-sans text-xs text-gray-400">
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3 h-3" />
            )}
          </kbd>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 border-t border-gray-300 peer-focus:border-t-2 peer-focus:border-indigo-600"
        />
      </div>
    </div>
  )
}

export default ChatInput
