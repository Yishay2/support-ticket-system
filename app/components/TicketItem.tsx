import type { Ticket } from "../generated/prisma";
import Link from "next/link";
import { getPriorityColor } from "../utils/ui";

type TicketItemProps = {
    ticket: Ticket
}

export default function TicketItem({ ticket }: TicketItemProps) {

    const isClosed = ticket.status === 'Closed';

    return (
        <div className={`flex justify-between items-center bg-white rounded-lg border-gray-20 p-6 ${isClosed ? 'opacity-50' : ''}`} key={ticket.id}>
            <div>
                <h2 className="text-xl font-semibold text-blue-600">{ticket.subject}</h2>
            </div>
            <div className="text-right space-y-2">
                <div className="text-sm text-gray-500">
                    Priority: <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                </div>
                <Link href={`/tickets/${ticket.id}`}
                    className={`inline-block mt-2  text-sm px-3 py-1 rounded  transition text-center ${isClosed ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    View Ticket
                </Link>
            </div>
        </div>
    );
}