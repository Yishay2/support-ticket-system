import { getCurrentUser } from '@/lib/current-user'
import NewTicketForm from './ticket-form'
import { redirect } from 'next/navigation';

export default async function NewTicketPage() {

    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    return (
        <div className='flex-1 bg-blue-50 flex items-center justify-center px-4'>
            <NewTicketForm />
        </div>
    )
}
