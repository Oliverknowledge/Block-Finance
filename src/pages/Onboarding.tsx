import React, { useEffect, useState } from 'react'
import { AlertTriangle, Shield, TrendingUp, Brain } from 'lucide-react'
import Button from '../Components/Button'
import Tooltip from '../Components/Tooltip'
import {  useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UpdateSkillLevel from '../utils/UpdateSkillLevel'
import onboardCheck from '../utils/onboardcheck'

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [onboarded, setOnboarded] = useState(false);
  useEffect(() => {
    // Check if user exists before calling onboardCheck
    if (!user) return;
    // Call the onboardCheck function and update the onboarded state  
    onboardCheck(user).then(setOnboarded);
  
  }
, [user]);
if (onboarded) {
    navigate('/Dashboard');
    }
    //User initially starts at the first sec    tion, then increments as they proceed
  const [currentSection, setCurrentSection] = useState(0)
  // User's selected skill level at the end of the form (passed into database after onboarding is complete)
  const [skillLevel, setSkillLevel] = useState('')
  // Track which acknowledgments the user has checked
  const [acknowledged, setAcknowledged] = useState({
    risks: false,
    scams: false
  })
                                                                                                                     

  const sections = [
    {
      title: "Understanding Financial Risks",
      icon: <TrendingUp className="w-12 h-12 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold ">Security & Financial Risks</h3>
          <div className="space-y-3 text-gray-800">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Volatility
              </h4>
              <p className="text-sm">Cryptocurrency prices can fluctuate dramatically within hours. You may lose a significant portion of your investment quickly.</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 ">
                <Tooltip text = "Staking lock-up periods are when you agree to keep your digital money in a special online pot for a set amount of time." position = "top">
                <h4 className="font-semibold ">Staking Lock-Up Periods</h4>
                </Tooltip>

              <p className="text-sm mt-3">When staking, your funds may be locked for days, weeks, or months. You cannot access or sell them during this period, even if prices drop.</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Loss of Access
              </h4>
              <p className="text-sm">
                If you lose your <Tooltip text="Private keys are secret codes that prove you own your cryptocurrency. They're like a password that can never be reset." position = "bottom">private keys</Tooltip> or <Tooltip text="A seed phrase is a list of 12-24 words that can restore access to your wallet. Write it down and store it safely offline.">seed phrase</Tooltip>, your crypto is gone forever. There's no customer service to recover it.
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold mb-2">Regulatory Risk</h4>
              <p className="text-sm">Cryptocurrency regulations are evolving. Changes in laws could impact your holdings or ability to trade.</p>
            </div>
          </div>
          
          <label className="flex items-center gap-2 mt-6 cursor-pointer">
            <input 
              type="checkbox" 
              checked={acknowledged.risks}
              onChange={(e) => setAcknowledged({...acknowledged, risks: e.target.checked})}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium ">I understand these financial risks</span>
          </label>
        </div>
      )
    },
    {
      title: "Avoiding Crypto Scams",
      icon: <Shield className="w-12 h-12 text-red-500" />,
      content: (
        <div className="space-y-4">
        <h3 className="text-xl font-semibold ">How Scams Work & How to Stay Safe</h3>
        <div className="space-y-3 text-gray-700">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold mb-2 text-red-800">Common Scam Types</h4>
            <ul className="text-sm space-y-1">
              <li>Fake tokens promising guaranteed returns</li>
              <li>Phishing websites that steal your credentials</li>
              <li>Impersonators pretending to be support staff</li>
              <li>Pump and dump schemes on unknown coins</li>
              <li>"Giveaway" scams asking you to send crypto first</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold mb-2 text-green-800">How to Protect Yourself</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Stick to established coins</strong> - Avoid brand new tokens with no track record</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>If it seems too good to be true, it is</strong> - No legitimate investment guarantees 10x returns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Never share your private keys</strong> - No legitimate service will ever ask for them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Double-check URLs</strong> - Scammers create fake websites that look real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Research before investing</strong> - Read reviews, check communities, verify projects</span>
              </li>
            </ul>
          </div>
        </div>
        
        <label className="flex items-center gap-2 mt-6 cursor-pointer">
          <input 
            type="checkbox" 
            checked={acknowledged.scams}
            onChange={(e) => setAcknowledged({...acknowledged, scams: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium ">I understand how to avoid scams</span>
        </label>
        </div>
      )
    },
    {
      title: "Your Experience Level",
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      content: (
        <div className="space-y-4">
        <h3 className="text-xl font-semibold ">Tell us about your crypto experience</h3>
        <p className=" text-sm">This helps us tailor your experience and provide appropriate guidance.</p>
        
        <div className="space-y-3 mt-6">
          <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer  transition-colors">
            <input 
              type="radio" 
              name="skillLevel" 
              value="beginner"
              checked={skillLevel === 'beginner'}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-semibold ">Beginner</div>
              <div className="text-sm ">I'm new to cryptocurrency and blockchain technology</div>
            </div>
          </label>
          
          <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer  transition-colors">
            <input 
              type="radio" 
              name="skillLevel" 
              value="intermediate"
              checked={skillLevel === 'intermediate'}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-semibold ">Intermediate</div>
              <div className="text-sm ">I've traded or held crypto before and understand the basics</div>
            </div>
          </label>
          

        </div>
      </div>

    )
    }
  ]

  const canProceed = () => {
    if (currentSection === 0) return acknowledged.risks
    if (currentSection === 1) return acknowledged.scams
    if (currentSection === 2) return skillLevel !== ''
    return true
  }

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      // Onboarding complete (will insert function to handle updating the database)
      UpdateSkillLevel(user, skillLevel).then((success) => {
        if (success) {
          // Redirect to dashboard after successful onboarding
          navigate('/Dashboard')
        } else {
          // Handle error (e.g., show a notification)
          console.log('Error updating onboarding status')
        }
      })
    }
  }

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl  p-8">
          <div className="flex items-center justify-between mb-8">
            {sections.map((_, index) => (
              <React.Fragment key={index}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                //If index is less than or equal to currentSection, apply completed styles
                  index <= currentSection 
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {/* Two bars that show progress, index < sections.length -1 so that it doesn't show another bar for the last item*/}
                {index < sections.length - 1 && (
                  <div className={`flex-1 h-1 mx-3 ${
                    index < currentSection ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex flex-col items-center mb-8">
            {sections[currentSection].icon}
            <h2 className="text-2xl font-bold  mt-4">
              {sections[currentSection].title}
            </h2>
          </div>
        <div className = "mt-10">
            {sections[currentSection].content}   
        </div>
         {/* Section buttons*/}
         <div className="flex justify-between items-center pt-6 ">
            <Button
                type = "button"
                size = "md"
              onClick={() => setCurrentSection( currentSection - 1)}
              disabled={currentSection === 0}
            variant = "primary">
              Back
            </Button>
            
            <Button
                type = "button"
                size = "md"
                variant = "secondary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentSection === sections.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding