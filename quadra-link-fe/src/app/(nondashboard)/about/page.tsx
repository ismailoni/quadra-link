"use client";
import React from "react";

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1
        className="text-4xl font-bold mb-6 text-center"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        About Quadra Link
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Quadra Link is a student wellness platform designed to help university students connect, collaborate, and thrive. Our mission is to provide a safe, supportive, and innovative environment for mental health, peer support, and personal growth.
      </p>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">What We Offer</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-800">
          <li>
            <strong>Mood Tracking:</strong> Monitor your mental health daily, identify patterns, and gain insights into your well-being.
          </li>
          <li>
            <strong>Pseudonymous Posting:</strong> Share your thoughts and experiences anonymously, fostering open and honest conversations.
          </li>
          <li>
            <strong>Peer Support:</strong> Connect with fellow students, access support networks, and find resources tailored to campus life.
          </li>
          <li>
            <strong>Community Resources:</strong> Discover events, articles, and expert advice to help you navigate university challenges.
          </li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
        <p className="text-gray-800">
          We believe every student deserves a space to feel heard, supported, and empowered. Quadra Link bridges the gap between campus resources and student needs, making wellness accessible and stigma-free.
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-3">Get Involved</h2>
        <p className="text-gray-800 mb-2">
          Join our growing community, share your story, and help shape the future of student wellness. Whether you’re seeking support or want to support others, Quadra Link is here for you.
        </p>
        <p className="text-gray-800">
          For feedback, partnership, or support, contact us at <a href="mailto:support@quadralink.com" className="text-blue-600 underline">support@quadralink.com</a>.
        </p>
      </section>
    </main>
  );
}