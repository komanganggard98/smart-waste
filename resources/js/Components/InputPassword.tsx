import { InputPasswordContext } from '@/contexts/InputPasswordContext';
import { cn } from '@/lib/utils';
import { InputPasswordProps } from '@/types/form';
import { Eye, EyeClosed } from 'lucide-react';
import {
    forwardRef,
    InputHTMLAttributes,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import TextInput from './TextInput';

const InputPassword = ({ children, className }: InputPasswordProps) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <InputPasswordContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className={cn('relative', className)}>
                {children}

                <button type="button" onClick={toggleOpen} className="bg-white absolute top-1/2 -translate-y-1/2 left-auto right-2 pl-4">
                    {open ? <Eye className="w-4" /> : <EyeClosed className="w-4" />}
                </button>
            </div>
        </InputPasswordContext.Provider>
    );
};

const Input = forwardRef(function InputPassword(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);
    const context = useContext(InputPasswordContext)

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const effectiveType = context.open ? 'text' : 'password';

    return (
        <TextInput
            {...props}
            type={effectiveType}
            className={
                'input-primary' +
                className
            }
            ref={localRef}
        />
    );
});


InputPassword.Input = Input;

export default InputPassword;