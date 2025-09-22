import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const featurecards = [
  {
    title: 'Mood Tracking',
    head: 'Monitor Your Mental Health',
    description: 'Track daily emotions, identify patterns, and gain insights into your psychological well-being.',
    background: '/mood-track.svg',
    cto: 'Explore',
    href: '/about'
  },
  {
    title: 'pseudonymous Posting',
    head: 'Share Safely and Anonymously',
    description: 'Express yourself freely without fear of judgment, connecting with peers in a secure environment.',
    background: '/pseudo.svg',
    cto: 'Learn More',
    href: 'about'
  },
  {
    title: 'Peer Support',
    head: 'Community-Driven Wellness',
    description: 'Access anonymous support networks and resources tailored to student mental health challenges.',
    background: '/campus-wellness.svg',
    cto: 'Connect',
    href: '/about'
  },
 
]

const Page: React.FC = () => {
  return (
    <main className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-blue-700">
      <Card className="flex flex-col-reverse md:flex-row items-center gap-8 m-8 p-4 md:p-8 shadow-xl rounded-2xl max-w-[90vw] w-full">
        <div className="flex flex-col md:w-[50%]">
          <h1
            className="mb-4 text-[40px] md:text-[50px] font-bold"
            style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            Your Campus Wellness Journey Starts Here
          </h1>
          <p className="mb-6 text-lg text-gray-700">
            Connect anonymously with peers and track your mental health in a safe, supportive environment.<br />
            Discover resources and support tailored specifically for university students.
          </p>
          <div className="flex gap-4">
            <Button className="bg-blue-700 text-white font-semibold hover:bg-white hover:text-black border-[2px] border-blue-700 transition-all cursor-pointer" variant="default">
              <Link href='/signup'>
                Get Started
              </Link>
            </Button>
            <Button className="border-[2px] border-blue-700 font-semibold hover:bg-blue-700 hover:text-white transition-all cursor-pointer" variant="outline">
              <Link href='/about'>
                Learn More
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center md:w-[50%]">
          <Image
            src="/campus-wellness.svg"
            alt="Campus Wellness"
            width={0}
            height={10000}
            style={{ width: '100%', height: '100%' }}
            className="rounded-xl shadow-lg border border-blue-100"
            priority
          />
        </div>
      </Card>

      {/* FEATURES */}
      <section className="w-full max-w-6xl mx-auto my-16">
        <div className="text-center mb-10">
          <h2
            className="text-lg font-semibold mb-2"
            style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}
          >
            Features
          </h2>
          <h1
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
          >
            Powerful Features for Student Wellness
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Innovative tools designed to support your mental health and campus experience.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          {featurecards.map((card, idx) => (
            <div
              key={card.title}
              className="relative flex-1 min-w-[260px] max-w-[340px] rounded-xl overflow-hidden shadow-lg bg-black group"
              style={{ height: 400 }}
            >
              <Image
                src={`/public/${card.background.replace('/', '')}`.replace('/public/', '/')}

                alt={card.title}
                fill
                style={{ objectFit: 'cover', opacity: 0.7 }}
                className="absolute inset-0 w-full h-full transition group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              <div className="relative z-10 flex flex-col justify-end h-full p-6">
                <span className="text-sm text-white font-medium mb-2">{card.title}</span>
                <h2
                  className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight"
                  style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                >
                  {card.head}
                </h2>
                <p className="text-white text-base mb-6">{card.description}</p>
                <Link
                  href={card.href}
                  className="text-white text-sm font-semibold flex items-center gap-2 hover:underline"
                  style={{ marginTop: 'auto' }}
                >
                  {card.cto} <span aria-hidden="true">›</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Page;