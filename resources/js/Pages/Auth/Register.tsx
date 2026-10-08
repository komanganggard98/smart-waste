import InputPassword from '@/Components/InputPassword';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { validateField, validateForm } from '@/lib/utils';
import { Button } from '@/Components/ui/button';


export default function Register() {
    const { data, setData, post, processing, errors, setError, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleValidate = (field: keyof typeof data, value:any) => {
        const result = validateField(field, value, field === 'password_confirmation' ? data : undefined)
        if(result && !result?.success){
            const errorMessage = result.error.issues[0]?.message ?? 'Validation failed';
            setError(field, errorMessage);
        }else{
            clearErrors(field)
        }
    }

    const handleSetData = (field: keyof typeof data, value:any) => {
        setData(field, value)
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const isValidate = validateForm(data, setError)
        if(!isValidate) return

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => handleSetData('name', e.target.value)}
                        placeholder='e.g Johny'
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        placeholder='e.g johny@email.com'
                        onChange={(e) => handleSetData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
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
                        autoComplete="new-password"
                        onChange={(e) => handleSetData('password', e.target.value)}
                        required
                        />
                    </InputPassword>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <InputPassword>
                        <InputPassword.Input 
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) =>
                                handleSetData('password_confirmation', e.target.value)
                            }
                            required
                        />
                    </InputPassword>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none"
                    >
                        Already registered?
                    </Link>

                    <Button type="submit" className="ms-4" disabled={processing}>
                        Register
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
