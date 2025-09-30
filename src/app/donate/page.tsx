/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { ArrowLeft, Heart, Code, Zap, Github, GitPullRequestArrowIcon, TelescopeIcon, MoonStarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import Image from 'next/image';

const DonatePage = () => {

    
  const stripeLink = "https://buy.stripe.com/3cIeVdaf56Gk4jhdPS9Ve01"; 

useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    return () => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
       <div className="text-center mb-12">
  <div className="inline-flex items-center justify-center -mb-2 md:mb-6">
    <Image 
      src="/images/render.png"
      alt="Project LAZARUS Logo"
      width={280}
      height={280}
      className="rounded-none"
    />
  </div>
  <h1 className="hidden md:block text-4xl tracking-tight md:text-4xl font-medium mb-2"><span className='font-light text-2xl'>Project </span><span className='tracking-widest font-light pl-1'>L.A.Z.A.R.U.S</span></h1>
  {/* <p className="text-sm text-neutral-400 md:text-lg">
    &quot;I&apos;ve got kids, professor - Joseph A. Cooper&quot;
  </p> */}
<p className="hidden md:block text-sm text-neutral-400 md:text-lg tracking-normal">
    Dedicated to the brave men and women who gave their lives so we could begin again
  </p>
 
</div>

        {/* Mission Statement */}
        <div className="bg-neutral-950 rounded-none p-8 mb-8 border border-dashed border-neutral-800">
     
          <p className="text-neutral-300 leading-relaxed mb-4 text-justify">
            Project L.A.Z.A.R.U.S is a free, open-source educational tool that brings general relativity 
            and astrophysics to life through interactive real-time simulations. I believe that 
            complex scientific concepts should be accessible to everyone—students, educators, 
            enthusiasts, and curious minds alike.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            All of the source-code is freely available. No paywalls, no premium features, no ads. 
            Just pure science visualization powered by physics and mathematics.
          </p>
        </div>

        {/* Why Donate Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Why Support This Project?</h2>
          <div className="grid gap-4">
            <FeatureCard 
              icon={<GitPullRequestArrowIcon className="w-6 h-6" strokeWidth={1.3} />}
              title="Free & Open-Source"
              description="The entire codebase remains free and open. Your support ensures there's no need to monetize through paywalls or restrictive licenses."
            />
            <FeatureCard 
              icon={<TelescopeIcon className="w-6 h-6" strokeWidth={1.3} />}
              title="Active Development"
              description="Donations fund hosting costs, development time, and new amazing features like additional gravitational phenomena, improved rendering, and educational content."
            />
            <FeatureCard 
              icon={<Github className="w-6 h-6" strokeWidth={1.3} />}
              title="Community Driven"
              description="Supporting this project helps maintain documentation, fix bugs, and respond to community feedback to make the simulations better for everyone."
            />
          </div>
        </div>

     

        {/* CTA */}
        <div className="text-center">
          <a href={stripeLink} target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg" 
              variant={"default"}
              className=" font-semibold px-8 py-6 text-lg"
            >
              <TelescopeIcon className="w-5 h-5 mr-2" />
              Support Project L.A.Z.A.R.U.S
            </Button>
          </a>
          <p className="text-sm text-neutral-400 md:text-sm mt-4">
    &quot;I&apos;ve got kids, professor - Joseph A. Cooper&quot;
  </p>
        </div>

        {/* Alternative Support */}
       <div className="mt-4 text-center border-t border-neutral-800 pt-8">
  <h3 className="text-lg font-semibold mb-3">Other Ways to Support</h3>
  <p className="text-neutral-400 mb-4">
    Can&apos;t donate? You can still help by:
  </p>
  <div className="flex flex-wrap justify-center gap-3 text-sm">
  <a 
    href="https://github.com/berloop/endurance"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-neutral-950 px-4 py-2 rounded-none hover:bg-neutral-900 transition-colors cursor-pointer flex items-center gap-2"
  >
    <MoonStarIcon className="w-4 h-4" />
    Star on GitHub
  </a>
</div>
</div>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="bg-neutral-950 rounded-xs p-6 border border-dashed border-neutral-800 flex gap-4">
    <div className="shrink-0 w-12 h-12 bg-none rounded-none border border-green-500 flex items-center justify-center text-green-500">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
    </div>
  </div>
);

export default DonatePage;