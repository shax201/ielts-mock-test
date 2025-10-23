'use client'

<<<<<<< HEAD
import { useState } from 'react'
import AdvancedTextEditor from './AdvancedTextEditor'
=======
import { useState, useEffect } from 'react'
>>>>>>> main

interface MatchingItem {
  id: string
  label: string
  content: string
}

<<<<<<< HEAD
interface MatchingQuestionEditorProps {
  leftItems: MatchingItem[]
  rightItems: MatchingItem[]
  onLeftItemsChange: (items: MatchingItem[]) => void
  onRightItemsChange: (items: MatchingItem[]) => void
}

export default function MatchingQuestionEditor({
  leftItems,
  rightItems,
  onLeftItemsChange,
  onRightItemsChange
}: MatchingQuestionEditorProps) {
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left')
=======
interface MatchingData {
  leftItems: MatchingItem[]
  rightItems: MatchingItem[]
}

interface MatchingQuestionEditorProps {
  data: MatchingData
  onChange: (data: MatchingData) => void
}

export default function MatchingQuestionEditor({ data, onChange }: MatchingQuestionEditorProps) {
  const [leftItems, setLeftItems] = useState<MatchingItem[]>(data.leftItems || [])
  const [rightItems, setRightItems] = useState<MatchingItem[]>(data.rightItems || [])

  useEffect(() => {
    onChange({ leftItems, rightItems })
  }, [leftItems, rightItems, onChange])
>>>>>>> main

  const addLeftItem = () => {
    const newItem: MatchingItem = {
      id: `left-${Date.now()}`,
<<<<<<< HEAD
      label: String.fromCharCode(65 + leftItems.length),
      content: ''
    }
    onLeftItemsChange([...leftItems, newItem])
=======
      label: `${leftItems.length + 1}`,
      content: ''
    }
    setLeftItems([...leftItems, newItem])
>>>>>>> main
  }

  const addRightItem = () => {
    const newItem: MatchingItem = {
      id: `right-${Date.now()}`,
<<<<<<< HEAD
      label: String(rightItems.length + 1),
      content: ''
    }
    onRightItemsChange([...rightItems, newItem])
  }

  const updateLeftItem = (id: string, content: string) => {
    onLeftItemsChange(
      leftItems.map(item => 
        item.id === id ? { ...item, content } : item
      )
    )
  }

  const updateRightItem = (id: string, content: string) => {
    onRightItemsChange(
      rightItems.map(item => 
        item.id === id ? { ...item, content } : item
      )
    )
  }

  const removeLeftItem = (id: string) => {
    onLeftItemsChange(leftItems.filter(item => item.id !== id))
  }

  const removeRightItem = (id: string) => {
    onRightItemsChange(rightItems.filter(item => item.id !== id))
=======
      label: String.fromCharCode(65 + rightItems.length),
      content: ''
    }
    setRightItems([...rightItems, newItem])
  }

  const updateLeftItem = (id: string, content: string) => {
    setLeftItems(leftItems.map(item => 
      item.id === id ? { ...item, content } : item
    ))
  }

  const updateRightItem = (id: string, content: string) => {
    setRightItems(rightItems.map(item => 
      item.id === id ? { ...item, content } : item
    ))
  }

  const removeLeftItem = (id: string) => {
    setLeftItems(leftItems.filter(item => item.id !== id))
  }

  const removeRightItem = (id: string) => {
    setRightItems(rightItems.filter(item => item.id !== id))
>>>>>>> main
  }

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('left')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'left'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Column A (Left Items)
        </button>
        <button
          onClick={() => setActiveTab('right')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'right'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Column B (Right Items)
        </button>
      </div>

      {/* Left Items Editor */}
      {activeTab === 'left' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Column A Items</h3>
            <button
              onClick={addLeftItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
=======
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Column A (Left Items)</h4>
            <button
              type="button"
              onClick={addLeftItem}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
>>>>>>> main
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </button>
          </div>
<<<<<<< HEAD

          <div className="space-y-3">
            {leftItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500">Item {index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeLeftItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <AdvancedTextEditor
                  data={item.content}
                  onChange={(data) => updateLeftItem(item.id, data)}
                  placeholder="Enter the left item content..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Items Editor */}
      {activeTab === 'right' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Column B Items</h3>
            <button
              onClick={addRightItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {rightItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500">Item {index + 1}</span>
                  </div>
                  <button
                    onClick={() => removeRightItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <AdvancedTextEditor
                  data={item.content}
                  onChange={(data) => updateRightItem(item.id, data)}
                  placeholder="Enter the right item content..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Column A</h4>
            <div className="space-y-2">
              {leftItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-gray-700">{item.content || 'Empty'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Column B</h4>
            <div className="space-y-2">
              {rightItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-gray-700">{item.content || 'Empty'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
=======
          
          <div className="space-y-3">
            {leftItems.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => updateLeftItem(item.id, e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={`Item ${index + 1} content`}
                />
                <button
                  type="button"
                  onClick={() => removeLeftItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Column B (Right Items)</h4>
            <button
              type="button"
              onClick={addRightItem}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {rightItems.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => updateRightItem(item.id, e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder={`Item ${String.fromCharCode(65 + index)} content`}
                />
                <button
                  type="button"
                  onClick={() => removeRightItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      {leftItems.length > 0 && rightItems.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">Preview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Column A</h5>
              <div className="space-y-2">
                {leftItems.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-blue-700">{item.content || `Item ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Column B</h5>
              <div className="space-y-2">
                {rightItems.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm text-blue-700">{item.content || `Item ${String.fromCharCode(65 + index)}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
>>>>>>> main
    </div>
  )
}
