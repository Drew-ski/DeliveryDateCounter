import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

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
  const [deliveryDates, setDeliveryDates] = useState<Array<{ speed: string; date: string; hasHoliday: boolean }>>([]);
  const [showHolidayMessage, setShowHolidayMessage] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

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
      { speed: '8-10 Business Days', days: 10 },
      { speed: '5-7 Business Days', days: 7 },
      { speed: '3-4 Business Days', days: 4 },
      { speed: '2 Business Days', days: 2 },
      { speed: 'Overnight (1 Business Day)', days: 1 },
    ];

    const dates = shippingSpeeds.map(({ speed, days }) => {
      const { deliveryDate, containsShippingHoliday } = calculateDeliveryDate(days);
      return {
        speed,
        date: formatDate(deliveryDate),
        hasHoliday: containsShippingHoliday,
      };
    });

    setDeliveryDates(dates);
    setShowHolidayMessage(dates.some(d => d.hasHoliday));
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className={`p-8 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="space-y-6">
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

              <div className="flex items-center justify-center gap-8 flex-wrap">
                {showDays && <TimeSegment value={timeLeft.days} label="Days" />}
                {showHours && <TimeSegment value={timeLeft.hours} label="Hours" />}
                <TimeSegment value={timeLeft.minutes} label="Minutes" />
                {showSeconds && <TimeSegment value={timeLeft.seconds} label="Seconds" />}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse" data-testid="table-shipping">
                <thead>
                  <tr>
                    <th className="bg-muted px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide border border-border">
                      Shipping Speed
                    </th>
                    {deliveryDates.map((item, idx) => (
                      <th key={idx} className="bg-muted px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide border border-border" data-testid={`header-${idx}`}>
                        {item.speed.split(' (')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-4 font-semibold border border-border bg-card">
                      Guaranteed Delivery On or Before
                    </td>
                    {deliveryDates.map((item, idx) => (
                      <td key={idx} className="px-4 py-4 text-center font-medium border border-border" data-testid={`delivery-date-${idx}`}>
                        {item.date}{item.hasHoliday && '*'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

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
