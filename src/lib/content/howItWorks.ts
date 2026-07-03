export interface HowItWorksItem {
  id: string;
  icon: string;
  text: string; // {maturityDays} and {rate} are replaced at runtime
}

export const HOW_IT_WORKS: HowItWorksItem[] = [
  { id: "boxes",  icon: "📦", text: "3つのはこ（つかう・ためる・ふやす）で お金を わける" },
  { id: "inflow", icon: "⬇️", text: "もらった お金は まず「つかう」に 入る" },
  { id: "move",   icon: "🔁", text: "「つかう」から すきなはこへ 自分で うつせる" },
  { id: "grow",   icon: "📈", text: "「ふやす」に 入れると {maturityDays}日で +{rate}% ふえて「ためる」に もどる" },
  { id: "lock",   icon: "🔒", text: "「ふやす」の お金は {maturityDays}日 は 取り出せない" },
  { id: "job",    icon: "✅", text: "お仕事は もうしこむ → おうちのひとが OK → お金が もらえる" },
  { id: "salary", icon: "🗓️", text: "きほんきゅうは 家族の一員だから、お仕事は がんばったぶんの ごほうび" },
  { id: "goal",   icon: "⭐", text: "「ためる」で ほしいもの目標を きめられる" },
];

export function resolveHowItWorksText(
  text: string,
  maturityDays: number,
  rate: number,
): string {
  const rateDisplay = Math.round(rate * 100);
  return text
    .replace(/\{maturityDays\}/g, String(maturityDays))
    .replace(/\{rate\}/g, String(rateDisplay));
}
