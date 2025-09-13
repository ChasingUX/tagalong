import MobileShell from "@/components/MobileShell";
import { getCharacterImageUrl } from "@/lib/characters";
import { CHARACTERS } from "@/lib/characters";
import Link from "next/link";

export default function Home() {
  return (
    <MobileShell showSearchButton={true}>
      <div className="pt-2">
        {/* <div className="mb-4 text-[28px] font-semibold leading-tight tracking-tight text-gray-900">
          Choose your character
        </div>

        <div className="mb-3 text-xs uppercase tracking-widest text-gray-500">
          All Characters
        </div> */}

        <div className="grid grid-cols-2 gap-4">
          {CHARACTERS.map((c) => (
            <Link
              key={c.id}
              href={`/character/${c.id}`}
              className="group block"
            >
              <div className="relative aspect-[1/1.3] overflow-hidden rounded-2xl">
                <img
                  src={getCharacterImageUrl(c)}
                  alt={c.name}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {/* Bust framing overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.15),transparent_45%)]" />
              </div>
              <div className="mt-2">
                <div className="text-xs mb-0.5 font-semibold leading-tight text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-600 capitalize">{c.role}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}