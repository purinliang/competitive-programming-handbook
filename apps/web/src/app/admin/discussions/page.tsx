import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
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
        <PageIntro
          description="查看私密讨论与真实作者身份，处理举报、锁定和软删除。"
          eyebrow="Admin"
          title="讨论审核"
        />
        <ModerationDashboard />
      </main>
    </>
  );
}
