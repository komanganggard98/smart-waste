import { Spinner } from "flowbite-react"

export default function Loading({message}:{message:string}){
    return(
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <Spinner size="xs" /> {message}
        </div>
    )
}