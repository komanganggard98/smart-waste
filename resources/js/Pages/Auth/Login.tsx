// import Checkbox from '@/Components/Checkbox';
import InputPassword from '@/Components/InputPassword';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { LoginFormState } from '@/types';
import useFormValidator from '@/Hooks/useFormValidator';
import { loginFormSchema } from '@/types/form';


export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { clientErrors, isError, handleValidate, validateField } = useFormValidator(loginFormSchema);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<LoginFormState>({
        email: '',
        password: '',
        // remember: false as boolean,
    });

    const handleSetData = (field: keyof typeof data, value:any) => {
        clearErrors()
        setData(field, value)
        validateField(field, value)
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const { valid } = handleValidate(data);
        if (!valid) return;

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <h2 className={`mb-1 text-4xl font-bold`}>Log in to your account.</h2>
            <h3 className={`mb-5 text-gray-500`}>Enter your email address and password to log in.</h3>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => handleSetData('email', e.target.value)}
                    />

                    <InputError message={errors.email || clientErrors['email']} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <InputPassword>
                        <InputPassword.Input 
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => handleSetData('password', e.target.value)}
                        />
                    </InputPassword>

                    <InputError message={errors.password || clientErrors['password']} className="mt-2" />
                </div>

                {canResetPassword && (
                    <div className={`flex justify-end my-1`}>
                            <Link
                                href={route('password.request')}
                                className="ml-auto rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Forgot your password?
                            </Link>
                    </div>
                )}

                <div className="my-4 flex gap-2 items-center justify-center">
                    <Button type="submit" className="w-full" disabled={isError || processing}>
                        Log in
                    </Button>
                </div>
                <p className={`mb-1 text-gray-600 text-center text-sm`}>
                    Don't you have an account? 
                    <Link href={route('register')} className="ml-1 underline hover:cursor-pointer" disabled={processing}>
                        Create new account
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
