"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InstructorComingSoonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function InstructorComingSoonDialog({ open, onOpenChange }: InstructorComingSoonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-1 text-left text-sm leading-relaxed text-muted-foreground">
              <p>
                Instructor registration is currently under development and will be available in a
                future update.
              </p>
              <p>Thank you for your interest in joining AviatorPass.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" variant="accent" onClick={() => onOpenChange(false)}>
            Back to Student Registration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { InstructorComingSoonDialog };
