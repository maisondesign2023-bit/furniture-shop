import Link from "next/link";

const LINE_ID = "@693hrvam";

export default function LineButton() {
  return (
    <Link
      href={`https://line.me/R/ti/p/${LINE_ID}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="加LINE好友聊聊"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#06C755] shadow-lg transition hover:scale-105"
    >
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded bg-ink px-3 py-1.5 font-body text-xs text-paper opacity-0 transition group-hover:opacity-100">
        加LINE好友聊聊
      </span>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3C6.98 3 3 6.35 3 10.5c0 3.73 3.15 6.86 7.42 7.42.29.06.68.19.78.44.09.23.06.58.03.81l-.13.77c-.04.23-.18.9.79.49.97-.41 5.24-3.09 7.15-5.29C20.35 13.61 21 12.13 21 10.5 21 6.35 17.02 3 12 3z"
          fill="white"
        />
        <text
          x="12"
          y="11.3"
          textAnchor="middle"
          fontSize="5.2"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
          fill="#06C755"
        >
          LINE
        </text>
      </svg>
    </Link>
  );
}
