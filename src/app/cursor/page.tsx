export default function Home() {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">Cursor Examples</h1>
        <div className="space-y-8">
          <div className="p-4 border rounded">
            <p>Normal cursor area - should show the custom circle cursor</p>
          </div>
  
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me for pointer cursor</button>
  
          <div className="p-4 bg-gray-200 rounded w-64 cursor-grab">Grab cursor element</div>
  
          <textarea className="w-full p-4 border rounded" placeholder="Text cursor in this textarea" rows={3} />
  
          <div className="p-4 border rounded cursor-wait">Wait cursor area</div>
        </div>
      </main>
    )
  }
  
  