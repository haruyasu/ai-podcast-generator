import React, { useState } from 'react'
import axios from 'axios'
import { Mic } from 'lucide-react'

function App() {
  const [topic, setTopic] = useState('')
  const [numArticles, setNumArticles] = useState(3)
  const [listenerMessage, setListenerMessage] = useState('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)

  const generatePodcast = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/generate_podcast', {
        topic,
        num_articles: numArticles,
        listener_message: listenerMessage
      })
      setScript(response.data.script)
    } catch (error) {
      console.error('Error generating podcast:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <Mic className="h-14 w-14 text-cyan-500" />
              <div className="text-2xl font-bold">AI ポッドキャストジェネレーター</div>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">トピック</label>
                  <input
                    type="text"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="AIに関するトピック"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">記事数</label>
                  <input
                    type="number"
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    value={numArticles}
                    onChange={(e) => setNumArticles(parseInt(e.target.value))}
                    min="1"
                    max="5"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">リスナーからのメッセージ</label>
                  <textarea
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    rows={3}
                    placeholder="リスナーからのメッセージ（任意）"
                    value={listenerMessage}
                    onChange={(e) => setListenerMessage(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="pt-4 flex items-center space-x-4">
                <button
                  className="bg-cyan-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                  onClick={generatePodcast}
                  disabled={loading}
                >
                  {loading ? '生成中...' : 'ポッドキャスト原稿を生成'}
                </button>
              </div>
            </div>
            {script && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">生成された原稿:</h3>
                <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">{script}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App