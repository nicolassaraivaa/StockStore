import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthYearSelectProps {
    month: number
    year: number
    onMonthChange: (month: number) => void
    onYearChange: (year: number) => void
}

const monthNames: readonly string[] = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
];

const MonthYearSelect = ({ month, year, onMonthChange, onYearChange }: MonthYearSelectProps) => {
    const currentYear = new Date().getFullYear();
    const years: number[] = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i)

    const handleNextMonth = (): void => {
        if (month === 12) {
            onMonthChange(1);
            onYearChange(year + 1);
        } else {
            onMonthChange(month + 1);
        }
    };

    const handlePrevMonth = (): void => {
        if (month === 1) {
            onMonthChange(12)
            onYearChange(year - 1)
        } else {
            onMonthChange(month - 1)
        }
    };

    return (
        <div className='flex items-center justify-between bg-gray-900 rounded-lg p-3 border border-gray-700'>
            <button
                onClick={handlePrevMonth}
                type='button'
                className='p-2 rounded-full hover:bg-gray-800 hover:text-primary-500 transition-colors cursor-pointer mr-2' aria-label='Mês anterior'
            >
                <ChevronLeft />
            </button>

            <div className='flex gap-4'>
                <label htmlFor='month-select' className='sr-only'>Selecionar Mês</label>
                <select
                    value={month}
                    onChange={(e) => onMonthChange(Number(e.target.value))}
                    id='month-select'
                    className='bg-gray-800 border border-gray-700 rounded-md py-1 text-sm font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer '
                >
                    {monthNames.map((name, index) => (
                        <option key={index} value={index + 1}>{name}</option>
                    ))}
                </select>

                <label htmlFor='year-select' className='sr-only'>Selecionar Ano</label>
                <select
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    value={year}
                    id='year-select'
                    className='bg-gray-800 border border-gray-700 rounded-md py-1 text-sm font-medium text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer'
                >
                    {years.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleNextMonth}
                type='button'
                className='p-2 rounded-full hover:bg-gray-800 hover:text-primary-500 transition-colors cursor-pointer ml-2' aria-label='Proximo Mês'
            >
                <ChevronRight />
            </button>

        </div>
    )
}

export default MonthYearSelect