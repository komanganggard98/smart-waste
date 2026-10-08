interface SectionProgressProps{
    length:number,
    step:number
}
export default function SectionProgress({length, step}: SectionProgressProps){
    return(
        <div className={`my-1 flex justify-center items-center gap-2`}>
            {Array.from({ length: length }, (_, index) => (
                <div
                    key={index}
                    className={`relative z-0`}
                >
                    {index < length - 1 && (
                        <div className={`absolute top-1/2 left-[100%] w-full h-[3px] ${step > index + 1 ? 'bg-[var(--brand-primary)]' : 'bg-gray-100'} -translate-y-1/2 z-[0]`}></div>
                    )}
                    <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${(step >= index + 1) ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-100'} relative z-2`}
                    >
                        {index + 1}
                    </div>
                </div>
            ))}
        </div>
    )
}