import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface TooltipWrapperProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  showIcon?: boolean;
  iconClassName?: string;
}

export default function TooltipWrapper({
  children,
  content,
  side = 'top',
  showIcon = true,
  iconClassName = 'h-5 w-5',
}: TooltipWrapperProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {children}
            {showIcon && (
              <HelpCircle className={`${iconClassName} text-gray-400 hover:text-gray-600 cursor-help transition-colors`} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs text-right dir-rtl bg-gray-900 text-white border-gray-700">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
