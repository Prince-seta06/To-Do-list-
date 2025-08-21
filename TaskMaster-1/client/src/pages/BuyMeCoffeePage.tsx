import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import { Button } from "@/components/ui/button";
import { Coffee, Heart, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "../lib/utils";

const BuyMeCoffeePage = () => {
  const [customAmount, setCustomAmount] = useState<number[]>([100]);
  const [showCustomDonation, setShowCustomDonation] = useState(false);

  const handleSliderChange = (value: number[]) => {
    setCustomAmount(value);
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Buy Me a Coffee" />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white shadow-md rounded-lg p-8 mb-6">
              <div className="flex justify-center mb-4">
                <Coffee className="h-16 w-16 text-amber-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Support TaskFlow</h2>
              <p className="text-gray-700 mb-6">
                If you find TaskFlow helpful for your productivity and project management needs, consider buying us a coffee! 
                Your support helps us maintain and improve the platform to better serve your needs.
              </p>
              
              {!showCustomDonation ? (
                <>
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      <Coffee className="mr-2 h-4 w-4" />
                      Buy 1 Coffee ({formatINR(100)})
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      <Coffee className="mr-2 h-4 w-4" />
                      Buy 3 Coffees ({formatINR(300)})
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      <Coffee className="mr-2 h-4 w-4" />
                      Buy 5 Coffees ({formatINR(500)})
                    </Button>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <Button 
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => setShowCustomDonation(true)}
                    >
                      <Heart className="mr-2 h-4 w-4" fill="white" />
                      Custom Donation
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mb-8 max-w-lg mx-auto">
                  <h3 className="text-lg font-medium mb-6">Choose your donation amount:</h3>
                  <div className="mb-6">
                    <Slider 
                      value={customAmount} 
                      onValueChange={handleSliderChange}
                      max={5000}
                      step={50}
                      min={50}
                      className="mb-2"
                    />
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">{formatINR(50)}</span>
                      <span className="text-sm text-gray-500">{formatINR(5000)}</span>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <span className="font-semibold">Amount:</span>
                      <Input
                        type="number"
                        value={customAmount[0]}
                        onChange={(e) => setCustomAmount([parseInt(e.target.value) || 50])}
                        min={50}
                        max={5000}
                        className="w-24 text-center"
                      />
                      <span className="font-semibold">INR</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCustomDonation(false)}
                    >
                      Cancel
                    </Button>
                    <Button className="bg-red-500 hover:bg-red-600">
                      <Heart className="mr-2 h-4 w-4" fill="white" />
                      Donate {formatINR(customAmount[0])}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-3">How Your Support Helps</h3>
                <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
                  <li>• Server maintenance and infrastructure costs</li>
                  <li>• Development of new features</li>
                  <li>• Continued improvements to user experience</li>
                  <li>• Community support and documentation</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Support & Contact</h3>
              <div className="flex flex-col md:flex-row md:gap-8 justify-center">
                <div className={cn(
                  "flex items-center gap-2 mb-3 md:mb-0",
                  "mx-auto md:mx-0"
                )}>
                  <Mail className="h-5 w-5 text-primary" />
                  <span>princeseta01@gmail.com</span>
                </div>
                <div className={cn(
                  "flex items-center gap-2",
                  "mx-auto md:mx-0"
                )}>
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Available: 9 AM - 5 PM IST</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-3">Other Ways to Support</h4>
                <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
                  <li>• Share TaskFlow with friends and colleagues</li>
                  <li>• Submit feedback and feature requests</li>
                  <li>• Report bugs or issues you encounter</li>
                  <li>• Write a review or testimonial</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BuyMeCoffeePage;