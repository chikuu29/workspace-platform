const PREFIXES = ["Lu", "Fi", "Md", "Fa", "Io", "Ai", "Tb", "Ci", "Ri", "Gr", "Ti", "Hi", "Bs", "Vsc", "Fc", "Si"];

const MANUAL_MAP: Record<string, string> = {
  AiTwotoneCloseCircle: "circle-x",
  FaDatabase: "database",
  FaEdit: "pencil",
  FaEye: "eye",
  FaFilter: "filter",
  FaPlus: "plus",
  FaTrash: "trash-2",
  FcHighPriority: "alert-triangle",
  FcHome: "home",
  FcBarChart: "bar-chart-3",
  FcBookmark: "bookmark",
  FcBusinessman: "user",
  FcCalendar: "calendar",
  FcCheckmark: "check",
  FcClock: "clock",
  FcList: "list",
  FcManager: "users",
  FcMoneyTransfer: "receipt",
  FcPlanner: "calendar-days",
  FcPlus: "plus",
  FcReading: "book-open",
  FcStatistics: "trending-up",
  FcTodoList: "clipboard-list",
  IoShieldCheckmarkOutline: "shield-check",
  MdAccountBalanceWallet: "wallet-cards",
  MdBadge: "badge",
  MdNotificationsNone: "bell",
  Membership: "credit-card",
  SiAuthelia: "shield-check",
  TbLockAccess: "lock",
};

const toKebabCase = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const normalizeLucideIconName = (name: string): string => {
  if (!name) return "info";
  if (MANUAL_MAP[name]) return MANUAL_MAP[name];

  for (const prefix of PREFIXES) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      const withoutPrefix = name.substring(prefix.length);
      return MANUAL_MAP[withoutPrefix] || toKebabCase(withoutPrefix);
    }
  }

  return toKebabCase(name);
};
