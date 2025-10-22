'use client'

import { useState } from 'react'
import AdvancedTextEditor from './AdvancedTextEditor'

interface MatchingItem {
  id: string
  label: string
  content: string
}

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

  const addLeftItem = () => {
    const newItem: MatchingItem = {
      id: `left-${Date.now()}`,
      label: String.fromCharCode(65 + leftItems.length),
      content: ''
    }
    onLeftItemsChange([...leftItems, newItem])
  }

  const addRightItem = () => {
    const newItem: MatchingItem = {
      id: `right-${Date.now()}`,
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
  }

  return (
    <div className="space-y-6">
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
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </button>
          </div>

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
    </div>
  )
}
