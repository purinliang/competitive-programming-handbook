import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import { ModerationDashboard } from "./moderation-dashboard";

export const metadata: Metadata = {
  title: "讨论审核",
};

export default function DiscussionModerationPage() {
  return (
    <>
      <SiteHeader />
      <main className="moderation-page page-frame">
        <p className="eyebrow">Admin</p>
        <h1>讨论审核</h1>
        <p>查看私密讨论与真实作者身份，处理举报、锁定和软删除。</p>
        <ModerationDashboard />
      </main>
    </>
  );
}
