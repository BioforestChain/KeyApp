import type { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect } from 'react'
import { AnimatedNumber, AnimatedAmount } from './animated-number'

const meta: Meta<typeof AnimatedNumber> = {
  title: 'Common/AnimatedNumber',
  component: AnimatedNumber,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number' },
      description: 'The number value to display',
    },
    decimals: {
      control: { type: 'number', min: 0, max: 18 },
      description: 'Decimal places to show',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    locale: {
      control: 'text',
      description: 'Formatting locale',
    },
  },
}

export default meta
type Story = StoryObj<typeof AnimatedNumber>

export const Default: Story = {
  args: {
    value: 10015.12345678,
    decimals: 8,
    loading: false,
  },
}

export const Loading: Story = {
  args: {
    value: 0,
    loading: true,
  },
}

export const SmallNumber: Story = {
  args: {
    value: 0.00012345,
    decimals: 8,
  },
}

export const LargeNumber: Story = {
  args: {
    value: 1234567.89012345,
    decimals: 8,
  },
}

export const WholeNumber: Story = {
  args: {
    value: 10000,
    decimals: 8,
  },
}

/**
 * Interactive demo showing the animation in action
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(10015)
    
    const randomize = () => {
      setValue(Math.random() * 100000)
    }
    
    const increment = () => {
      setValue(prev => prev + 1000)
    }
    
    const decrement = () => {
      setValue(prev => Math.max(0, prev - 1000))
    }
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl font-bold">
          <AnimatedNumber value={value} decimals={8} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={decrement}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            - 1000
          </button>
          <button
            onClick={randomize}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Random
          </button>
          <button
            onClick={increment}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            + 1000
          </button>
        </div>
      </div>
    )
  },
}

/**
 * Simulates loading data from an API
 */
export const LoadingToLoaded: Story = {
  render: () => {
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState(0)
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false)
        setValue(10015.12345678)
      }, 2000)
      return () => clearTimeout(timer)
    }, [])
    
    const reload = () => {
      setLoading(true)
      setValue(0)
      setTimeout(() => {
        setLoading(false)
        setValue(Math.random() * 100000)
      }, 2000)
    }
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-2xl">
          Balance: <AnimatedNumber value={value} loading={loading} decimals={8} />
        </div>
        <button
          onClick={reload}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Reload
        </button>
      </div>
    )
  },
}

/**
 * AnimatedAmount accepts string values
 */
export const WithStringValue: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-2">
        <div>
          From string: <AnimatedAmount value="10015.12345678" decimals={8} />
        </div>
        <div>
          From number: <AnimatedAmount value={10015.12345678} decimals={8} />
        </div>
      </div>
    )
  },
}

/**
 * Multiple numbers animating together
 */
export const MultipleNumbers: Story = {
  render: () => {
    const [values, setValues] = useState([1000, 5000, 10000, 50000])
    
    const randomize = () => {
      setValues(values.map(() => Math.random() * 100000))
    }
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-2 gap-4">
          {values.map((v, i) => (
            <div key={i} className="rounded border p-4 text-center">
              <div className="text-muted-foreground text-sm">Token {i + 1}</div>
              <div className="text-xl font-bold">
                <AnimatedNumber value={v} decimals={4} />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={randomize}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Randomize All
        </button>
      </div>
    )
  },
}

/**
 * Different decimal configurations
 */
export const DecimalVariants: Story = {
  render: () => {
    const value = 10015.12345678
    
    return (
      <div className="flex flex-col gap-2">
        <div>0 decimals: <AnimatedNumber value={value} decimals={0} /></div>
        <div>2 decimals: <AnimatedNumber value={value} decimals={2} /></div>
        <div>4 decimals: <AnimatedNumber value={value} decimals={4} /></div>
        <div>8 decimals (default): <AnimatedNumber value={value} decimals={8} /></div>
      </div>
    )
  },
}
