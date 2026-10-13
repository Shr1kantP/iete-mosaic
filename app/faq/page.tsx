import type { Metadata } from "next";
import SiteNav from "../../components/SiteNav";

export const metadata: Metadata = {
  title: "Questions Before Entry | IETE-MOSIAC WEBSITE",
  description: "IETE-MOSIAC WEBSITE",
};

const faqs = [
  {
    question: "What is Blackwood House?",
    answer:
      "Blackwood House is a live paranormal investigation experience where teams solve physical puzzles, uncover hidden clues, and unravel a fictional haunting.",
  },
  {
    question: "How long does the experience last?",
    answer:
      "The experience has four stages, each with an eight-minute time limit. Additional time is required for the initial briefing and transitions.",
  },
  {
    question: "Do we need prior experience?",
    answer:
      "No prior experience is required. Observation, logical thinking, communication, and teamwork are all you need.",
  },
  {
    question: "Is Blackwood House scary?",
    answer:
      "Yes. The experience features a Victorian horror atmosphere, darkness, sudden loud sounds, and a brief jumpscare. Please consider your comfort with these effects before participating.",
  },
  {
    question: "What happens if we cannot solve a stage in time?",
    answer:
      "The stage ends when the timer runs out. A three-minute penalty is added to your team's score, and you move on to the next stage.",
  },
];

export default function FAQPage() {
  return (
    <main className="faq-page">
      <SiteNav showBrandMark brandHref="/#letter" />
      <section className="faq-screen" aria-labelledby="faq-title">
        <header className="faq-heading">
          <h1 id="faq-title">Questions Before Entry</h1>
          <p>Answers for those who dare to investigate</p>
        </header>
        <div className="faq-list">
          {faqs.map(({ question, answer }) => (
            <details className="faq-item" key={question}>
              <summary>
                <span>{question}</span>
                <span className="faq-item__toggle" aria-hidden="true" />
              </summary>
              <div className="faq-item__answer">
                <p>{answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
