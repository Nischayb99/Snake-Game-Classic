import React from "react";

const LinkButton = ({ href, icon, text }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full sm:w-52 justify-center bg-gradient-to-r from-[#667eea] to-[#764ba2] py-3 px-6 rounded-full font-medium flex items-center gap-2 hover:-translate-y-1 hover:shadow-link-btn-hover transition-all"
  >
    <i className={icon}></i> {text}
  </a>
);

const AboutPage = () => {
  return (
    <main className="flex-1 p-8 flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-5xl font-bold mb-8 about-title">About Developer</h2>
        <div className="developer-info border border-white/20 rounded-2xl p-8 mb-8">
          <h3 className="text-3xl font-semibold mb-4">Nischay Bandodiya</h3>
          <p className="opacity-90 mb-6">
            Full Stack Developer passionate about creating engaging web
            experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton
              href="https://nischay-bandodiya-portfolio.vercel.app"
              icon="ri-global-line"
              text="Portfolio"
            />
            <LinkButton
              href="https://github.com/Nischayb99"
              icon="ri-github-line"
              text="GitHub"
            />
          </div>
        </div>
        <div className="tech-stack border border-white/20 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-4">Built With</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <span className="bg-white/20 py-2 px-4 rounded-2xl">React</span>
            <span className="bg-white/20 py-2 px-4 rounded-2xl">Vite</span>
            <span className="bg-white/20 py-2 px-4 rounded-2xl">
              Tailwind CSS
            </span>
            <span className="bg-white/20 py-2 px-4 rounded-2xl">
              HTML5 Canvas
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
