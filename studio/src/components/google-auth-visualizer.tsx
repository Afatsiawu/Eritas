'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2, ShieldCheck, User, Fingerprint, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type Step = {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'loading' | 'completed';
    icon: React.ElementType;
};

const INITIAL_STEPS: Step[] = [
    {
        id: 1,
        title: 'Initializing identity service',
        description: 'Establishing secure connection with accounts.google.com',
        status: 'pending',
        icon: ShieldCheck,
    },
    {
        id: 2,
        title: 'User authorization',
        description: 'Waiting for consent and scope approval',
        status: 'pending',
        icon: User,
    },
    {
        id: 3,
        title: 'Exchanging auth code',
        description: 'Requesting access token from Google OAuth 2.0 endpoint',
        status: 'pending',
        icon: RefreshCw,
    },
    {
        id: 4,
        title: 'Fetching profile data',
        description: 'Retrieving name, email, and avatar from People API',
        status: 'pending',
        icon: Fingerprint,
    },
    {
        id: 5,
        title: 'Creating secure session',
        description: 'Synchronizing profile to Eritas Gateway',
        status: 'pending',
        icon: CheckCircle2,
    },
];

type GoogleAuthVisualizerProps = {
    onComplete: (user: { displayName: string, email: string, photoURL: string }) => void;
};

export function GoogleAuthVisualizer({ onComplete }: GoogleAuthVisualizerProps) {
    const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const googleUser = {
        displayName: 'Senator Bronxx',
        email: 'senator.bronxx@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
    };

    useEffect(() => {
        if (currentStep < steps.length) {
            // Mark current step as loading
            setSteps(prev => prev.map((s, i) => i === currentStep ? { ...s, status: 'loading' } : s));

            const timer = setTimeout(() => {
                // Mark current step as completed
                setSteps(prev => prev.map((s, i) => i === currentStep ? { ...s, status: 'completed' } : s));

                // Move to next step
                if (currentStep < steps.length - 1) {
                    setCurrentStep(prev => prev + 1);
                } else {
                    // All steps completed
                    setTimeout(() => onComplete(googleUser), 800);
                }
            }, 1200 + Math.random() * 800);

            return () => clearTimeout(timer);
        }
    }, [currentStep, steps.length, onComplete]);

    useEffect(() => {
        const targetProgress = ((currentStep + 1) / steps.length) * 100;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev < targetProgress) return prev + 2;
                return prev;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [currentStep, steps.length]);

    return (
        <Card className="w-full bg-background shadow-xl border-2 border-primary/20">
            <CardHeader className="text-center pb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                    <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="h-6 w-6" />
                    Google Authorization Flow
                </CardTitle>
                <Progress value={progress} className="h-1 mt-4" />
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = step.status === 'completed';

                    return (
                        <div key={step.id} className={cn(
                            "flex items-start gap-4 p-3 rounded-lg transition-all duration-300",
                            isActive ? "bg-primary/5 border-l-4 border-primary" : "opacity-60"
                        )}>
                            <div className="flex-shrink-0 mt-1">
                                {step.status === 'loading' ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                ) : isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className={cn(
                                    "font-medium leading-none",
                                    isCompleted ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
