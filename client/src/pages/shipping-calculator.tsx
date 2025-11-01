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
  new Date("Nov 27, 2025"),  // Thanksgiving 2025
  new Date("Dec 25, 2025"),  // Christmas 2025
  new Date("Jan 1, 2026"),   // New Year's Day 2026
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

/**
 * Single source of truth: next shipping cutoff (noon ET on next business day).
 * This replaces using getShipDate() inside the countdown tick and prevents the
 * "total never goes negative" problem that blocked UI refreshes.
 */
function nextShippingCutoff(from: Date): Date {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  if (from.getHours() >= 12) d.setDate(d.getDate() + 1);
  while (isShippingHoliday(d) || isWeekend(d)) d.setDate(d.getDate() + 1);
  return d;
}

function formatDate(date: Date): string {
  const dayWithSuffix = ordinalSuffix(date.getDate());
  const dayName = date.toLocaleDateString("en-US", { weekday: 'long' });
  const monthName = date.toLocaleDateString("en-US", { month: 'long' });
  return `${dayName}, ${monthName} ${dayWithSuffix}`;
}

/**
 * Diff helper for countdown from a fixed deadline.
 */
function diff(now: Date, deadline: Date): TimeLeft {
  const t = deadline.getTime() - now.getTime();
  const days = Math.floor(t / 86400000);
  const hours = Math.floor((t % 86400000) / 3600000);
  const minutes = Math.floor((t % 3600000) / 60000);
  const seconds = Math.floor((t % 60000) / 1000);
  return { days, hours, minutes, seconds, total: t };
}

/**
 * Delivery date calculator that starts from a provided base ship date (the
 * same deadline the countdown uses), keeping the whole UI in sync.
 */
function calculateDeliveryDateFromBase(
  baseShipDate: Date,
  additionalDays: number
): { deliveryDate: Date; containsShippingHoliday: boolean } {
  const deliveryDate = new Date(baseShipDate);
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

// Keep the old name for backward compatibility in handleDateChange
function getShipDate(now: Date): Date {
  return nextShippingCutoff(now);
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function ShippingCalculator() {
  // New: track the deadline/cutoff explicitly and derive everything from it.
  const [deadline, setDeadline] = useState<Date>(() => nextShippingCutoff(getCurrentDate()));
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => diff(getCurrentDate(), nextShippingCutoff(getCurrentDate())));
  const [cutoffDate, setCutoffDate] = useState<string>(() => formatDate(nextShippingCutoff(getCurrentDate())));
  const [deliveryDates, setDeliveryDates] = useState<Array<{ speed: string; label: string; date: string; hasHoliday: boolean; days: number }>>([]);
  const [showHolidayMessage, setShowHolidayMessage] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [targetDate, setTargetDate] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('');

  // --- Dev/test time override ---
  const [timeOffset, setTimeOffset] = useState<number>(0);

  // helper: get current time (real or with offset applied)
  const getNow = () => {
    const realNow = getCurrentDate();
    if (timeOffset !== 0) {
      return new Date(realNow.getTime() + timeOffset);
    }
    return realNow;
  };

  const updateDeliveryDates = (base: Date) => {
    const shippingSpeeds = [
      { speed: 'Overnight', label: '1 Business Day', days: 1 },
      { speed: '2 Day', label: '2 Business Days', days: 2 },
      { speed: '3-4 Day', label: '3-4 Business Days', days: 4 },
      { speed: '5-7 Day', label: '5-7 Business Days', days: 7 },
      { speed: '8-10 Day', label: '8-10 Business Days', days: 10 },
    ];

    const dates = shippingSpeeds.map(({ speed, label, days }) => {
      const { deliveryDate, containsShippingHoliday } = calculateDeliveryDateFromBase(base, days);
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

    if (businessDaysNeeded < 1) {
      setRecommendation('Please select a future delivery date.');
      return;
    }

    const suitableOptions = shippingOptions.filter(option => option.maxDays <= businessDaysNeeded);

    if (suitableOptions.length > 0) {
      const slowestSuitable = suitableOptions[suitableOptions.length - 1];
      setRecommendation(`To ensure delivery by ${formattedDate}, we recommend ${slowestSuitable.name}.`);
    } else {
      setRecommendation(`Sorry, even Overnight shipping cannot guarantee delivery by ${formattedDate}. Please select a later date.`);
    }
  };

  useEffect(() => {
    // initial render
    updateDeliveryDates(deadline);
    setFadeIn(true);

    const interval = setInterval(() => {
      const now = getNow();
      const newDeadline = nextShippingCutoff(now);

      // detect rollover (e.g., noon or after weekend/holiday)
      if (newDeadline.getTime() !== deadline.getTime()) {
        setFadeIn(false);
        setTimeout(() => {
          setDeadline(newDeadline);
          setCutoffDate(formatDate(newDeadline));
          updateDeliveryDates(newDeadline);
          setTimeLeft(diff(now, newDeadline)); // Immediately set countdown with new deadline
          setFadeIn(true);
        }, 300);
      } else {
        // tick countdown against *current* deadline
        setTimeLeft(diff(now, deadline));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, timeOffset]);

  // when timeOffset changes, immediately refresh the UI as if time jumped
  useEffect(() => {
    if (timeOffset !== 0) {
      const now = getNow();
      const newDeadline = nextShippingCutoff(now);
      setDeadline(newDeadline);
      setCutoffDate(formatDate(newDeadline));
      updateDeliveryDates(newDeadline);
      setTimeLeft(diff(now, newDeadline));
    }
  }, [timeOffset]);

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

  // UX tweak:
  // - If >= 1 day left: show only Days (clean, simple display).
  // - If < 1 day: show Hours, Minutes, Seconds as usual.
  const showDays = timeLeft.days >= 1;
  const showHours = timeLeft.days === 0 && timeLeft.hours >= 1;
  const showMinutes = timeLeft.days === 0;
  const showSeconds = timeLeft.days === 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">

        {/* --- Developer test control --- */}
        <div className="mb-4 border border-border rounded-md p-3 bg-muted/30" data-testid="dev-time-control">
          <label className="block text-sm font-medium mb-1">🧪 Simulate Current Time (for testing - countdown will tick from this time)</label>
          <input
            type="datetime-local"
            className="border rounded p-1 text-sm w-full"
            data-testid="input-manual-time"
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const selectedTime = new Date(val);
                const realNow = getCurrentDate();
                const offset = selectedTime.getTime() - realNow.getTime();
                setTimeOffset(offset);
              } else {
                setTimeOffset(0);
              }
            }}
          />
        </div>

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
                <h2 className="text-xl font-semibold" data-testid="text-order-within">Place order within:</h2>
              </div>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                {showDays && <TimeSegment value={timeLeft.days} label="Days" />}
                {showHours && <TimeSegment value={timeLeft.hours} label="Hours" />}
                {showMinutes && <TimeSegment value={timeLeft.minutes} label="Minutes" />}
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
