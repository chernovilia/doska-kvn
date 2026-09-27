export default function UnreadBadge({ count }) {
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-accent-500 text-white text-[10px] font-bold ring-2 ring-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}
