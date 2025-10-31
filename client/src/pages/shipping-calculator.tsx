import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, Package, Calendar } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

const shippingHolidays = [
  new Date("Nov 23, 2023"),
  new Date("Dec 25, 2023"),
  new Date("Jan 1, 2024")
];

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getCurrentDate(): Date {
  const userTime = new Date();
  const nyTime = new Date(userTime.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return nyTime;
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 6 || date.getDay() === 0;
}

function isShippingHoliday(date: Date): boolean {
  for (const holiday of shippingHolidays) {
    if (holiday.getDate() === date.getDate()
      && holiday.getMonth() === date.getMonth()
      && holiday.getFullYear() === date.getFullYear()) {
      return true;
    }
  }
  return false;
}

function getShipDate(now: Date): Date {
  const shipDate = new Date(now);
  shipDate.setHours(12, 0, 0, 0);

  if (now.getHours() >= 12) {
    shipDate.setDate(shipDate.getDate() + 1);
  }

  while (isShippingHoliday(shipDate) || isWeekend(shipDate)) {
    shipDate.setDate(shipDate.getDate() + 1);
  }

  return shipDate;
}

function formatDate(date: Date): string {
  const dayWithSuffix = ordinalSuffix(date.getDate());
  const dayName = date.toLocaleDateString("en-US", { weekday: 'long' });
  const monthName = date.toLocaleDateString("en-US", { month: 'long' });
  return `${dayName}, ${monthName} ${dayWithSuffix}`;
}

function calculateDeliveryDate(additionalDays: number): { deliveryDate: Date; containsShippingHoliday: boolean } {
  const now = getCurrentDate();
  const deliveryDate = getShipDate(now);
  let containsShippingHoliday = false;

  while (additionalDays > 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const shippingHoliday = isShippingHoliday(deliveryDate);
    if (shippingHoliday) {
      containsShippingHoliday = true;
    }
    const weekend = isWeekend(deliveryDate);
    if (!shippingHoliday && !weekend) {
      additionalDays--;
    }
  }

  return { deliveryDate, containsShippingHoliday };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function ShippingCalculator() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [cutoffDate, setCutoffDate] = useState<string>('');
  const [deliveryDates, setDeliveryDates] = useState<Array<{ speed: string; label: string; date: string; hasHoliday: boolean; days: number }>>([]);
  const [showHolidayMessage, setShowHolidayMessage] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [targetDate, setTargetDate] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('');

  const calculateTimeLeft = (): TimeLeft => {
    const now = getCurrentDate();
    const deadline = getShipDate(now);
    const t = deadline.getTime() - now.getTime();

    const days = Math.floor((t / (1000 * 60 * 60 * 24)));
    const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((t % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: t };
  };

  const updateDeliveryDates = () => {
    const shippingSpeeds = [
      { speed: 'Overnight', label: '1 Business Day', days: 1 },
      { speed: '2 Day', label: '2 Business Days', days: 2 },
      { speed: '3-4 Day', label: '3-4 Business Days', days: 4 },
      { speed: '5-7 Day', label: '5-7 Business Days', days: 7 },
      { speed: '8-10 Day', label: '8-10 Business Days', days: 10 },
    ];

    const dates = shippingSpeeds.map(({ speed, label, days }) => {
      const { deliveryDate, containsShippingHoliday } = calculateDeliveryDate(days);
      return {
        speed,
        label,
        date: formatDate(deliveryDate),
        hasHoliday: containsShippingHoliday,
        days,
      };
    });

    setDeliveryDates(dates);
    setShowHolidayMessage(dates.some(d => d.hasHoliday));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    setTargetDate(inputDate);

    if (!inputDate) {
      setRecommendation('');
      return;
    }

    const dateParts = inputDate.split('-');
    if (dateParts.length !== 3) {
      setRecommendation('');
      return;
    }

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      setRecommendation('');
      return;
    }

    const target = new Date(year, month - 1, day, 12, 0, 0);

    if (isNaN(target.getTime())) {
      setRecommendation('');
      return;
    }

    const now = getCurrentDate();
    const shipDate = getShipDate(now);

    if (target <= shipDate) {
      setRecommendation('Please select a future delivery date.');
      return;
    }

    let businessDaysNeeded = 0;
    let currentDate = new Date(shipDate);

    while (currentDate < target) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (!isWeekend(currentDate) && !isShippingHoliday(currentDate)) {
        businessDaysNeeded++;
      }
    }

    const formattedDate = target.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    const shippingOptions = [
      { name: 'Overnight shipping', maxDays: 1 },
      { name: '2 Day shipping', maxDays: 2 },
      { name: '3-4 Day shipping', maxDays: 4 },
      { name: '5-7 Day shipping', maxDays: 7 },
      { name: '8-10 Day shipping', maxDays: 10 },
    ];

    const suitableOption = shippingOptions.find(option => option.maxDays >= businessDaysNeeded);

    if (suitableOption) {
      setRecommendation(`To ensure delivery by ${formattedDate}, we recommend ${suitableOption.name}.`);
    } else {
      setRecommendation(`Great news! All shipping options will arrive before ${formattedDate}.`);
    }
  };

  useEffect(() => {
    const updateCutoffDate = () => {
      const now = getCurrentDate();
      const orderBeforeDate = getShipDate(now);
      setCutoffDate(formatDate(orderBeforeDate));
    };

    updateCutoffDate();
    updateDeliveryDates();
    setFadeIn(true);

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      
      if (newTimeLeft.total < 0) {
        setFadeIn(false);
        setTimeout(() => {
          updateCutoffDate();
          updateDeliveryDates();
          setTimeLeft(calculateTimeLeft());
          setFadeIn(true);
        }, 300);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimeSegment = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-1" data-testid={`countdown-${label.toLowerCase()}`}>
      <div className="text-5xl font-bold text-primary tabular-nums min-w-[80px] text-center" data-testid={`text-${label.toLowerCase()}`}>
        {value}
      </div>
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider" data-testid={`label-${label.toLowerCase()}`}>
        {value === 1 ? label.slice(0, -1) : label}
      </div>
    </div>
  );

  const showDays = timeLeft.days >= 1;
  const showHours = timeLeft.hours >= 1 || timeLeft.days > 0;
  const showSeconds = timeLeft.days === 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className={`p-6 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <p className="text-base text-foreground" data-testid="text-shipping-details">
                Orders placed before <span className="font-semibold">12:00pm E.S.T.</span> on{' '}
                <span className="font-semibold" data-testid="text-cutoff-date">{cutoffDate}</span> with offered shipping speeds will arrive on or before listed delivery dates.
              </p>
            </div>

            <div className="bg-card border border-card-border rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold" data-testid="text-order-within">Order within:</h2>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                {showDays && <TimeSegment value={timeLeft.days} label="Days" />}
                {showHours && <TimeSegment value={timeLeft.hours} label="Hours" />}
                <TimeSegment value={timeLeft.minutes} label="Minutes" />
                {showSeconds && <TimeSegment value={timeLeft.seconds} label="Seconds" />}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Guaranteed Delivery Timeline</h3>
              </div>

              <div className="relative">
                <div className="relative overflow-hidden rounded-md">
                  <div className="overflow-x-auto scrollbar-hide md:overflow-visible relative" style={{ 
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none' 
                  }}>
                    <div className="min-w-[800px] md:min-w-0 px-4 py-3">
                      <div className="relative">
                        <div className="grid grid-cols-5">
                          {deliveryDates.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center px-2" data-testid={`timeline-item-${idx}`}>
                              <div className="text-center mb-3 min-h-[2.5rem] flex items-center justify-center">
                                <div className="text-sm font-semibold text-foreground" data-testid={`speed-${idx}`}>
                                  {item.label}
                                </div>
                              </div>

                              <div className="relative w-full flex justify-center items-center" style={{ height: '8px' }}>
                                <div className="relative z-10 w-2 h-2 rounded-full bg-primary" data-testid={`dot-${idx}`} />
                              </div>

                              <div className="text-center mt-3">
                                <div className="text-sm font-medium text-foreground" data-testid={`delivery-date-${idx}`}>
                                  {item.date}{item.hasHoliday && '*'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="absolute left-[10%] right-[10%] h-0.5 bg-border" style={{ top: 'calc(2.5rem + 0.75rem + 3px)' }} />
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-0 top-0 bottom-[2.5rem] w-8 bg-gradient-to-r from-card to-transparent pointer-events-none md:hidden" />
                  <div className="absolute right-0 top-0 bottom-[2.5rem] w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden" />
                </div>
                
                <div className="flex justify-center mt-2 md:hidden">
                  <div className="text-xs text-muted-foreground">← Scroll for more →</div>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="date-calculator" className="border-none">
                <AccordionTrigger className="hover-elevate rounded-lg px-4 py-3 hover:no-underline" data-testid="button-date-calculator">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Find shipping speed by delivery date</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label htmlFor="target-date" className="text-sm font-medium text-foreground">
                        When do you need your package?
                      </label>
                      <Input
                        id="target-date"
                        type="date"
                        value={targetDate}
                        onChange={handleDateChange}
                        className="w-full"
                        data-testid="input-target-date"
                      />
                    </div>
                    {recommendation && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3" data-testid="text-recommendation">
                        <p className="text-sm font-medium text-foreground">{recommendation}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {showHolidayMessage && (
              <p className="text-sm text-muted-foreground italic text-right" data-testid="text-holiday-message">
                *A shipping holiday has been accounted for in this timeline
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
