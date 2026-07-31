import { initials } from "../utils";
export function ClientAvatar({ name, large = false }: { name: string; large?: boolean }) { return <div aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full bg-[#F8CB00] font-semibold text-[#1E1E21] ${large ? "size-16 text-xl" : "size-10 text-sm"}`}>{initials(name)}</div> }
