import './index.css'
import './App.css'
import Navbar from './Components/Navbar'
import { CandleStickChart } from './Components/TradingChart'
function App() {
  return (
    <div>
      <div>
      <Navbar/>
      </div>
      <div className="h-[400px] w-full flex-1bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 ">Crypto Trading Simulator</h1>
      <CandleStickChart/>
    </div>
    </div>
  )
}

export default App
