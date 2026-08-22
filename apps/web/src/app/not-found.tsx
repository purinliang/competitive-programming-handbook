import { ArrowLeft } from "lucide-react";

import { ActionLink } from "@/components/action-link";
import { PageIntro } from "@/components/page-intro";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="empty-page page-frame">
        <PageIntro
          description="它可能仍在计划中，也可能已经移动到了新的模块。"
          eyebrow="404"
          title="这一页还不存在"
        />
        <ActionLink href="/">
          <ArrowLeft aria-hidden="true" size={17} />
          返回首页
        </ActionLink>
      </main>
    </>
  );
}
