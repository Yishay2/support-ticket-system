"use server";
import { prisma } from "../lib/prisma"
import { revalidatePath } from "next/cache";
import { logEvent } from "@/app/utils/sentry";
import { getCurrentUser } from "@/lib/current-user";

interface StateType {
    success: boolean,
    message: string
}

export async function createTicket(prevState: StateType, formData: FormData): Promise<StateType> {

    try {
        const user = await getCurrentUser();
        if (!user) {
            logEvent('Unauthorized ticket creation attempt', 'auth', {}, 'warning');
            return { success: false, message: 'You must be logged in to create a ticket' }
        }
        const subject = formData.get('subject') as string;
        const description = formData.get('description') as string;
        const priority = formData.get('priority') as string;
        console.log(subject, description, priority);
        if (!subject || !description || !priority) {
            logEvent('Validation error: Msissing ticket fields', 'ticket', { subject, description, priority }, 'warning')
            return { success: false, message: 'All fields are required' }
        }

        const ticket = await prisma.ticket.create({
            data: {
                subject, description, priority, user: {
                    connect: { id: user.id }
                }
            }
        });
        logEvent(`ticket created successfully: ${ticket.id}`, 'ticket', { ticketId: ticket.id }, 'info');
        revalidatePath('/tickets');
        return { success: true, message: 'Ticket created successfuly!' }
    } catch (error) {
        logEvent('An error occured while creating the ticket.', 'ticket', { formData: Object.fromEntries(formData.entries()) }, 'error', error)
        return { success: false, message: 'An error occured while creating the ticket!' }
    }
}

export async function GetTicket() {
    try {

        const user = await getCurrentUser();
        if (!user) {
            logEvent('Unauthorized access to ticket list', 'ticket', {}, 'warning');
            return [];
        }
        const tickets = await prisma.ticket.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
        logEvent('Fetched ticket list', 'ticket', { count: tickets.length }, 'info');
        return tickets;
    } catch (error) {
        logEvent("Error fetching tickets", 'ticket', {}, 'error', error);
        return [];
    }
}

export async function GetTicketById(ticketId: string) {
    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: Number(ticketId) } });
        if (!ticket) {
            logEvent('Ticket not found', 'ticket', { ticketId }, 'warning');
        }

        return ticket;
    } catch (error) {
        logEvent('Error fetching ticket details', 'ticket', { ticketId }, 'error', error);
    }
}


export async function closeTicket(prevState: StateType, formData: FormData): Promise<StateType> {
    const ticketId = Number(formData.get('ticketId'));
    if (!ticketId) {
        logEvent('Missing ticket ID', 'ticket', {}, 'warning');
        return { success: false, message: 'Ticket ID is required' };
    }

    const user = await getCurrentUser();
    if (!user) {
        logEvent('Missing user ID', 'ticket', {}, 'warning');
        return { success: false, message: 'Unauthorized' };
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket || ticket.userId !== user.id) {
        logEvent('Unauthorized ticket close attempt', 'ticket', { ticketId, userId: user.id }, 'warning');
        return { success: false, message: 'You are not authorized to close this ticket' };
    }

    await prisma.ticket.update({ where: { id: ticketId }, data: { status: 'Closed' } });
    revalidatePath('/tickets');
    revalidatePath(`/tickets/${ticketId}`);
    return { success: true, message: 'Ticket closed successfully!' };

}