import type { ReactNode } from 'react'
import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'

type Section = { heading: string; body: ReactNode }

function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: Section[] }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased">
      <Header />
      <main className="mx-auto max-w-[760px] px-5 py-16 sm:px-6 sm:py-24">
        <p className="text-[13px] uppercase tracking-[0.14em] text-neutral-400">Last updated {updated}</p>
        <h1 className="font-display-wide mt-3.5 text-[clamp(2.2rem,6vw,3.75rem)] leading-[0.95] tracking-[-0.035em]">{title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-neutral-300">{intro}</p>
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-bold tracking-[-0.02em]">{s.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-neutral-400">{s.body}</div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

const CONTACT = (
  <p>
    Questions? Write to{' '}
    <a href="mailto:mairopedroisaac@gmail.com" className="text-white underline underline-offset-4">
      mairopedroisaac@gmail.com
    </a>
    .
  </p>
)

export function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="23 November 2026"
      intro="This page explains what Influence Trading House (ITH) collects, why, and what you can do about it. In short: we keep only what the app needs, and we never sell your data."
      sections={[
        {
          heading: 'What we collect',
          body: (
            <>
              <p>Your account details: email address, name and, if you add one, a profile photo.</p>
              <p>Your trading records: the trades you log or sync, with prices, results, notes and screenshots.</p>
              <p>If you sign in with Google, we receive your name, email and Google profile photo. We never see your Google password.</p>
            </>
          ),
        },
        {
          heading: 'How we use it',
          body: <p>Only to run your account: to log you in, show your journal and work out your statistics. Your trades are visible to you alone.</p>,
        },
        {
          heading: 'Where it is stored',
          body: <p>Your data is stored on secure servers. Passwords are saved in a scrambled form that cannot be read back.</p>,
        },
        {
          heading: 'Cookies',
          body: <p>We store a login token in your browser so you stay signed in, and your theme choice. We do not use advertising cookies.</p>,
        },
        {
          heading: 'Your choices',
          body: (
            <>
              <p>You can update your details on your profile page at any time.</p>
              <p>To delete your account and all your data, email us and we will do it.</p>
            </>
          ),
        },
        { heading: 'Contact', body: CONTACT },
      ]}
    />
  )
}

export function Terms() {
  return (
    <LegalPage
      title="Terms of use"
      updated="23 November 2026"
      intro="By creating an account on Influence Trading House (ITH), you agree to these terms. Please read them, especially the part about risk."
      sections={[
        {
          heading: 'What ITH is',
          body: <p>ITH is a tool for testing trading strategies, receiving alerts and keeping a trade journal. It is not a broker and it does not hold your money.</p>,
        },
        {
          heading: 'Not financial advice',
          body: (
            <>
              <p>Alerts, statistics and backtests are information, not advice. You decide every trade you take.</p>
              <p>Trading forex and other markets carries a high risk of loss. Past results, including backtests, do not promise future results. Only trade money you can afford to lose.</p>
            </>
          ),
        },
        {
          heading: 'Your account',
          body: <p>Keep your password safe and do not share your account. You are responsible for what happens under your login.</p>,
        },
        {
          heading: 'Fair use',
          body: <p>Do not try to break, overload or copy the service, or access other people&apos;s data.</p>,
        },
        {
          heading: 'Changes',
          body: <p>We may update these terms as ITH grows. If the change is important, we will tell you by email or in the app.</p>,
        },
        { heading: 'Contact', body: CONTACT },
      ]}
    />
  )
}
