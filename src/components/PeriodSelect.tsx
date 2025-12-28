import { Calendar } from 'lucide-react'

export type PeriodOption = 'current-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all'

interface PeriodSelectProps {
    period: PeriodOption
    onPeriodChange: (period: PeriodOption) => void
}

const PeriodSelect = ({ period, onPeriodChange }: PeriodSelectProps) => {
    const periodOptions = [
        { value: 'current-month' as PeriodOption, label: 'Mês Atual' },
        { value: 'last-3-months' as PeriodOption, label: 'Últimos 3 Meses' },
        { value: 'last-6-months' as PeriodOption, label: 'Últimos 6 Meses' },
        { value: 'last-12-months' as PeriodOption, label: 'Últimos 12 Meses' },
        { value: 'all' as PeriodOption, label: 'Todos os Períodos' },
    ]

    return (
        <div className='flex items-center gap-2 bg-gray-900 rounded-lg p-3 border border-gray-700'>
            <Calendar className="w-4 h-4 text-gray-400" />
            <label htmlFor='period-select' className='sr-only'>Selecionar Período</label>
            <select
                value={period}
                onChange={(e) => onPeriodChange(e.target.value as PeriodOption)}
                id='period-select'
                className='bg-gray-800 border border-gray-700 rounded-md py-1 px-3 text-sm font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer'
            >
                {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default PeriodSelect

