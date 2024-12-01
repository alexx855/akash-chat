"use client";

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { LLM, LLMID, LLMS } from '@/types/llms';
import { Prompt } from '@/types/prompt';
import { IconArrowDown, IconClearAll, IconSettings } from '@tabler/icons-react';
import {
  FC,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ChatMessage } from './ChatMessage';
import { ModelSelect } from './ModelSelect';
import { AkashChatLogo } from '../Logos/akash-chat-logo';
import { CreateMessage, Message } from 'ai';
import { useChat } from 'ai/react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  conversation: Conversation | undefined;
  models: LLM[];
  defaultModelId: LLMID;
  prompts: Prompt[];
  onUpdateConversation: (
    conversation: Conversation,
    data: KeyValuePair,
  ) => void;
  onNewConversation: (name?: string) => void;
}

export const ChatConversation: FC<Props> = memo(
  ({
    conversation,
    models,
    defaultModelId,
    prompts,
    onUpdateConversation,
    onNewConversation,
  }) => {
    const {
      messages,
      isLoading,
      append,
      error,
      stop,
      setMessages,
      reload
    } =
      useChat({
        maxSteps: 2,
        initialMessages: conversation?.messages,
        onError: (error) => {
          toast.error(error.message || 'An error occurred');
        },
      })

    useEffect(() => {
      if (!error) {
        return;
      }
      toast.error(error?.message || 'An error occurred');
    }, [error])

    const onEditMessage = (message: Message, index: number) => {
      const newMessages = [...messages];
      newMessages[index] = message;
      setMessages(newMessages);
      reload();
    }

    const onSend = async (message: CreateMessage) => {
      {
        const userMessage: Message = {
          id: uuidv4(),
          content: message.content,
          role: message.role,
        };

        await append(userMessage);

        // TODO: fix save and load conversation from local storage
        // if (!conversation) {
        //   const name = userMessage.content.length > 20 ? `${userMessage.content.substring(0, 20)}...` : userMessage.content;
        //   onNewConversation(name)
        // }
      }
    }

    const [model] = useState<LLM>(conversation?.model || LLMS[defaultModelId]);

    const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showScrollDownButton, setShowScrollDownButton] =
      useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContainerRef.current;
        const bottomTolerance = 30;

        if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
          setAutoScrollEnabled(false);
          setShowScrollDownButton(true);
        } else {
          setAutoScrollEnabled(true);
          setShowScrollDownButton(false);
        }
      }
    };

    const handleScrollDown = () => {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    };

    const handleSettings = () => {
      setShowSettings(!showSettings);
    };

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setAutoScrollEnabled(entry.isIntersecting);
          if (entry.isIntersecting) {
            textareaRef.current?.focus();
          }
        },
        {
          root: null,
          threshold: 0.5,
        },
      );
      const messagesEndElement = messagesEndRef.current;
      if (messagesEndElement) {
        observer.observe(messagesEndElement);
      }
      return () => {
        if (messagesEndElement) {
          observer.unobserve(messagesEndElement);
        }
      };
    }, [messagesEndRef]);

    return (
      <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#401c1c1c]">

        <div
          className="max-h-full overflow-x-hidden"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >

          <div className="flex items-center justify-center space-x-5 border-b border-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#333d3d3d] dark:text-neutral-200">
            <div className="md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
              <AkashChatLogo />
            </div>
          </div>
          <div className="flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#333d3d3d] dark:text-neutral-200">
            Model: {model.name}
            <button
              className="ml-2 cursor-pointer hover:opacity-50"
              onClick={handleSettings}
            >
              <IconSettings size={18} />
            </button>
            <button
              className="ml-2 cursor-pointer hover:opacity-50"
              onClick={() => {
                if (!conversation) {
                  throw new Error('No conversation to clear messages');
                }
                if (confirm('Are you sure you want to clear all messages?')) {
                  onUpdateConversation(conversation, { key: 'messages', value: [] });

                }
              }}
            >
              <IconClearAll size={18} />
            </button>
          </div>
          {showSettings && (
            <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
              <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                <ModelSelect
                  model={model}
                  models={models}
                  defaultModelId={defaultModelId}
                  onModelChange={(model) => {
                    if (!conversation || model.id === conversation.model.id) {
                      return;
                    }
                    onUpdateConversation(conversation, {
                      key: 'model',
                      value: model,
                    })
                  }

                  }
                />
              </div>
            </div>
          )}

          {messages && messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              messageIndex={index}
              onEditMessage={onEditMessage}
            />
          ))}

          <div
            className="h-[162px] bg-white dark:bg-[#401c1c1c]"
            ref={messagesEndRef}
          />
        </div>

        <ChatInput
          textareaRef={textareaRef}
          isLoading={isLoading}
          conversationIsEmpty={!messages || messages.length === 0}
          model={model}
          prompts={prompts}
          onStopConversation={stop}
          onSend={onSend}
          onRegenerate={reload}
        />
        {showScrollDownButton && (
          <div className="absolute bottom-0 right-0 mb-4 mr-4 pb-20">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
              onClick={handleScrollDown}
            >
              <IconArrowDown size={18} />
            </button>
          </div>
        )}
      </div>
    );
  },
);
ChatConversation.displayName = 'ChatConversation';
