import { getCurrentSession } from "@/lib/auth";
import { getAssessmentQuestionsForStudent, getAssessmentSettings } from "@/lib/data-store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AssessmentQuizRunner } from "./AssessmentQuizRunner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Free English Grammar Assessment | Learn and Grow",
  description:
    "Discover your current English grammar level with our free 20-question assessment. Find out where you stand and take the next step towards speaking English confidently.",
};

export default async function AssessmentPage() {
  const { user, subscriptionStatus } = await getCurrentSession();
  const [questions, settings] = await Promise.all([
    getAssessmentQuestionsForStudent(),
    getAssessmentSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Navbar currentUser={user} subscriptionStatus={subscriptionStatus} />

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <AssessmentQuizRunner
          initialQuestions={questions}
          initialSettings={{
            title: settings.title,
            subtitle: settings.subtitle,
            description: settings.description,
            instructions: settings.instructions,
            totalQuestions: settings.totalQuestions,
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
