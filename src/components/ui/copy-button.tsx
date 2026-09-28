'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6', className)}
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
