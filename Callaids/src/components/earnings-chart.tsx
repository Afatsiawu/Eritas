'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { subDays, format } from 'date-fns';

const chartConfig = {
  earnings: {
    label: 'Earnings (GH₵)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


const generateMockData = (empty: boolean) => {
    const data = [];
    const today = new Date();
    for(let i=6; i>=0; i--) {
        const date = subDays(today, i);
        data.push({
            day: format(date, 'E'),
            earnings: empty ? 0 : Math.floor(Math.random() * (200 - 50 + 1) + 50)
        });
    }
    return data;
}

export default function EarningsChart({ empty = false }: { empty?: boolean }) {
  const chartData = generateMockData(empty);
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis 
          tickFormatter={(value) => `GH₵${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="earnings" fill="var(--color-earnings)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
