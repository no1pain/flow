'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Rocket, Code, Design, Marketing, Check } from 'lucide-react';
import { createProject } from '../actions';
import { cn } from '@/lib/utils';

interface CreateProjectDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

const projectTemplates = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with a clean slate',
    icon: Plus,
    defaultName: 'My Project',
    defaultDescription: '',
  },
  {
    id: 'startup',
    name: 'Startup MVP',
    description: 'Perfect for building minimum viable products',
    icon: Rocket,
    defaultName: 'Startup MVP',
    defaultDescription: 'Build and iterate on your minimum viable product',
  },
  {
    id: 'development',
    name: 'Software Development',
    description: 'Organize your development workflow',
    icon: Code,
    defaultName: 'Software Project',
    defaultDescription: 'Track development tasks, bugs, and features',
  },
  {
    id: 'design',
    name: 'Design Project',
    description: 'Manage design workflows and revisions',
    icon: Design,
    defaultName: 'Design Project',
    defaultDescription: 'Coordinate design tasks and creative work',
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns',
    icon: Marketing,
    defaultName: 'Marketing Campaign',
    defaultDescription: 'Organize marketing activities and campaigns',
  },
];

export function CreateProjectDialog({ workspaceId, trigger }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(projectTemplates[0]);
  const [showTemplates, setShowTemplates] = useState(true);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    try {
      await createProject({
        workspace_id: workspaceId,
        name,
        description: description || null,
        status: 'ACTIVE',
      });
      setName('');
      setDescription('');
      setSelectedTemplate(projectTemplates[0]);
      setShowTemplates(true);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleTemplateSelect = (template: (typeof projectTemplates)[0]) => {
    setSelectedTemplate(template);
    setName(template.defaultName);
    setDescription(template.defaultDescription);
    setShowTemplates(false);
  };

  const handleBackToTemplates = () => {
    setShowTemplates(true);
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {trigger || (
          <>
            <Plus className="size-4 mr-2" />
            New Project
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            {showTemplates
              ? 'Choose a template to get started quickly'
              : 'Customize your project details'}
          </DialogDescription>
        </DialogHeader>

        {showTemplates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {projectTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:ring-2 hover:ring-ring/50 transition-all"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {template.id === 'blank' && <Plus className="size-5 text-primary" />}
                      {template.id === 'startup' && <Rocket className="size-5 text-primary" />}
                      {template.id === 'development' && <Code className="size-5 text-primary" />}
                      {template.id === 'design' && <Design className="size-5 text-primary" />}
                      {template.id === 'marketing' && <Marketing className="size-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToTemplates}
                className="mb-2"
              >
                ← Back to templates
              </Button>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {selectedTemplate.id === 'blank' && <Plus className="size-5 text-primary" />}
                  {selectedTemplate.id === 'startup' && <Rocket className="size-5 text-primary" />}
                  {selectedTemplate.id === 'development' && (
                    <Code className="size-5 text-primary" />
                  )}
                  {selectedTemplate.id === 'design' && <Design className="size-5 text-primary" />}
                  {selectedTemplate.id === 'marketing' && (
                    <Marketing className="size-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedTemplate.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="My Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
