export const TEST_ITEMS = [
  // Flexibility
  { component: 'Flexibility', test_item: 'Sit and Reach',               unit: 'cm',      lower_is_better: false },
  { component: 'Flexibility', test_item: 'Shoulder & Wrist Test',        unit: 'degrees', lower_is_better: false },
  { component: 'Flexibility', test_item: 'Trunk Flexion',                unit: 'cm',      lower_is_better: false },
  { component: 'Flexibility', test_item: 'Shoulder Static Flexibility',  unit: 'cm',      lower_is_better: false },
  { component: 'Flexibility', test_item: 'Split Flex',                   unit: '%',       lower_is_better: false },
  { component: 'Flexibility', test_item: 'Static Flexibility Shoulder',  unit: 'cm',      lower_is_better: false },
  // Balance
  { component: 'Balance', test_item: 'Modified Bass Test',     unit: 'points',  lower_is_better: false },
  { component: 'Balance', test_item: 'Single Leg Eyes Closed', unit: 'seconds', lower_is_better: false },
  // Speed
  { component: 'Speed', test_item: '20m Speed Test', unit: 'seconds', lower_is_better: true },
  { component: 'Speed', test_item: '30m Fly',        unit: 'seconds', lower_is_better: true },
  { component: 'Speed', test_item: '30m Standing',   unit: 'seconds', lower_is_better: true },
  // Power Upper Body
  { component: 'Power Upper Body', test_item: 'MB Back Throw',  unit: 'meters', lower_is_better: false },
  { component: 'Power Upper Body', test_item: 'MB Chest Throw', unit: 'meters', lower_is_better: false },
  { component: 'Power Upper Body', test_item: 'MB Side Throw',  unit: 'meters', lower_is_better: false },
  // Power Lower Body
  { component: 'Power Lower Body', test_item: 'Standing Board Jump', unit: 'meters', lower_is_better: false },
  { component: 'Power Lower Body', test_item: '3 HOP',               unit: '× TB',   lower_is_better: false },
  { component: 'Power Lower Body', test_item: 'Vertical Jump',       unit: 'cm',     lower_is_better: false },
  // Agility
  { component: 'Agility', test_item: 'Hurdle Jump 1 min',  unit: 'reps',    lower_is_better: false },
  { component: 'Agility', test_item: '4 Cone Agility',     unit: 'seconds', lower_is_better: true },
  { component: 'Agility', test_item: 'Shuttle Run',         unit: 'seconds', lower_is_better: true },
  { component: 'Agility', test_item: 'Badminton Agility',   unit: 'seconds', lower_is_better: true },
  { component: 'Agility', test_item: 'Wrestling Agility',   unit: 'seconds', lower_is_better: true },
  { component: 'Agility', test_item: 'T Test',              unit: 'seconds', lower_is_better: true },
  // Core Strength
  { component: 'Core Strength', test_item: '12 Level Core Strength', unit: 'level',   lower_is_better: false },
  { component: 'Core Strength', test_item: 'Plank 6 Minutes',        unit: 'minutes', lower_is_better: false },
  // Muscle Endurance
  { component: 'Muscle Endurance', test_item: 'Push Up',                unit: 'reps',    lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'Sit Up',                 unit: 'reps',    lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'Pull Up',                unit: 'reps',    lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'Inverted Pull Up',       unit: 'reps',    lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'CKCU Extremity',         unit: 'touch',   lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'Single Leg Wall Sit',    unit: 'seconds', lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'Body Weight Squat 2min', unit: 'reps',    lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'Single Leg Squat',       unit: 'reps',    lower_is_better: false },
  { component: 'Muscle Endurance', test_item: 'One Handed Hang',        unit: 'seconds', lower_is_better: false },
]

export function calculatePercentage(
  resultValue: number,
  benchmarkValue: number,
  lowerIsBetter: boolean
): number | null {
  if (!resultValue || !benchmarkValue) return null
  if (lowerIsBetter) {
    return Math.round((benchmarkValue / resultValue) * 10000) / 100
  }
  return Math.round((resultValue / benchmarkValue) * 10000) / 100
}

export function calculatePPI(percentages: (number | null)[]): number {
  const valid = percentages.filter((p): p is number => p !== null && p > 0)
  if (!valid.length) return 0
  return Math.round((valid.reduce((s, p) => s + p, 0) / valid.length) * 100) / 100
}

export function calcPowerWatt(weightKg: number, timeSec: number, distance = 35): number {
  if (!timeSec) return 0
  return Math.round(weightKg * Math.pow(distance / timeSec, 3) / distance * 1000) / 1000
}

export function calcFatigueIndex(powers: number[], totalTime: number): number {
  if (!powers.length || !totalTime) return 0
  return Math.round(((Math.max(...powers) - Math.min(...powers)) / totalTime) * 10000) / 10000
}

export function calcVO2max(mas: number, age: number): number {
  const kmh = mas * 3.6
  return Math.max(0, Math.round((31.025 + (3.238 * kmh) - (3.248 * age) + (0.1536 * kmh * age)) * 100) / 100)
}

export function getPPICategory(ppi: number): { label: string; color: string } {
  if (ppi >= 90) return { label: 'Excellent',     color: '#1D9E75' }
  if (ppi >= 75) return { label: 'Good',          color: '#3B82F6' }
  if (ppi >= 60) return { label: 'Average',       color: '#F59E0B' }
  if (ppi >= 45) return { label: 'Below Average', color: '#F97316' }
  return                { label: 'Poor',          color: '#EF4444' }
}

export function groupByComponent(items: typeof TEST_ITEMS) {
  const groups: Record<string, typeof TEST_ITEMS> = {}
  for (const item of items) {
    if (!groups[item.component]) groups[item.component] = []
    groups[item.component].push(item)
  }
  return groups
}
