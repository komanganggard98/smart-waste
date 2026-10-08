import { Spinner } from "flowbite-react";

export default function SpinnerWithOverlay({text}:{text:string}){
    return(
        <div className="absolute inset-0 w-full h-full z-50 flex items-center justify-center">
            <div className={`absolute inset-0 bg-white/90`}></div>

            <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-1`}>
                <Spinner color="success" size="sm" light={true} />
                <p className={`m-0 text-gray-600`}>{text}</p>
            </div>
        </div>
    )
}