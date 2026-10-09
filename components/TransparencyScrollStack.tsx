'use client';

import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';

const transparencyCards = [
  {
    eyebrow: 'Transparent access',
    title: 'Every opportunity starts with the facts.',
    body: 'Property details, pricing logic, expected returns, documents, and key risks are organized in one place before anyone invests.',
    stat: 'Deal context',
  },
  {
    eyebrow: 'Clear ownership',
    title: 'Investors can understand what they own.',
    body: 'IGUDAR is built around visible fees, documented structures, investor rights, and simple terms for fractional real estate.',
    stat: 'No hidden layers',
  },
  {
    eyebrow: 'Ongoing visibility',
    title: 'The platform keeps reporting after investment.',
    body: 'Occupancy, expenses, distributions, and property updates are designed to stay visible across the full asset lifecycle.',
    stat: 'Live updates',
  },
];

export default function TransparencyScrollStack() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <ScrollStack
        useWindowScroll
        itemDistance={72}
        itemStackDistance={22}
        stackPosition="14%"
        scaleEndPosition="8%"
        baseScale={0.9}
        itemScale={0.025}
        className="
          !h-auto
          !overflow-visible
          [&_.scroll-stack-inner]:!min-h-0
          [&_.scroll-stack-inner]:!px-0
          [&_.scroll-stack-inner]:!pb-[32vh]
          [&_.scroll-stack-inner]:!pt-[10vh]
          sm:[&_.scroll-stack-inner]:!px-6
          lg:[&_.scroll-stack-inner]:!px-12
        "
      >
        {transparencyCards.map((card, index) => (
          <ScrollStackItem
            key={card.title}
            itemClassName="
              !h-[390px]
              !rounded-[28px]
              border border-primary/15
              bg-card
              p-5
              shadow-[0_24px_70px_rgba(93,24,233,0.12)]
              will-change-transform
              backface-hidden
              transform-gpu
              sm:!h-[350px]
              sm:p-8
              lg:!h-80
              lg:p-10
            "
          >
            <div className="flex h-full min-w-0 flex-col justify-between gap-5 sm:gap-6">
              <div className="flex items-center justify-between gap-4">
                <span className="min-w-0 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary sm:text-xs sm:tracking-[0.18em]">
                  {card.eyebrow}
                </span>

                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:size-10 sm:text-sm">
                  0{index + 1}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-[1.65rem] font-semibold leading-[1.08] tracking-normal text-foreground sm:text-4xl lg:text-5xl">
                  {card.title}
                </h3>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {card.body}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-4 text-xs sm:text-sm">
                <span className="font-medium text-muted-foreground">
                  Built for trust
                </span>

                <span className="font-semibold text-primary">
                  {card.stat}
                </span>
              </div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>
  );
}
