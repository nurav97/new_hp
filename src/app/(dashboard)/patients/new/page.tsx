"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    Stethoscope,
    Dna,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Activity,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const steps = [
    { id: 1, title: "Personal Info", description: "Demographics & Identity", icon: User },
    { id: 2, title: "Clinical Intake", description: "Symptoms & History", icon: Stethoscope },
    { id: 3, title: "Genomic Profile", description: "Genetic Flags & Allergies", icon: Dna },
    { id: 4, title: "Review", description: "Final Confirmation", icon: CheckCircle2 },
];

export default function IntakeWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = () => {
        toast.success("Patient successfully registered!");
        router.push("/patients");
    };

    const progressValue = (currentStep / steps.length) * 100;
    const CurrentStepIcon = steps[currentStep - 1].icon;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">New Patient Intake</h1>
                <p className="text-muted-foreground">Complete the clinical workflow wizard to register a new patient.</p>
            </div>

            {/* Progress Bar & Steps Indicator */}
            <div className="space-y-6">
                <Progress value={progressValue} className="h-2 bg-secondary/50" />
                <div className="grid grid-cols-4 gap-4">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 text-center group cursor-pointer" onClick={() => step.id < currentStep && setCurrentStep(step.id)}>
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all",
                                    isActive && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110",
                                    isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                                    !isActive && !isCompleted && "bg-card/50 border-border/50 text-muted-foreground"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <div className="hidden sm:block">
                                    <div className={cn(
                                        "text-xs font-bold uppercase tracking-wider",
                                        isActive ? "text-primary" : "text-muted-foreground"
                                    )}>{step.title}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Card className="bg-card/50 border-border/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            {CurrentStepIcon && <CurrentStepIcon className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                            <CardTitle className="text-xl text-white">{steps[currentStep - 1].title}</CardTitle>
                            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    {currentStep === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-muted-foreground">First Name</Label>
                                <Input id="firstName" placeholder="e.g. John" className="bg-secondary/30 border-border/50 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-muted-foreground">Last Name</Label>
                                <Input id="lastName" placeholder="e.g. Smith" className="bg-secondary/30 border-border/50 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob" className="text-muted-foreground">Date of Birth</Label>
                                <Input id="dob" type="date" className="bg-secondary/30 border-border/50 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-muted-foreground">Gender</Label>
                                <Input id="gender" placeholder="Male / Female / Other" className="bg-secondary/30 border-border/50 h-11" />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Primary Symptoms</Label>
                                <textarea
                                    className="w-full h-32 px-3 py-2 rounded-xl bg-secondary/30 border border-border/50 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    placeholder="Describe the patient's current symptoms..."
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Blood Type</Label>
                                    <Input placeholder="e.g. A+" className="bg-secondary/30 border-border/50 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Pulse Rate (BPM)</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                                        <Input placeholder="72" className="pl-10 bg-secondary/30 border-border/50 h-11" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex gap-4">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-white">Drug Interaction Awareness</p>
                                    <p className="text-muted-foreground mt-1">Please specify all known allergens to trigger the AI interaction matrix.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Known Allergens</Label>
                                <Input placeholder="e.g. Penicillin, Peanuts" className="bg-secondary/30 border-border/50 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Genomic Flags (if any)</Label>
                                <Input placeholder="Searching genomic DB..." className="bg-secondary/30 border-border/50 h-11" />
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="rounded-xl border border-border/50 bg-secondary/10 p-4 divide-y divide-border/30">
                                <div className="py-2 flex justify-between">
                                    <span className="text-muted-foreground">Patient Name:</span>
                                    <span className="text-white font-medium">John Smith</span>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <span className="text-muted-foreground">Blood Type:</span>
                                    <span className="text-white font-medium">A+</span>
                                </div>
                                <div className="py-2 flex justify-between">
                                    <span className="text-muted-foreground">Initial Priority:</span>
                                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 h-5">MEDIUM</Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-12">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="text-muted-foreground hover:text-white rounded-xl gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        {currentStep < 4 ? (
                            <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white rounded-xl gap-2 px-6 h-11">
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 px-8 h-11 shadow-lg shadow-emerald-500/20">
                                Complete Intake
                                <CheckCircle2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
