import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
}

const InviteUserModal = ({ open, onOpenChange, projectId }: InviteUserModalProps) => {
  const { toast } = useToast();
  const [inviteeEmail, setInviteeEmail] = useState('');
  
  const inviteUserMutation = useMutation({
    mutationFn: async (data: { inviteeEmail: string }) => {
      return apiRequest('POST', `/api/projects/${projectId}/members`, data);
    },
    onSuccess: () => {
      // Reset form and close modal
      setInviteeEmail('');
      onOpenChange(false);
      
      // Invalidate and refetch project members query - add retry mechanisms
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/members`] });
      
      // Immediate refetch
      queryClient.refetchQueries({ queryKey: [`/api/projects/${projectId}/members`] });
      
      // Additional delayed refetches to ensure we get the updated list from the server
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: [`/api/projects/${projectId}/members`] });
      }, 300);
      
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: [`/api/projects/${projectId}/members`] });
      }, 800);
      
      toast({
        title: 'User invited',
        description: 'The user has been invited to the project',
      });
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to invite the user';
      
      if (error.message === 'User not found') {
        errorMessage = 'No user found with this email address';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteeEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Email address is required',
        variant: 'destructive',
      });
      return;
    }
    
    inviteUserMutation.mutate({ inviteeEmail });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Invite User to Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="inviteeEmail">User Email</Label>
            <Input
              id="inviteeEmail"
              type="email"
              value={inviteeEmail}
              onChange={(e) => setInviteeEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteUserMutation.isPending || !inviteeEmail.trim()}
            >
              Invite User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserModal;