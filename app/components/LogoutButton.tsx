"use client";
import { logOutUser } from "@/actions/auth.actions";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export default function LogoutButton() {

    const [state, formAction] = useActionState(logOutUser, { success: false, message: '' });

    useEffect(() => {
        if (state.success) {
            toast.success('User was log out successful!');
        } else if (state.message) {
            toast.error(state.message);
         }
    }, [state]);

    return (
        <form action={formAction}>
            <button
                type='submit'
                className='bg-red-500 pointer text-white px-4 py-2 rounded hover:bg-red-600 transition'
            >
                Logout
            </button>
        </form>);
}