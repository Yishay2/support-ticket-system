import { logEvent } from "@/app/utils/sentry";
import Link from "next/link";
import { GetTicketById } from "@/actions/ticket.actions";
import { notFound } from "next/navigation";
import { getPriorityColor } from "@/app/utils/ui";
import CloseTicketButton from "@/app/components/CloseTicketButton";

export default async function TicketDetailsPage(props: { params: Promise<{ id: string }> }) {

    const { id } = (await props.params);
    const ticket = await GetTicketById(id);

    if (!ticket) notFound();

    logEvent(`Viewing ticket details`, 'ticket', { ticketId: id }, 'info');
    return (
        <div className=' bg-blue-50 p-8'>
            <div className='max-w-2xl mx-auto bg-white rounded-lg shadow border border-gray-200 p-8 space-y-6'>
                <h1 className='text-3xl font-bold text-blue-600'>{ticket.subject}</h1>

                <div className='text-gray-700'>
                    <h2 className='text-lg font-semibold mb-2'>Description</h2>
                    <p>{ticket.description}</p>
                </div>

                <div className='text-gray-700'>
                    <h2 className='text-lg font-semibold mb-2'>Priority</h2>
                    <p className={getPriorityColor(ticket.priority)}>{ticket.priority}</p>
                </div>

                <div className='text-gray-700'>
                    <h2 className='text-lg font-semibold mb-2'>Created At</h2>
                    <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>

                <Link
                    href='/tickets'
                    className='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition'
                >
                    ← Back to Tickets
                </Link>
                
                {ticket.status !== 'Closed' && (
                    <CloseTicketButton
                        ticketId={ticket.id}
                        isClosed={ticket.status === 'Closed'}
                    />
                )}
            </div>
        </div>
    );
}