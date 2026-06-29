// MOCK: TODO(0002) — family_settings.promisesから取得する。
// HANDOFF.md §5: ルビは「文を読む」要素に限定。アイコン＋短語の箱名等には振らない。
import { Seg } from "@/components/child/RubyText";

export type RuleItem = { icon: string; segs: Seg[] };

export const RULES: RuleItem[] = [
  {
    icon: "🔒",
    segs: [["ふやす", "ふやす"], "に いれたら ", ["満期", "まんき"], " まで うごかせない"],
  },
  {
    icon: "🤝",
    segs: ["おしごとは ", ["親", "おや"], " が ", ["確認", "かくにん"], " してから おかねが もらえる"],
  },
  {
    icon: "💰",
    segs: ["じぶんの はこの あいだだけ ", ["移動", "いどう"], " できる"],
  },
];
