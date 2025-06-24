"use client";
import { useActionState, useEffect } from "react";
import { closeTicket } from "@/actions/ticket.actions";
import { toast } from "sonner";

export default function CloseTicketButton({ ticketId, isClosed }: { ticketId: number, isClosed: boolean }) {
    const [state, formAction] = useActionState(closeTicket, { success: false, message: '' });

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state]);

    if (isClosed) return null;
    return (
        <form action={formAction}>
            <input type="hidden" name="ticketId" value={ticketId} />
            <button type="submit" className="bg-red-500 text-white p-3 w-full rounded hover:bg-red-600 transition">
                Close Ticket
            </button>
        </form>
    );
}