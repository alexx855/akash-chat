import { IconRepeat } from '@tabler/icons-react';
import { FC } from 'react';

interface Props {
  onRegenerate: () => void;
}

export const Regenerate: FC<Props> = ({ onRegenerate }) => {

  return (
    <button
      className="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#1c1c1c] dark:text-white md:mb-0 md:mt-2"
      onClick={onRegenerate}
    >
      <IconRepeat size={16} /> Regenerate response
    </button>
  );
};
