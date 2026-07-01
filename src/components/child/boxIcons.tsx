// public/icons/*.svg を参照。ファイル置換のみで差し替え可能。
import { AccountKind } from "@/lib/mock/MockBalancesContext";

const KIND_ICON: Record<AccountKind, string> = {
  spend: "/icons/use.svg",
  save:  "/icons/save.svg",
  grow:  "/icons/invest.svg",
};

export function BoxIcon({ kind, size = 20 }: { kind: AccountKind; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={KIND_ICON[kind]} alt={kind} width={size} height={size} style={{ display: "block" }} />
  );
}

// 後方互換 named exports（呼び出し側がある場合の保険）
export function UseIcon({ size = 20 }: { size?: number }) { return <BoxIcon kind="spend" size={size} />; }
export function SaveIcon({ size = 20 }: { size?: number }) { return <BoxIcon kind="save" size={size} />; }
export function InvestIcon({ size = 20 }: { size?: number }) { return <BoxIcon kind="grow" size={size} />; }
