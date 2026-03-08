"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Loader2, Receipt } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface InvoiceItem {
    description: string
    quantity: number
    amount: number
}

export function CreateInvoiceDialog() {
    const [open, setOpen] = useState(false)
    const [patientId, setPatientId] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: "", quantity: 1, amount: 0 }
    ])

    const supabase = createClient()
    const queryClient = useQueryClient()

    // Fetch patients for selection
    const { data: patients } = useQuery({
        queryKey: ["patients-list"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("patients")
                .select("id, first_name, last_name, mrn")
                .order("last_name")
            if (error) throw error
            return data
        }
    })

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, amount: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const totalAmount = items.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const amt = Number(item.amount) || 0;
        return sum + (qty * amt);
    }, 0)

    const createInvoiceMutation = useMutation({
        mutationFn: async () => {
            console.log("Starting invoice creation...", { patientId, dueDate, items, totalAmount });

            if (!patientId || !dueDate) {
                throw new Error("Patient and Due Date are required");
            }

            if (items.some(i => !i.description || Number(i.amount) <= 0)) {
                throw new Error("Each line item must have a description and a price greater than 0");
            }

            // 1. Create Invoice
            const { data: invoice, error: invoiceError } = await supabase
                .from("invoices")
                .insert({
                    patient_id: patientId,
                    amount: totalAmount,
                    due_date: dueDate,
                    status: "DRAFT"
                })
                .select()
                .single()

            if (invoiceError) {
                console.error("Invoice creation error:", invoiceError);
                throw new Error(`Failed to create invoice header: ${invoiceError.message}`);
            }

            console.log("Invoice header created:", invoice);

            // 2. Create Invoice Items
            const invoiceItems = items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: Number(item.quantity) || 1,
                amount: Number(item.amount) || 0
            }))

            const { error: itemsError } = await supabase
                .from("invoice_items")
                .insert(invoiceItems)

            if (itemsError) {
                console.error("Invoice items creation error:", itemsError);
                throw new Error(`Failed to create invoice items: ${itemsError.message}`);
            }

            console.log("Invoice items created successfully");
            return invoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] })
            toast.success("Invoice generated successfully")
            setOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            console.error("Mutation error:", error);
            toast.error(error.message || "Failed to generate invoice");
        }
    })

    const resetForm = () => {
        setPatientId("")
        setDueDate("")
        setItems([{ description: "", quantity: 1, amount: 0 }])
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-900 border-border/50 text-white p-6 backdrop-blur-xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold font-outfit">New Patient Invoice</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-inter">
                                Generate a professional billing statement with itemized services.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Patient <span className="text-rose-500">*</span></Label>
                            <Select value={patientId} onValueChange={setPatientId}>
                                <SelectTrigger className={cn("bg-white/5 border-border/50 h-11", !patientId && "border-rose-500/20")}>
                                    <SelectValue placeholder={patients?.length === 0 ? "No patients found" : "Search by name or MRN"} />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-border/50 text-white">
                                    {patients?.length === 0 && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No patients registered in the system.
                                        </div>
                                    )}
                                    {patients?.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.first_name} {p.last_name} ({p.mrn})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date <span className="text-rose-500">*</span></Label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={cn("bg-white/5 border-border/50 h-11", !dueDate && "border-rose-500/20")}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice Particulars <span className="text-rose-500">*</span></Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addItem}
                                className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Line Item
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar border border-border/50 rounded-xl p-3 bg-white/5">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-end group animate-in slide-in-from-right-2 duration-300">
                                    <div className="flex-1 space-y-1.5">
                                        <Input
                                            placeholder="Description (e.g., General Consultation)"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, "description", e.target.value)}
                                            className={cn("bg-white/5 border-border/50 h-11", !item.description && "border-rose-500/20")}
                                        />
                                    </div>
                                    <div className="w-20 space-y-1.5">
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                                            className="bg-white/5 border-border/50 h-11"
                                            min="1"
                                        />
                                    </div>
                                    <div className="w-32 space-y-1.5">
                                        <Input
                                            type="number"
                                            placeholder="Unit Price"
                                            value={item.amount}
                                            onChange={(e) => updateItem(index, "amount", parseFloat(e.target.value) || 0)}
                                            className={cn("bg-white/5 border-border/50 h-11", Number(item.amount) <= 0 && "border-rose-500/20")}
                                            min="0.01"
                                            step="0.01"
                                        />
                                    </div>
                                    {items.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="h-11 w-11 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Invoice Amount</p>
                            <p className="text-2xl font-bold text-white font-outfit mt-1">
                                ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <Button
                            onClick={() => createInvoiceMutation.mutate()}
                            disabled={createInvoiceMutation.isPending || totalAmount <= 0}
                            className="bg-primary hover:bg-primary/90 text-white gap-3 h-12 px-8 rounded-xl font-bold min-w-[220px] shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {createInvoiceMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Receipt className="w-4 h-4" />
                                    Generate Invoice
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
