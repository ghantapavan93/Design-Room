import * as React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';

interface AddPhotoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPhotoSelected: (file: File) => void;
}

export function AddPhotoModal({ open, onOpenChange, onPhotoSelected }: AddPhotoModalProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onPhotoSelected(e.target.files[0]);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
            title="Create New Design"
            description="Add a high quality photo of the home. Avoid people and pets in the frame for best results."
        >
            <div
                className="mt-6 border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="mx-auto w-12 h-12 text-neutral-400 mb-4">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-neutral-900">Click to upload or drag and drop</p>
                <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 10MB</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                />
            </div>
            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
        </Dialog>
    );
}
