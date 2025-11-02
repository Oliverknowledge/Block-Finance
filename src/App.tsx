

import './App.css'
import Form from './Components/Form'

function App() {
  
  
  function logic(data: Record<string, string>){
    console.log(data)
  }
  return (
    <>
      <Form 
      fields={[
        { name: "email", label: "Email", type: "email" },
        { name: "password", label: "Password", type: "password" },
        { name: "username", label: "Username", type: "Username"}
      ]}
      onSubmit={(data) => logic(data)}
      />
    </>
  )
}

export default App
