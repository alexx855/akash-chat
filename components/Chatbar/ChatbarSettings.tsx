import { SupportedExportFormats } from '@/types/export';
import { IconFileExport, IconMoon, IconSun } from '@tabler/icons-react';

import { FC } from 'react';
import { Import } from '../Settings/Import';
import { SidebarButton } from '../Sidebar/SidebarButton';
import { ClearConversations } from './ClearConversations';

interface Props {
  lightMode: 'light' | 'dark';
  conversationsCount: number;
  onToggleLightMode: (mode: 'light' | 'dark') => void;
  onClearConversations: () => void;
  onExportConversations: () => void;
  onImportConversations: (data: SupportedExportFormats) => void;
}

export const ChatbarSettings: FC<Props> = ({
  lightMode,
  conversationsCount,
  onToggleLightMode,
  onClearConversations,
  onExportConversations,
  onImportConversations,
}) => {

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      {conversationsCount > 0 ? (
        <ClearConversations onClearConversations={onClearConversations} />
      ) : null}

      <Import onImport={onImportConversations} />

      <SidebarButton
        text='Export data'
        icon={<IconFileExport size={18} />}
        onClick={() => onExportConversations()}
      />

      <SidebarButton
        text={lightMode === 'light' ? 'Dark mode' : 'Light mode'}
        icon={
          lightMode === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />
        }
        onClick={() =>
          onToggleLightMode(lightMode === 'light' ? 'dark' : 'light')
        }
      />
    </div>
  );
};
