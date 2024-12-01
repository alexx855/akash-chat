'use client';

import { ChatConversation } from '@/components/Chat/ChatConversation';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { LatestExportFormat, SupportedExportFormats } from '@/types/export';
import { Folder, FolderType } from '@/types/folder';
import { LLM, LLMID, LLMS } from '@/types/llms';
import { Prompt } from '@/types/prompt';
import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { exportData, importData } from '@/utils/app/importExport';
import { savePrompts } from '@/utils/app/prompts';
import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Chat({ defaultModelId, models }: { defaultModelId: LLMID, models: LLM[] }) {
  const defaultConversationModel = {
    id: LLMS[defaultModelId].id,
    name: LLMS[defaultModelId].name,
    maxLength: LLMS[defaultModelId].maxLength,
    tokenLimit: LLMS[defaultModelId].tokenLimit,
  }
  const baseConversation: Conversation = {
    id: uuidv4(),
    name: `New Conversation`,
    messages: [],
    model: defaultConversationModel,
    prompt: DEFAULT_SYSTEM_PROMPT,
    folderId: null,
  };

  const [lightMode, setLightMode] = useState<'dark' | 'light'>('light');

  const [folders, setFolders] = useState<Folder[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();

  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [showPromptbar, setShowPromptbar] = useState<boolean>(true);


  const handleLightMode = (mode: 'dark' | 'light') => {
    setLightMode(mode);
    localStorage.setItem('theme', mode);
  };


  const handleToggleChatbar = () => {
    setShowSidebar(!showSidebar);
    localStorage.setItem('showChatbar', JSON.stringify(!showSidebar));
  };

  const handleTogglePromptbar = () => {
    setShowPromptbar(!showPromptbar);
    localStorage.setItem('showPromptbar', JSON.stringify(!showPromptbar));
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders, prompts }: LatestExportFormat = importData(data);

    setConversations(history);
    setSelectedConversation(history[history.length - 1]);
    setFolders(folders);
    setPrompts(prompts);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    console.info('Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    saveConversation(conversation);
    // setMessages(conversation.messages);
  };

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    console.info('Creating folder:', name, type);
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    setFolders(updatedFolders);
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });
    setPrompts(updatedPrompts);
    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = (name?: string) => {
    console.info('Creating new conversation:', name);
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      ...baseConversation,
      name: name || baseConversation.name,
      model: lastConversation?.model || defaultConversationModel,
    };

    const updatedConversations = [...conversations, newConversation];

    setSelectedConversation(newConversation);
    setConversations(updatedConversations);

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    setSelectedConversation(newConversation);
    console.log('newConversation', newConversation);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    console.info('Deleting conversation:', conversation);
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id,
    );
    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    // setMessages([]);

    if (updatedConversations.length > 0) {
      setSelectedConversation(
        updatedConversations[updatedConversations.length - 1],
      );
      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      setSelectedConversation(baseConversation);
      localStorage.removeItem('selectedConversation');
    }
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    console.info('Updating conversation:', conversation, data);
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    // setMessages(updatedConversation.messages);

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    setSelectedConversation(single);
    setConversations(all);
  };

  const handleClearConversations = () => {
    console.info('Clearing conversations');
    setConversations([]);
    // setMessages([]);
    localStorage.removeItem('conversationHistory');

    setSelectedConversation(baseConversation);
    localStorage.removeItem('selectedConversation');

    const updatedFolders = folders.filter((f) => f.type !== 'chat');
    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      setShowSidebar(false);
    }
  }, [selectedConversation]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      setLightMode(theme as 'dark' | 'light');
    }

    // fetchModels();

    if (window.innerWidth < 640) {
      setShowSidebar(false);
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      setShowSidebar(showChatbar === 'true');
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      setShowPromptbar(showPromptbar === 'true');
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      setFolders(JSON.parse(folders));
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      setPrompts(JSON.parse(prompts));
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );
      setConversations(cleanedConversationHistory);
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );
      setSelectedConversation(cleanedSelectedConversation);
    }
  }, []);

  return (
    <main
      className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
    >
      <div className="fixed top-0 w-full bg-[#242424] sm:hidden">
        <Navbar
          selectedConversation={selectedConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      <div className="flex h-full w-full pt-[48px] sm:pt-0">
        {showSidebar ? (
          <div>
            <Chatbar
              // loading={isLoading}
              conversations={conversations}
              lightMode={lightMode}
              selectedConversation={selectedConversation}
              folders={folders.filter((folder) => folder.type === 'chat')}
              onToggleLightMode={handleLightMode}
              onCreateFolder={(name) => handleCreateFolder(name, 'chat')}
              onDeleteFolder={handleDeleteFolder}
              onUpdateFolder={handleUpdateFolder}
              onNewConversation={handleNewConversation}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onUpdateConversation={handleUpdateConversation}
              onClearConversations={handleClearConversations}
              onExportConversations={handleExportData}
              onImportConversations={handleImportConversations}
            />

            <button
              className="fixed top-5 left-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
              onClick={handleToggleChatbar}
            >
              <IconArrowBarLeft />
            </button>
            <div
              onClick={handleToggleChatbar}
              className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
            ></div>
          </div>
        ) : (
          <button
            className="fixed top-2.5 left-4 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-4 sm:h-8 sm:w-8 sm:text-neutral-700"
            onClick={handleToggleChatbar}
          >
            <IconArrowBarRight />
          </button>
        )}
        <div className="flex flex-1">
          <ChatConversation
            conversation={selectedConversation}
            defaultModelId={defaultModelId}
            models={models}
            prompts={prompts}
            onUpdateConversation={handleUpdateConversation}
            onNewConversation={handleNewConversation}
          />
        </div>
      </div>
    </main>
  );
};

